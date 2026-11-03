import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  User, 
  Species, 
  BiodiversityRecord, 
  ConservationProject, 
  ThreatProposal, 
  NotificationItem, 
  AuditLogEntry, 
  WatchlistSubscription 
} from '../types/index.js';
import { 
  SEED_USERS, 
  SEED_SPECIES, 
  SEED_RECORDS, 
  SEED_PROJECTS, 
  SEED_THREAT_PROPOSALS, 
  SEED_NOTIFICATIONS, 
  SEED_AUDIT_LOGS, 
  SEED_SUBSCRIPTIONS 
} from './SeedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'biotrust_store.json');

export interface BioTrustDatabase {
  users: User[];
  species: Species[];
  records: BiodiversityRecord[];
  projects: ConservationProject[];
  threatProposals: ThreatProposal[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  subscriptions: WatchlistSubscription[];
}

export class JsonStore {
  private static instance: JsonStore;
  private db: BioTrustDatabase;

  private constructor() {
    this.db = this.loadDatabase();
  }

  public static getInstance(): JsonStore {
    if (!JsonStore.instance) {
      JsonStore.instance = new JsonStore();
    }
    return JsonStore.instance;
  }

  private loadDatabase(): BioTrustDatabase {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing with fresh seeds.', err);
    }

    const initialDb: BioTrustDatabase = {
      users: [...SEED_USERS],
      species: [...SEED_SPECIES],
      records: [...SEED_RECORDS],
      projects: [...SEED_PROJECTS],
      threatProposals: [...SEED_THREAT_PROPOSALS],
      notifications: [...SEED_NOTIFICATIONS],
      auditLogs: [...SEED_AUDIT_LOGS],
      subscriptions: [...SEED_SUBSCRIPTIONS]
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  public saveDatabase(data?: BioTrustDatabase): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  public get users(): User[] { return this.db.users; }
  public get species(): Species[] { return this.db.species; }
  public get records(): BiodiversityRecord[] { return this.db.records; }
  public get projects(): ConservationProject[] { return this.db.projects; }
  public get threatProposals(): ThreatProposal[] { return this.db.threatProposals; }
  public get notifications(): NotificationItem[] { return this.db.notifications; }
  public get auditLogs(): AuditLogEntry[] { return this.db.auditLogs; }
  public get subscriptions(): WatchlistSubscription[] { return this.db.subscriptions; }

  public resetToSeeds(): void {
    this.db = {
      users: JSON.parse(JSON.stringify(SEED_USERS)),
      species: JSON.parse(JSON.stringify(SEED_SPECIES)),
      records: JSON.parse(JSON.stringify(SEED_RECORDS)),
      projects: JSON.parse(JSON.stringify(SEED_PROJECTS)),
      threatProposals: JSON.parse(JSON.stringify(SEED_THREAT_PROPOSALS)),
      notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
      auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOGS)),
      subscriptions: JSON.parse(JSON.stringify(SEED_SUBSCRIPTIONS))
    };
    this.saveDatabase();
  }
}
