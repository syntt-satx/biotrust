import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  UserRole, 
  UserStatus, 
  Species, 
  BiodiversityRecord, 
  DNASample, 
  ResearchPaper, 
  VerificationReview, 
  ConservationProject, 
  ThreatProposal, 
  NotificationItem, 
  AuditLogEntry, 
  WatchlistSubscription, 
  ThreatLevel, 
  LocationData,
  MaskedLocationData
} from '../types/index.js';
import { JsonStore } from '../storage/JsonStore.js';
import { TrustScoreCalculator } from '../patterns/TrustScoreCalculator.js';
import { ExpertiseBasedReviewerStrategy } from '../patterns/ReviewerAssignmentStrategy.js';
import { SensitiveLocationProtection } from '../patterns/SensitiveLocationProtection.js';
import { DuplicateConflictDetector } from '../patterns/DuplicateConflictDetector.js';
import { VerificationStateMachine, StateTransitionError } from '../patterns/VerificationStateMachine.js';
import { WatchlistNotifier } from '../patterns/WatchlistObserver.js';

export class BioTrustService {
  private store: JsonStore;
  private reviewerStrategy: ExpertiseBasedReviewerStrategy;
  private watchlistNotifier: WatchlistNotifier;

  constructor() {
    this.store = JsonStore.getInstance();
    this.reviewerStrategy = new ExpertiseBasedReviewerStrategy();
    this.watchlistNotifier = new WatchlistNotifier();
  }

  // ==========================================
  // MODULE 1 — USER & ROLE MANAGEMENT
  // ==========================================

  public registerUser(params: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    organizationName?: string;
    expertiseTags?: string[];
  }): User {
    const existing = this.store.users.find(u => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error(`A user with email ${params.email} already exists.`);
    }

    const newUser: User = {
      userId: `usr_${uuidv4().slice(0, 8)}`,
      name: params.name,
      email: params.email,
      password: params.password || 'password123',
      role: params.role,
      status: 'ACTIVE',
      organizationName: params.organizationName,
      reputationScore: params.role === 'SCIENTIST' ? 80 : params.role === 'REVIEWER' ? 90 : 60,
      expertiseTags: params.expertiseTags || [],
      createdAt: new Date().toISOString()
    };

    this.store.users.push(newUser);
    this.logAudit({
      userId: newUser.userId,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTERED',
      newValue: `Role: ${newUser.role}`,
      justification: 'Account self-registration or admin provision.'
    });

    this.store.saveDatabase();
    return newUser;
  }

  public loginUser(email: string, _password?: string): { user: User; token: string } {
    const user = this.store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid credentials. User not found.');
    }
    if (user.status === 'DEACTIVATED') {
      throw new Error('This account has been deactivated by the BioTrust Administrator.');
    }

    this.logAudit({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      newValue: 'Session initialized'
    });

    return {
      user,
      token: `jwt_token_${user.userId}_${Date.now()}`
    };
  }

  public logoutUser(userId: string): boolean {
    const user = this.store.users.find(u => u.userId === userId);
    if (user) {
      this.logAudit({
        userId: user.userId,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGIN',
        oldValue: 'Session terminated'
      });
    }
    return true;
  }

  public assignRole(adminUserId: string, targetUserId: string, newRole: UserRole): User {
    this.assertAdmin(adminUserId);
    const target = this.store.users.find(u => u.userId === targetUserId);
    if (!target) throw new Error('Target user not found.');

    const oldRole = target.role;
    target.role = newRole;

    const admin = this.store.users.find(u => u.userId === adminUserId);
    this.logAudit({
      userId: adminUserId,
      userName: admin ? admin.name : 'System Admin',
      userRole: 'ADMIN',
      action: 'ROLE_ASSIGNED',
      oldValue: oldRole,
      newValue: newRole,
      justification: `Administrative role reassignment for user ${target.name}.`
    });

    this.sendNotification({
      recipientId: target.userId,
      title: 'Security Clearance / Role Updated',
      message: `Your BioTrust system role was updated from [${oldRole}] to [${newRole}].`,
      type: 'SYSTEM'
    });

    this.store.saveDatabase();
    return target;
  }

  public toggleAccountStatus(adminUserId: string, targetUserId: string): User {
    this.assertAdmin(adminUserId);
    const target = this.store.users.find(u => u.userId === targetUserId);
    if (!target) throw new Error('Target user not found.');

    const oldStatus = target.status;
    target.status = target.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';

    const admin = this.store.users.find(u => u.userId === adminUserId);
    this.logAudit({
      userId: adminUserId,
      userName: admin ? admin.name : 'System Admin',
      userRole: 'ADMIN',
      action: 'ACCOUNT_TOGGLED',
      oldValue: oldStatus,
      newValue: target.status,
      justification: `Account status toggled by Administrator.`
    });

    this.store.saveDatabase();
    return target;
  }

  public getAllUsers(): User[] {
    return this.store.users;
  }

  // ==========================================
  // MODULE 2 — SPECIES REGISTRY
  // ==========================================

  public addSpecies(authorUserId: string, speciesData: Omit<Species, 'speciesId' | 'updatedAt'>): Species {
    const author = this.store.users.find(u => u.userId === authorUserId);
    const newSpecies: Species = {
      ...speciesData,
      speciesId: `spc_${uuidv4().slice(0, 8)}`,
      updatedAt: new Date().toISOString()
    };

    this.store.species.push(newSpecies);
    this.logAudit({
      userId: authorUserId,
      userName: author ? author.name : 'System',
      userRole: author ? author.role : 'ADMIN',
      action: 'SPECIES_ADDED',
      speciesId: newSpecies.speciesId,
      newValue: `${newSpecies.commonName} (${newSpecies.scientificName}) - ${newSpecies.threatLevel}`,
      justification: 'New taxonomic species registered in BioTrust Registry.'
    });

    this.store.saveDatabase();
    return newSpecies;
  }

  public updateSpecies(authorUserId: string, speciesId: string, updates: Partial<Species>): Species {
    const species = this.store.species.find(s => s.speciesId === speciesId);
    if (!species) throw new Error('Species not found.');

    const author = this.store.users.find(u => u.userId === authorUserId);
    Object.assign(species, updates, { updatedAt: new Date().toISOString() });

    this.logAudit({
      userId: authorUserId,
      userName: author ? author.name : 'System',
      userRole: author ? author.role : 'ADMIN',
      action: 'SPECIES_UPDATED',
      speciesId: species.speciesId,
      newValue: `Updated details for ${species.commonName}`
    });

    this.store.saveDatabase();
    return species;
  }

  public searchSpecies(query: string, threatLevel?: string): Species[] {
    const q = (query || '').toLowerCase().trim();
    return this.store.species.filter(s => {
      const matchQuery = !q || 
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q) ||
        s.family.toLowerCase().includes(q) ||
        s.habitat.toLowerCase().includes(q) ||
        s.distribution.toLowerCase().includes(q);

      const matchThreat = !threatLevel || threatLevel === 'ALL' || s.threatLevel === threatLevel;
      return matchQuery && matchThreat;
    });
  }

  public viewSpecies(speciesId: string): Species {
    const species = this.store.species.find(s => s.speciesId === speciesId);
    if (!species) throw new Error(`Species with ID ${speciesId} not found.`);
    return species;
  }

  public getAllSpecies(): Species[] {
    return this.store.species;
  }

  // ==========================================
  // MODULE 3 — BIODIVERSITY RECORD SUBMISSION
  // ==========================================

  public createRecord(authorUserId: string, data: {
    speciesId: string;
    description: string;
    location: LocationData;
  }): BiodiversityRecord {
    const user = this.store.users.find(u => u.userId === authorUserId);
    if (!user) throw new Error('Submitter user not found.');

    const species = this.store.species.find(s => s.speciesId === data.speciesId);
    if (!species) throw new Error('Linked species does not exist.');

    // Calculate baseline trust score
    const trustResult = TrustScoreCalculator.calculate({
      dnaSamples: [],
      researchPapers: [],
      location: data.location,
      verifications: []
    }, user);

    // Run duplicate/conflict check
    const dupCheck = DuplicateConflictDetector.analyze(
      { speciesId: data.speciesId, location: data.location },
      species,
      this.store.records
    );

    const newRecord: BiodiversityRecord = {
      recordId: `rec_${uuidv4().slice(0, 8)}`,
      speciesId: data.speciesId,
      submittedBy: authorUserId,
      submitterName: user.name,
      submissionDate: new Date().toISOString(),
      status: 'DRAFT',
      description: data.description,
      location: data.location,
      version: 1,
      trustScore: trustResult.score,
      trustBadge: trustResult.badge,
      requiredConsensus: 2,
      assignedReviewers: [],
      verifications: [],
      dnaSamples: [],
      researchPapers: [],
      versionHistory: [],
      duplicateWarning: dupCheck.warnings.length > 0 ? dupCheck.warnings.join(' | ') : undefined,
      conflictFlag: dupCheck.hasConflictWarning
    };

    this.store.records.push(newRecord);

    this.logAudit({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'RECORD_CREATED',
      recordId: newRecord.recordId,
      speciesId: species.speciesId,
      newValue: `Created DRAFT v1 for ${species.commonName}`,
      justification: 'Field observation draft initiated.'
    });

    this.store.saveDatabase();
    return newRecord;
  }

  public submitRecord(userId: string, recordId: string): BiodiversityRecord {
    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error('Record not found.');

    const user = this.store.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found.');

    if (record.submittedBy !== userId && user.role !== 'ADMIN') {
      throw new Error('Only the record author or an Admin can submit this draft.');
    }

    const species = this.viewSpecies(record.speciesId);

    // Smart Reviewer Assignment Strategy
    const eligibleReviewers = this.reviewerStrategy.selectReviewers(
      this.store.users,
      record,
      species,
      record.requiredConsensus
    );

    const reviewerIds = eligibleReviewers.map(r => r.userId);

    // Transition via State Machine
    VerificationStateMachine.submit(record, reviewerIds);

    // Recompute Trust Score with all attached artifacts
    const trust = TrustScoreCalculator.calculate(record, user);
    record.trustScore = trust.score;
    record.trustBadge = trust.badge;

    // Notify assigned reviewers
    for (const reviewer of eligibleReviewers) {
      this.sendNotification({
        recipientId: reviewer.userId,
        recipientRole: 'REVIEWER',
        title: `Peer Review Assignment: ${species.commonName}`,
        message: `${user.name} submitted record #${record.recordId} for "${species.commonName}". Your peer verification is requested.`,
        type: 'PENDING_REVIEW',
        linkId: record.recordId,
        linkType: 'record'
      });
    }

    this.logAudit({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'RECORD_SUBMITTED',
      recordId: record.recordId,
      speciesId: species.speciesId,
      oldValue: 'DRAFT',
      newValue: 'UNDER_REVIEW',
      justification: `Record submitted with ${record.dnaSamples.length} DNA samples and ${record.researchPapers.length} papers. Assigned reviewers: ${eligibleReviewers.map(r => r.name).join(', ')}.`
    });

    this.store.saveDatabase();
    return record;
  }

  public updateDraft(userId: string, recordId: string, updates: {
    description?: string;
    location?: LocationData;
    changesSummary?: string;
  }): BiodiversityRecord {
    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error('Record not found.');

    if (record.status !== 'DRAFT') {
      throw new Error(`Only records in DRAFT state can be modified. Current status: ${record.status}.`);
    }

    if (record.submittedBy !== userId) {
      throw new Error('Permission denied: You can only update your own drafts.');
    }

    // Version increment
    VerificationStateMachine.bumpVersion(
      record,
      updates.changesSummary || 'Updated draft information based on feedback.',
      userId
    );

    if (updates.description) record.description = updates.description;
    if (updates.location) record.location = updates.location;

    const user = this.store.users.find(u => u.userId === userId);
    const trust = TrustScoreCalculator.calculate(record, user);
    record.trustScore = trust.score;
    record.trustBadge = trust.badge;

    this.logAudit({
      userId,
      userName: user ? user.name : 'Scientist',
      userRole: 'SCIENTIST',
      action: 'DRAFT_UPDATED',
      recordId: record.recordId,
      newValue: `Updated to version v${record.version}`,
      justification: updates.changesSummary
    });

    this.store.saveDatabase();
    return record;
  }

  public viewMyRecords(userId: string): BiodiversityRecord[] {
    return this.store.records.filter(r => r.submittedBy === userId);
  }

  public getRecordById(recordId: string, requesterRole?: UserRole): BiodiversityRecord & { locationDisplay: LocationData | MaskedLocationData } {
    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error(`Record #${recordId} not found.`);

    // Strict Constraint: Public cannot see Drafts, Under Review, or internal reviewer notes
    if (requesterRole === 'PUBLIC' || !requesterRole) {
      if (record.status !== 'PUBLISHED') {
        throw new Error('Access Denied: Unverified biodiversity records are strictly restricted from public viewing under BioTrust security protocol §2.');
      }
    }

    const species = this.viewSpecies(record.speciesId);
    const locationDisplay = SensitiveLocationProtection.filterLocation(record.location, species, requesterRole);

    // Deep clone to prevent mutating store directly
    const result = JSON.parse(JSON.stringify(record));
    if (requesterRole === 'PUBLIC' || !requesterRole) {
      // Strip internal reviewer notes from public view
      delete result.reviewerNotes;
    }

    return {
      ...result,
      locationDisplay
    };
  }

  // ==========================================
  // MODULE 4 — VERIFICATION WORKFLOW
  // ==========================================

  public reviewRecord(
    reviewerUserId: string,
    recordId: string,
    decision: 'Verified' | 'Disputed' | 'RequestInfo',
    comments: string,
    confidenceScore: number = 5
  ): BiodiversityRecord {
    const reviewer = this.store.users.find(u => u.userId === reviewerUserId);
    if (!reviewer) throw new Error('Reviewer not found.');
    if (reviewer.role !== 'REVIEWER' && reviewer.role !== 'ADMIN') {
      throw new Error('Only certified Reviewers or Admins can perform peer verification.');
    }

    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error('Record not found.');

    const species = this.viewSpecies(record.speciesId);

    const review: VerificationReview = {
      verificationId: `ver_${uuidv4().slice(0, 8)}`,
      recordId: record.recordId,
      reviewerId: reviewer.userId,
      reviewerName: reviewer.name,
      decision,
      comments,
      reviewDate: new Date().toISOString(),
      confidenceScore
    };

    const previousStatus = record.status;
    const transition = VerificationStateMachine.applyReview(record, review, reviewer);

    // Recompute Trust Score
    const submitter = this.store.users.find(u => u.userId === record.submittedBy);
    const trust = TrustScoreCalculator.calculate(record, submitter);
    record.trustScore = trust.score;
    record.trustBadge = trust.badge;

    // Log action to Audit Trail
    let auditAction: AuditLogEntry['action'] = 'RECORD_REVIEWED';
    if (decision === 'Verified') auditAction = transition.consensusReached ? 'RECORD_VERIFIED' : 'RECORD_REVIEWED';
    else if (decision === 'Disputed') auditAction = 'RECORD_DISPUTED';
    else if (decision === 'RequestInfo') auditAction = 'INFO_REQUESTED';

    this.logAudit({
      userId: reviewer.userId,
      userName: reviewer.name,
      userRole: reviewer.role,
      action: auditAction,
      recordId: record.recordId,
      speciesId: species.speciesId,
      oldValue: previousStatus,
      newValue: record.status,
      justification: comments
    });

    // Notify submitter of review decision
    if (decision === 'RequestInfo') {
      this.sendNotification({
        recipientId: record.submittedBy,
        recipientRole: 'SCIENTIST',
        title: `Clarification Requested: ${species.commonName}`,
        message: `${reviewer.name} requested additional evidence on record #${record.recordId}: "${comments}"`,
        type: 'REQUEST_INFO',
        linkId: record.recordId,
        linkType: 'record'
      });
    } else if (decision === 'Disputed') {
      this.sendNotification({
        recipientId: record.submittedBy,
        recipientRole: 'SCIENTIST',
        title: `Submission Disputed: ${species.commonName}`,
        message: `${reviewer.name} disputed record #${record.recordId}: "${comments}"`,
        type: 'DISPUTED',
        linkId: record.recordId,
        linkType: 'record'
      });
    } else if (decision === 'Verified') {
      const verifiedCount = record.verifications.filter(v => v.decision === 'Verified').length;
      if (transition.consensusReached) {
        this.sendNotification({
          recipientId: record.submittedBy,
          recipientRole: 'SCIENTIST',
          title: `Peer Verification Achieved! 🎉`,
          message: `Record #${record.recordId} for "${species.commonName}" achieved full peer consensus (${verifiedCount}/${record.requiredConsensus}) and is now VERIFIED!`,
          type: 'VERIFIED',
          linkId: record.recordId,
          linkType: 'record'
        });
      } else {
        this.sendNotification({
          recipientId: record.submittedBy,
          recipientRole: 'SCIENTIST',
          title: `Peer Review Endorsement`,
          message: `${reviewer.name} verified record #${record.recordId}. Consensus tally: ${verifiedCount}/${record.requiredConsensus}.`,
          type: 'PENDING_REVIEW',
          linkId: record.recordId,
          linkType: 'record'
        });
      }
    }

    this.store.saveDatabase();
    return record;
  }

  public verifyRecord(reviewerId: string, recordId: string, comments: string): BiodiversityRecord {
    return this.reviewRecord(reviewerId, recordId, 'Verified', comments);
  }

  public disputeRecord(reviewerId: string, recordId: string, comments: string): BiodiversityRecord {
    return this.reviewRecord(reviewerId, recordId, 'Disputed', comments);
  }

  public requestMoreInformation(reviewerId: string, recordId: string, comments: string): BiodiversityRecord {
    return this.reviewRecord(reviewerId, recordId, 'RequestInfo', comments);
  }

  public addReviewComment(reviewerId: string, recordId: string, comment: string): BiodiversityRecord {
    const reviewer = this.store.users.find(u => u.userId === reviewerId);
    if (!reviewer) throw new Error('User not found.');

    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error('Record not found.');

    if (!record.reviewerNotes) record.reviewerNotes = [];
    record.reviewerNotes.push(`[${reviewer.name} - ${new Date().toLocaleDateString()}]: ${comment}`);

    this.store.saveDatabase();
    return record;
  }

  public publishRecord(userId: string, recordId: string): BiodiversityRecord {
    const user = this.store.users.find(u => u.userId === userId);
    if (!user) throw new Error('User not found.');

    // Only Admin, Reviewer, or Government can publish verified records
    const allowedRoles: UserRole[] = ['ADMIN', 'REVIEWER', 'GOVERNMENT'];
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Insufficient clearance to publish records.');
    }

    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error('Record not found.');

    const previousStatus = record.status;
    VerificationStateMachine.publish(record);

    const species = this.viewSpecies(record.speciesId);

    this.logAudit({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'RECORD_PUBLISHED',
      recordId: record.recordId,
      speciesId: species.speciesId,
      oldValue: previousStatus,
      newValue: 'PUBLISHED',
      justification: 'Golden Rule satisfied: Multi-reviewer consensus verified with trust score ' + record.trustScore + '.'
    });

    // Notify Submitter
    this.sendNotification({
      recipientId: record.submittedBy,
      recipientRole: 'SCIENTIST',
      title: '🌟 Record Published Globally!',
      message: `Your verified observation for "${species.commonName}" is now published and accessible to conservationists worldwide!`,
      type: 'VERIFIED',
      linkId: record.recordId,
      linkType: 'record'
    });

    // Notify Watchlist Subscriptions
    this.watchlistNotifier.onRecordPublished(
      species,
      record.recordId,
      record.location.region,
      this.store.subscriptions,
      (recId, title, msg, type, link) => {
        this.sendNotification({
          recipientId: recId,
          title,
          message: msg,
          type,
          linkId: link,
          linkType: 'record'
        });
      }
    );

    this.store.saveDatabase();
    return record;
  }

  // ==========================================
  // MODULE 5 — RESEARCH REPOSITORY & DNA SAMPLES
  // ==========================================

  public uploadDNASample(userId: string, recordId: string, sampleData: Omit<DNASample, 'sampleId' | 'recordId'>): DNASample {
    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error('Record not found.');

    if (record.status !== 'DRAFT' && record.submittedBy !== userId) {
      throw new Error('DNA samples can only be attached to active draft records by the author.');
    }

    const newSample: DNASample = {
      ...sampleData,
      sampleId: `dna_${uuidv4().slice(0, 8)}`,
      recordId
    };

    if (!record.dnaSamples) record.dnaSamples = [];
    record.dnaSamples.push(newSample);

    // Recompute Trust Score
    const submitter = this.store.users.find(u => u.userId === record.submittedBy);
    const trust = TrustScoreCalculator.calculate(record, submitter);
    record.trustScore = trust.score;
    record.trustBadge = trust.badge;

    const user = this.store.users.find(u => u.userId === userId);
    this.logAudit({
      userId,
      userName: user ? user.name : 'Scientist',
      userRole: user ? user.role : 'SCIENTIST',
      action: 'DNA_SAMPLE_ADDED',
      recordId: record.recordId,
      newValue: `${newSample.sampleType} Sample (${newSample.sequenceAccession || 'Unaccessioned'})`,
      justification: newSample.description
    });

    this.store.saveDatabase();
    return newSample;
  }

  public addResearchPaper(userId: string, recordId: string, paperData: Omit<ResearchPaper, 'paperId' | 'recordId'>): ResearchPaper {
    const record = this.store.records.find(r => r.recordId === recordId);
    if (!record) throw new Error('Record not found.');

    const newPaper: ResearchPaper = {
      ...paperData,
      paperId: `pap_${uuidv4().slice(0, 8)}`,
      recordId
    };

    if (!record.researchPapers) record.researchPapers = [];
    record.researchPapers.push(newPaper);

    // Recompute Trust Score
    const submitter = this.store.users.find(u => u.userId === record.submittedBy);
    const trust = TrustScoreCalculator.calculate(record, submitter);
    record.trustScore = trust.score;
    record.trustBadge = trust.badge;

    const user = this.store.users.find(u => u.userId === userId);
    this.logAudit({
      userId,
      userName: user ? user.name : 'Scientist',
      userRole: user ? user.role : 'SCIENTIST',
      action: 'RESEARCH_PAPER_ADDED',
      recordId: record.recordId,
      newValue: `${newPaper.title} (${newPaper.journal})`,
      justification: `Attached peer-reviewed study DOI: ${newPaper.doi || 'N/A'}`
    });

    this.store.saveDatabase();
    return newPaper;
  }

  // ==========================================
  // MODULE 6 — CONSERVATION PROJECT MANAGEMENT
  // ==========================================

  public createConservationProject(organizationUserId: string, projectData: {
    projectName: string;
    speciesId: string;
    description: string;
    startDate: string;
    budget: string;
    targetImpact: string;
  }): ConservationProject {
    const user = this.store.users.find(u => u.userId === organizationUserId);
    if (!user) throw new Error('User not found.');
    if (user.role !== 'ORGANIZATION' && user.role !== 'ADMIN') {
      throw new Error('Only Organizations/NGOs or Admins can register conservation projects.');
    }

    const species = this.viewSpecies(projectData.speciesId);

    const newProject: ConservationProject = {
      projectId: `prj_${uuidv4().slice(0, 8)}`,
      projectName: projectData.projectName,
      organizationId: organizationUserId,
      organizationName: user.organizationName || user.name,
      speciesId: projectData.speciesId,
      speciesCommonName: species.commonName,
      description: projectData.description,
      status: 'Active',
      startDate: projectData.startDate,
      budget: projectData.budget,
      targetImpact: projectData.targetImpact,
      milestones: [
        { id: `m_${Date.now()}`, title: 'Initial Baseline Ecological Survey', completed: false, targetDate: projectData.startDate }
      ],
      impactLogs: [
        { date: new Date().toISOString().slice(0, 10), log: 'Project initiated and registered on BioTrust platform.', recordedBy: user.name }
      ]
    };

    this.store.projects.push(newProject);

    this.logAudit({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'PROJECT_CREATED',
      speciesId: species.speciesId,
      newValue: `Project: ${newProject.projectName} (${species.commonName})`,
      justification: newProject.targetImpact
    });

    this.store.saveDatabase();
    return newProject;
  }

  public updateProject(userId: string, projectId: string, updates: Partial<ConservationProject>): ConservationProject {
    const project = this.store.projects.find(p => p.projectId === projectId);
    if (!project) throw new Error('Project not found.');

    const user = this.store.users.find(u => u.userId === userId);
    if (project.organizationId !== userId && (!user || user.role !== 'ADMIN')) {
      throw new Error('Unauthorized: Only project lead organization or Admin can modify project.');
    }

    Object.assign(project, updates);

    this.logAudit({
      userId,
      userName: user ? user.name : 'Organization',
      userRole: user ? user.role : 'ORGANIZATION',
      action: 'PROJECT_UPDATED',
      newValue: `Updated ${project.projectName}`
    });

    this.store.saveDatabase();
    return project;
  }

  public associateSpecies(userId: string, projectId: string, speciesId: string): ConservationProject {
    const species = this.viewSpecies(speciesId);
    return this.updateProject(userId, projectId, {
      speciesId,
      speciesCommonName: species.commonName
    });
  }

  public addImpactLog(userId: string, projectId: string, log: string): ConservationProject {
    const project = this.store.projects.find(p => p.projectId === projectId);
    if (!project) throw new Error('Project not found.');

    const user = this.store.users.find(u => u.userId === userId);
    project.impactLogs.push({
      date: new Date().toISOString().slice(0, 10),
      log,
      recordedBy: user ? user.name : 'Project Officer'
    });

    this.store.saveDatabase();
    return project;
  }

  public getProjects(speciesId?: string): ConservationProject[] {
    if (speciesId) {
      return this.store.projects.filter(p => p.speciesId === speciesId);
    }
    return this.store.projects;
  }

  // ==========================================
  // MODULE 7 — NOTIFICATION & ALERT SYSTEM
  // ==========================================

  public sendNotification(item: {
    recipientId: string;
    recipientRole?: UserRole;
    title: string;
    message: string;
    type: NotificationItem['type'];
    linkId?: string;
    linkType?: 'record' | 'species' | 'project';
  }): NotificationItem {
    const notif: NotificationItem = {
      notificationId: `notif_${uuidv4().slice(0, 8)}`,
      recipientId: item.recipientId,
      recipientRole: item.recipientRole,
      title: item.title,
      message: item.message,
      type: item.type,
      date: new Date().toISOString(),
      readStatus: false,
      linkId: item.linkId,
      linkType: item.linkType
    };

    this.store.notifications.unshift(notif);
    this.store.saveDatabase();
    return notif;
  }

  public viewNotifications(userId: string, userRole?: UserRole): NotificationItem[] {
    return this.store.notifications.filter(n => {
      if (n.recipientId === userId) return true;
      if (n.recipientId === 'ALL') return true;
      if (userRole && n.recipientRole === userRole) return true;
      return false;
    });
  }

  public markNotificationRead(notifId: string): boolean {
    const notif = this.store.notifications.find(n => n.notificationId === notifId);
    if (notif) {
      notif.readStatus = true;
      this.store.saveDatabase();
      return true;
    }
    return false;
  }

  public subscribeWatchlist(userId: string, speciesId?: string, region?: string): WatchlistSubscription {
    const sub: WatchlistSubscription = {
      subscriptionId: `sub_${uuidv4().slice(0, 8)}`,
      userId,
      speciesId,
      region,
      createdAt: new Date().toISOString()
    };
    this.store.subscriptions.push(sub);
    this.store.saveDatabase();
    return sub;
  }

  public getUserWatchlist(userId: string): WatchlistSubscription[] {
    return this.store.subscriptions.filter(s => s.userId === userId);
  }

  // ==========================================
  // THREAT-STATUS CHANGE WORKFLOW
  // ==========================================

  public proposeThreatLevel(proposerUserId: string, params: {
    speciesId: string;
    proposedThreatLevel: ThreatLevel;
    justification: string;
    scientificEvidence: string;
  }): ThreatProposal {
    const user = this.store.users.find(u => u.userId === proposerUserId);
    if (!user) throw new Error('User not found.');

    const species = this.viewSpecies(params.speciesId);

    const proposal: ThreatProposal = {
      proposalId: `prop_${uuidv4().slice(0, 8)}`,
      speciesId: species.speciesId,
      speciesName: species.commonName,
      currentThreatLevel: species.threatLevel,
      proposedThreatLevel: params.proposedThreatLevel,
      proposedBy: proposerUserId,
      proposerName: user.name,
      justification: params.justification,
      scientificEvidence: params.scientificEvidence,
      proposedDate: new Date().toISOString(),
      status: 'PENDING'
    };

    this.store.threatProposals.push(proposal);

    this.logAudit({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'THREAT_PROPOSED',
      speciesId: species.speciesId,
      oldValue: species.threatLevel,
      newValue: params.proposedThreatLevel,
      justification: params.justification
    });

    // Notify senior Government officials
    this.sendNotification({
      recipientId: 'ALL',
      recipientRole: 'GOVERNMENT',
      title: `Official Threat Reclassification Proposal: ${species.commonName}`,
      message: `${user.name} proposed changing threat level from [${species.threatLevel}] to [${params.proposedThreatLevel}]. Review required.`,
      type: 'THREAT_UPDATE',
      linkId: proposal.proposalId,
      linkType: 'species'
    });

    this.store.saveDatabase();
    return proposal;
  }

  public approveThreatLevel(approverUserId: string, proposalId: string, notes?: string): ThreatProposal {
    const approver = this.store.users.find(u => u.userId === approverUserId);
    if (!approver) throw new Error('User not found.');
    if (approver.role !== 'GOVERNMENT' && approver.role !== 'ADMIN') {
      throw new Error('Only designated Government Authorities or System Admins can ratify official threat level changes.');
    }

    const proposal = this.store.threatProposals.find(p => p.proposalId === proposalId);
    if (!proposal) throw new Error('Proposal not found.');
    if (proposal.status !== 'PENDING') throw new Error('Proposal has already been adjudicated.');

    const species = this.viewSpecies(proposal.speciesId);
    const oldThreat = species.threatLevel;

    proposal.status = 'APPROVED';
    proposal.approvedBy = approver.userId;
    proposal.approverName = approver.name;
    proposal.approvalDate = new Date().toISOString();
    proposal.approvalNotes = notes || 'Formally ratified under National Biodiversity Conservation Standards.';

    // Apply the new threat level to the species!
    species.threatLevel = proposal.proposedThreatLevel;
    species.updatedAt = new Date().toISOString();

    this.logAudit({
      userId: approver.userId,
      userName: approver.name,
      userRole: approver.role,
      action: 'THREAT_APPROVED',
      speciesId: species.speciesId,
      oldValue: oldThreat,
      newValue: species.threatLevel,
      justification: proposal.justification
    });

    // Trigger Observer Pattern alert cascade!
    this.watchlistNotifier.onThreatLevelChanged(
      species,
      oldThreat,
      species.threatLevel,
      this.store.subscriptions,
      (recId, title, msg, type, link) => {
        this.sendNotification({
          recipientId: recId,
          title,
          message: msg,
          type,
          linkId: link,
          linkType: 'species'
        });
      }
    );

    this.store.saveDatabase();
    return proposal;
  }

  public rejectThreatLevel(approverUserId: string, proposalId: string, rationale: string): ThreatProposal {
    const approver = this.store.users.find(u => u.userId === approverUserId);
    if (!approver) throw new Error('User not found.');
    if (approver.role !== 'GOVERNMENT' && approver.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only Government or Admin can reject proposals.');
    }

    const proposal = this.store.threatProposals.find(p => p.proposalId === proposalId);
    if (!proposal) throw new Error('Proposal not found.');

    proposal.status = 'REJECTED';
    proposal.approvedBy = approver.userId;
    proposal.approverName = approver.name;
    proposal.approvalDate = new Date().toISOString();
    proposal.approvalNotes = rationale;

    this.store.saveDatabase();
    return proposal;
  }

  public updateThreatLevel(userId: string, speciesId: string, newThreat: ThreatLevel, justification: string): Species {
    const user = this.store.users.find(u => u.userId === userId);
    if (!user || (user.role !== 'GOVERNMENT' && user.role !== 'ADMIN')) {
      throw new Error('Direct threat level updates require Government Officer or Admin clearance.');
    }

    const species = this.viewSpecies(speciesId);
    const oldThreat = species.threatLevel;
    species.threatLevel = newThreat;
    species.updatedAt = new Date().toISOString();

    this.logAudit({
      userId,
      userName: user.name,
      userRole: user.role,
      action: 'THREAT_APPROVED',
      speciesId: species.speciesId,
      oldValue: oldThreat,
      newValue: newThreat,
      justification
    });

    this.watchlistNotifier.onThreatLevelChanged(
      species,
      oldThreat,
      newThreat,
      this.store.subscriptions,
      (recId, title, msg, type, link) => {
        this.sendNotification({
          recipientId: recId,
          title,
          message: msg,
          type,
          linkId: link,
          linkType: 'species'
        });
      }
    );

    this.store.saveDatabase();
    return species;
  }

  public getThreatProposals(): ThreatProposal[] {
    return this.store.threatProposals;
  }

  // ==========================================
  // MODULE 9 — PUBLIC SEARCH & EXPLORER
  // ==========================================

  public searchPublishedSpecies(query: string, threatFilter?: string): any[] {
    const speciesMatches = this.searchSpecies(query, threatFilter);
    return speciesMatches.map(species => {
      // Find published records for this species
      const publishedRecords = this.store.records.filter(
        r => r.speciesId === species.speciesId && r.status === 'PUBLISHED'
      );

      // Mask sensitive coordinates for public
      const maskedSightings = publishedRecords.map(r => ({
        recordId: r.recordId,
        submissionDate: r.submissionDate,
        trustScore: r.trustScore,
        trustBadge: r.trustBadge,
        description: r.description,
        location: SensitiveLocationProtection.filterLocation(r.location, species, 'PUBLIC'),
        dnaSamplesCount: r.dnaSamples ? r.dnaSamples.length : 0,
        researchPapersCount: r.researchPapers ? r.researchPapers.length : 0
      }));

      // Active conservation projects
      const activeProjects = this.store.projects.filter(p => p.speciesId === species.speciesId);

      return {
        ...species,
        verifiedSightingsCount: publishedRecords.length,
        verifiedSightings: maskedSightings,
        activeProjectsCount: activeProjects.length,
        activeProjects: activeProjects.map(p => ({
          projectId: p.projectId,
          projectName: p.projectName,
          organizationName: p.organizationName,
          status: p.status
        }))
      };
    });
  }

  public viewPublishedRecord(recordId: string): any {
    return this.getRecordById(recordId, 'PUBLIC');
  }

  public getPublicRecords(): any[] {
    const published = this.store.records.filter(r => r.status === 'PUBLISHED');
    return published.map(r => {
      const species = this.viewSpecies(r.speciesId);
      const maskedLocation = SensitiveLocationProtection.filterLocation(r.location, species, 'PUBLIC');
      return {
        ...r,
        speciesName: species.commonName,
        scientificName: species.scientificName,
        threatLevel: species.threatLevel,
        locationDisplay: maskedLocation,
        reviewerNotes: undefined // Strip internal notes
      };
    });
  }

  // ==========================================
  // MODULE 8 — REPORTS & DASHBOARDS
  // ==========================================

  public generateReport(role: UserRole, userId?: string): any {
    const totalRecords = this.store.records.length;
    const publishedRecords = this.store.records.filter(r => r.status === 'PUBLISHED').length;
    const underReviewRecords = this.store.records.filter(r => r.status === 'UNDER_REVIEW').length;
    const verifiedRecords = this.store.records.filter(r => r.status === 'VERIFIED').length;
    const disputedRecords = this.store.records.filter(r => r.status === 'DISPUTED').length;
    const draftRecords = this.store.records.filter(r => r.status === 'DRAFT').length;

    const baseStats = {
      totalSpecies: this.store.species.length,
      protectedSpeciesCount: this.store.species.filter(s => s.isProtected).length,
      threatBreakdown: {
        'Critically Endangered': this.store.species.filter(s => s.threatLevel === 'Critically Endangered').length,
        'Endangered': this.store.species.filter(s => s.threatLevel === 'Endangered').length,
        'Vulnerable': this.store.species.filter(s => s.threatLevel === 'Vulnerable').length,
        'Near Threatened': this.store.species.filter(s => s.threatLevel === 'Near Threatened').length,
        'Least Concern': this.store.species.filter(s => s.threatLevel === 'Least Concern').length
      },
      totalRecords,
      publishedRecords,
      underReviewRecords,
      verifiedRecords,
      disputedRecords,
      draftRecords,
      totalActiveProjects: this.store.projects.filter(p => p.status === 'Active').length,
      totalUsers: this.store.users.length,
      averageTrustScore: Math.round(
        this.store.records.reduce((acc, r) => acc + r.trustScore, 0) / (totalRecords || 1)
      )
    };

    switch (role) {
      case 'SCIENTIST': {
        const mySubmissions = userId ? this.store.records.filter(r => r.submittedBy === userId) : [];
        return {
          roleTitle: 'Scientist Research Portfolio Summary',
          stats: baseStats,
          mySubmissionsCount: mySubmissions.length,
          myDrafts: mySubmissions.filter(r => r.status === 'DRAFT').length,
          myUnderReview: mySubmissions.filter(r => r.status === 'UNDER_REVIEW').length,
          myPublished: mySubmissions.filter(r => r.status === 'PUBLISHED').length,
          myAverageTrust: Math.round(mySubmissions.reduce((acc, r) => acc + r.trustScore, 0) / (mySubmissions.length || 1)),
          recentFeedback: mySubmissions.filter(r => r.reviewerNotes && r.reviewerNotes.length > 0).map(r => ({
            recordId: r.recordId,
            notes: r.reviewerNotes
          }))
        };
      }
      case 'REVIEWER': {
        const pendingQueue = this.store.records.filter(r => r.status === 'UNDER_REVIEW');
        return {
          roleTitle: 'Peer Verification Command Queue',
          stats: baseStats,
          pendingRecordsForReview: pendingQueue.length,
          myReviewedRecordsCount: this.store.records.filter(r => 
            r.verifications.some(v => v.reviewerId === userId)
          ).length,
          highTrustQueue: pendingQueue.filter(r => r.trustScore >= 75).length,
          consensusRequiredRecords: pendingQueue.map(r => ({
            recordId: r.recordId,
            speciesId: r.speciesId,
            currentApprovals: r.verifications.filter(v => v.decision === 'Verified').length,
            required: r.requiredConsensus
          }))
        };
      }
      case 'ORGANIZATION': {
        const myProjects = userId ? this.store.projects.filter(p => p.organizationId === userId) : this.store.projects;
        return {
          roleTitle: 'Conservation Impact & Project Health Report',
          stats: baseStats,
          activeProjects: myProjects,
          speciesUnderCare: myProjects.map(p => p.speciesCommonName),
          totalImpactLogs: myProjects.reduce((acc, p) => acc + (p.impactLogs?.length || 0), 0)
        };
      }
      case 'GOVERNMENT': {
        return {
          roleTitle: 'National Wildlife & CITES Threat Audit Report',
          stats: baseStats,
          pendingProposals: this.store.threatProposals.filter(p => p.status === 'PENDING'),
          approvedProposals: this.store.threatProposals.filter(p => p.status === 'APPROVED'),
          criticalProtectedZones: ['Sundarbans', 'Virunga', 'Ujung Kulon', 'Mendocino Trench']
        };
      }
      case 'ADMIN':
      default: {
        return {
          roleTitle: 'BioTrust Global System Architecture & Integrity Audit',
          stats: baseStats,
          activeUsers: this.store.users.filter(u => u.status === 'ACTIVE').length,
          deactivatedUsers: this.store.users.filter(u => u.status === 'DEACTIVATED').length,
          immutableAuditLogsCount: this.store.auditLogs.length,
          systemHealth: 'OPTIMAL (Trust consensus engine verified, spatial masking active)'
        };
      }
    }
  }

  public getSystemStats(): any {
    return this.generateReport('ADMIN');
  }

  public getAuditTrail(recordId?: string, speciesId?: string): AuditLogEntry[] {
    let logs = this.store.auditLogs;
    if (recordId) {
      logs = logs.filter(l => l.recordId === recordId);
    }
    if (speciesId) {
      logs = logs.filter(l => l.speciesId === speciesId);
    }
    return logs;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private logAudit(entry: Omit<AuditLogEntry, 'auditId' | 'timestamp'>): void {
    const newEntry: AuditLogEntry = {
      ...entry,
      auditId: `aud_${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    this.store.auditLogs.unshift(newEntry);
  }

  private assertAdmin(userId: string): void {
    const user = this.store.users.find(u => u.userId === userId);
    if (!user || user.role !== 'ADMIN') {
      throw new Error('Access Denied: Administrative credentials required.');
    }
  }
}
