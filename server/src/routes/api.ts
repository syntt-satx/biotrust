import express, { Request, Response } from 'express';
import { BioTrustService } from '../services/BioTrustService.js';
import { UserRole } from '../types/index.js';
import { JsonStore } from '../storage/JsonStore.js';

const router = express.Router();
const service = new BioTrustService();

// Helper to extract user info from headers for demo/client requests
const getRequester = (req: Request) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_sci_01';
  const role = (req.headers['x-user-role'] as UserRole) || 'SCIENTIST';
  return { userId, role };
};

// ==========================================
// AUTH & USERS
// ==========================================
router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const user = service.registerUser(req.body);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = service.loginUser(email, password);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/auth/logout', (req: Request, res: Response) => {
  const { userId } = getRequester(req);
  service.logoutUser(userId);
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/users', (_req: Request, res: Response) => {
  res.json(service.getAllUsers());
});

router.put('/users/:id/role', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.assignRole(userId, req.params.id, req.body.role);
    res.json(updated);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

router.put('/users/:id/status', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.toggleAccountStatus(userId, req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// ==========================================
// SPECIES REGISTRY
// ==========================================
router.get('/species', (req: Request, res: Response) => {
  const query = req.query.q as string;
  const threat = req.query.threat as string;
  res.json(service.searchSpecies(query, threat));
});

router.get('/species/:id', (req: Request, res: Response) => {
  try {
    res.json(service.viewSpecies(req.params.id));
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/species', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const species = service.addSpecies(userId, req.body);
    res.json(species);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/species/:id', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.updateSpecies(userId, req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// RECORDS & VERIFICATION WORKFLOW
// ==========================================
router.post('/records', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const record = service.createRecord(userId, req.body);
    res.json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/records/:id/submit', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const record = service.submitRecord(userId, req.params.id);
    res.json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/records/:id/draft', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.updateDraft(userId, req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/records/my', (req: Request, res: Response) => {
  const { userId } = getRequester(req);
  res.json(service.viewMyRecords(userId));
});

router.get('/records/:id', (req: Request, res: Response) => {
  try {
    const { role } = getRequester(req);
    const record = service.getRecordById(req.params.id, role);
    res.json(record);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

router.post('/records/:id/review', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const { decision, comments, confidenceScore } = req.body;
    const updated = service.reviewRecord(userId, req.params.id, decision, comments, confidenceScore);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/records/:id/verify', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.verifyRecord(userId, req.params.id, req.body.comments || 'Verified peer review evidence.');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/records/:id/dispute', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.disputeRecord(userId, req.params.id, req.body.comments || 'Record disputed.');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/records/:id/request-info', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.requestMoreInformation(userId, req.params.id, req.body.comments);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/records/:id/comments', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.addReviewComment(userId, req.params.id, req.body.comment);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/records/:id/publish', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const published = service.publishRecord(userId, req.params.id);
    res.json(published);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// DNA SAMPLES & RESEARCH PAPERS
// ==========================================
router.post('/records/:id/dna', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const sample = service.uploadDNASample(userId, req.params.id, req.body);
    res.json(sample);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/records/:id/papers', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const paper = service.addResearchPaper(userId, req.params.id, req.body);
    res.json(paper);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// CONSERVATION PROJECTS
// ==========================================
router.get('/projects', (req: Request, res: Response) => {
  const speciesId = req.query.speciesId as string;
  res.json(service.getProjects(speciesId));
});

router.post('/projects', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const project = service.createConservationProject(userId, req.body);
    res.json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/projects/:id', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.updateProject(userId, req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/projects/:id/species', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.associateSpecies(userId, req.params.id, req.body.speciesId);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/projects/:id/impact', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const updated = service.addImpactLog(userId, req.params.id, req.body.log);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// THREAT STATUS WORKFLOW
// ==========================================
router.get('/threats/proposals', (_req: Request, res: Response) => {
  res.json(service.getThreatProposals());
});

router.post('/threats/propose', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const proposal = service.proposeThreatLevel(userId, req.body);
    res.json(proposal);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/threats/proposals/:id/approve', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const approved = service.approveThreatLevel(userId, req.params.id, req.body.notes);
    res.json(approved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/threats/proposals/:id/reject', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const rejected = service.rejectThreatLevel(userId, req.params.id, req.body.notes || 'Insufficient empirical data.');
    res.json(rejected);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/threats/:speciesId/update', (req: Request, res: Response) => {
  try {
    const { userId } = getRequester(req);
    const { newThreatLevel, justification } = req.body;
    const updated = service.updateThreatLevel(userId, req.params.speciesId, newThreatLevel, justification);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// NOTIFICATIONS & WATCHLIST
// ==========================================
router.get('/notifications', (req: Request, res: Response) => {
  const { userId, role } = getRequester(req);
  res.json(service.viewNotifications(userId, role));
});

router.post('/notifications/read/:id', (req: Request, res: Response) => {
  const success = service.markNotificationRead(req.params.id);
  res.json({ success });
});

router.post('/watchlist', (req: Request, res: Response) => {
  const { userId } = getRequester(req);
  const sub = service.subscribeWatchlist(userId, req.body.speciesId, req.body.region);
  res.json(sub);
});

router.get('/watchlist', (req: Request, res: Response) => {
  const { userId } = getRequester(req);
  res.json(service.getUserWatchlist(userId));
});

// ==========================================
// PUBLIC EXPLORER
// ==========================================
router.get('/public/species', (req: Request, res: Response) => {
  const query = req.query.q as string;
  const threat = req.query.threat as string;
  res.json(service.searchPublishedSpecies(query, threat));
});

router.get('/public/records', (_req: Request, res: Response) => {
  res.json(service.getPublicRecords());
});

router.get('/public/records/:id', (req: Request, res: Response) => {
  try {
    res.json(service.viewPublishedRecord(req.params.id));
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// ==========================================
// REPORTS & DASHBOARDS & AUDIT
// ==========================================
router.get('/reports/:role', (req: Request, res: Response) => {
  const { userId } = getRequester(req);
  const role = (req.params.role.toUpperCase() as UserRole) || 'ADMIN';
  res.json(service.generateReport(role, userId));
});

router.get('/system/stats', (_req: Request, res: Response) => {
  res.json(service.getSystemStats());
});

router.get('/audit', (req: Request, res: Response) => {
  const recordId = req.query.recordId as string;
  const speciesId = req.query.speciesId as string;
  res.json(service.getAuditTrail(recordId, speciesId));
});

router.post('/system/reset', (_req: Request, res: Response) => {
  JsonStore.getInstance().resetToSeeds();
  res.json({ success: true, message: 'Database reset to canonical initial seeds.' });
});

export default router;
