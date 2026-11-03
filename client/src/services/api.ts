import { 
  User, 
  UserRole, 
  Species, 
  BiodiversityRecord, 
  ConservationProject, 
  ThreatProposal, 
  NotificationItem, 
  AuditLogEntry, 
  LocationData,
  ThreatLevel 
} from '../types/index.js';

class BioTrustApi {
  private activeUser: User = {
    userId: 'usr_sci_01',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@biotrust.org',
    role: 'SCIENTIST',
    status: 'ACTIVE',
    organizationName: 'Global Wildlife Genetics Institute',
    reputationScore: 94,
    expertiseTags: ['Mammalia', 'Panthera', 'Genomics', 'Carnivora', 'Forest'],
    createdAt: '2025-01-15T08:00:00Z'
  };

  public get currentUser(): User {
    return this.activeUser;
  }

  public setUser(user: User): void {
    this.activeUser = user;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': this.activeUser.userId,
      'x-user-role': this.activeUser.role,
      ...(options.headers || {})
    };

    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errMsg = `Request failed (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMsg = errJson.error;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    return res.json();
  }

  // Users & Auth
  public getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  public assignRole(targetUserId: string, role: UserRole): Promise<User> {
    return this.request<User>(`/users/${targetUserId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  public toggleStatus(targetUserId: string): Promise<User> {
    return this.request<User>(`/users/${targetUserId}/status`, {
      method: 'PUT'
    });
  }

  // Species
  public getSpecies(query: string = '', threat?: string): Promise<Species[]> {
    const q = new URLSearchParams();
    if (query) q.append('q', query);
    if (threat) q.append('threat', threat);
    return this.request<Species[]>(`/species?${q.toString()}`);
  }

  public getSpeciesById(id: string): Promise<Species> {
    return this.request<Species>(`/species/${id}`);
  }

  public addSpecies(data: Partial<Species>): Promise<Species> {
    return this.request<Species>('/species', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public updateSpecies(id: string, data: Partial<Species>): Promise<Species> {
    return this.request<Species>(`/species/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Records & Verification
  public createRecord(data: { speciesId: string; description: string; location: LocationData }): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>('/records', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public submitRecord(recordId: string): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}/submit`, {
      method: 'POST'
    });
  }

  public updateDraft(recordId: string, updates: { description?: string; location?: LocationData; changesSummary?: string }): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}/draft`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public getMyRecords(): Promise<BiodiversityRecord[]> {
    return this.request<BiodiversityRecord[]>('/records/my');
  }

  public getRecordById(recordId: string): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}`);
  }

  public reviewRecord(recordId: string, decision: 'Verified' | 'Disputed' | 'RequestInfo', comments: string, confidenceScore: number = 5): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments, confidenceScore })
    });
  }

  public verifyRecord(recordId: string, comments: string): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ comments })
    });
  }

  public disputeRecord(recordId: string, comments: string): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ comments })
    });
  }

  public requestMoreInformation(recordId: string, comments: string): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}/request-info`, {
      method: 'POST',
      body: JSON.stringify({ comments })
    });
  }

  public publishRecord(recordId: string): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/records/${recordId}/publish`, {
      method: 'POST'
    });
  }

  public uploadDNASample(recordId: string, sample: any): Promise<any> {
    return this.request(`/records/${recordId}/dna`, {
      method: 'POST',
      body: JSON.stringify(sample)
    });
  }

  public addResearchPaper(recordId: string, paper: any): Promise<any> {
    return this.request(`/records/${recordId}/papers`, {
      method: 'POST',
      body: JSON.stringify(paper)
    });
  }

  // Conservation Projects
  public getProjects(speciesId?: string): Promise<ConservationProject[]> {
    const q = speciesId ? `?speciesId=${speciesId}` : '';
    return this.request<ConservationProject[]>(`/projects${q}`);
  }

  public createProject(data: any): Promise<ConservationProject> {
    return this.request<ConservationProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public updateProject(id: string, data: any): Promise<ConservationProject> {
    return this.request<ConservationProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public addImpactLog(projectId: string, log: string): Promise<ConservationProject> {
    return this.request<ConservationProject>(`/projects/${projectId}/impact`, {
      method: 'POST',
      body: JSON.stringify({ log })
    });
  }

  // Threat proposals
  public getThreatProposals(): Promise<ThreatProposal[]> {
    return this.request<ThreatProposal[]>('/threats/proposals');
  }

  public proposeThreatLevel(data: { speciesId: string; proposedThreatLevel: ThreatLevel; justification: string; scientificEvidence: string }): Promise<ThreatProposal> {
    return this.request<ThreatProposal>('/threats/propose', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public approveThreatLevel(proposalId: string, notes?: string): Promise<ThreatProposal> {
    return this.request<ThreatProposal>(`/threats/proposals/${proposalId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }

  public rejectThreatLevel(proposalId: string, notes: string): Promise<ThreatProposal> {
    return this.request<ThreatProposal>(`/threats/proposals/${proposalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }

  // Notifications
  public getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  public markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notifications/read/${id}`, {
      method: 'POST'
    });
  }

  public subscribeWatchlist(speciesId?: string, region?: string): Promise<any> {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ speciesId, region })
    });
  }

  // Public Explorer
  public getPublicSpecies(query: string = '', threat?: string): Promise<Species[]> {
    const q = new URLSearchParams();
    if (query) q.append('q', query);
    if (threat) q.append('threat', threat);
    return this.request<Species[]>(`/public/species?${q.toString()}`);
  }

  public getPublicRecords(): Promise<BiodiversityRecord[]> {
    return this.request<BiodiversityRecord[]>('/public/records');
  }

  public getPublicRecordById(id: string): Promise<BiodiversityRecord> {
    return this.request<BiodiversityRecord>(`/public/records/${id}`);
  }

  // Reports & System
  public getReport(role: UserRole): Promise<any> {
    return this.request<any>(`/reports/${role}`);
  }

  public getSystemStats(): Promise<any> {
    return this.request<any>('/system/stats');
  }

  public getAuditTrail(recordId?: string, speciesId?: string): Promise<AuditLogEntry[]> {
    const q = new URLSearchParams();
    if (recordId) q.append('recordId', recordId);
    if (speciesId) q.append('speciesId', speciesId);
    return this.request<AuditLogEntry[]>(`/audit?${q.toString()}`);
  }

  public resetToSeeds(): Promise<any> {
    return this.request('/system/reset', { method: 'POST' });
  }
}

export const api = new BioTrustApi();
