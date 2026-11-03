import React from 'react';
import { 
  FlaskConical, 
  Scale, 
  TreePine, 
  Landmark, 
  Terminal, 
  Compass, 
  CheckCircle2, 
  X, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { User, UserRole } from '../types/index.js';

interface AuthGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
}

export const AuthGatewayModal: React.FC<AuthGatewayModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser
}) => {
  if (!isOpen) return null;

  const roleMeta: Record<UserRole, { title: string; clearance: string; icon: any; color: string; desc: string }> = {
    SCIENTIST: {
      title: 'Field Scientist & Genomicist',
      clearance: 'CLEARANCE LEVEL-4',
      icon: FlaskConical,
      color: 'bg-[#2C5E3B] text-[#F9F6F0]',
      desc: 'Ingest raw field sightings, sequence telemetry, attach GenBank loci, and draft iterative observations (v1, v2, v3).'
    },
    REVIEWER: {
      title: 'Certified Peer Reviewer',
      clearance: 'PEER CONSENSUS VERIFIER',
      icon: Scale,
      color: 'bg-[#E65F2B] text-[#FFFFFF]',
      desc: 'Adjudicate pending submissions, audit specimen validity, cast consensus votes (2/2 required), dispute or request information.'
    },
    ORGANIZATION: {
      title: 'Conservation Org / NGO Lead',
      clearance: 'FIELD OPERATIONS',
      icon: TreePine,
      color: 'bg-[#2C5E3B] text-[#F9F6F0]',
      desc: 'Launch conservation initiatives, link verified species to anti-poaching patrols, and record empirical impact logs.'
    },
    GOVERNMENT: {
      title: 'Statutory Wildlife Authority',
      clearance: 'CITES REGULATORY OFFICER',
      icon: Landmark,
      color: 'bg-[#E65F2B] text-[#FFFFFF]',
      desc: 'Ratify official IUCN / CITES threat reclassifications, mandate sensitive coordinate masking, and issue global alert broadcasts.'
    },
    ADMIN: {
      title: 'System Administrator',
      clearance: 'OMEGA ROOT AUDIT',
      icon: Terminal,
      color: 'bg-[#1C1B18] text-[#F9F6F0]',
      desc: 'Govern platform identity credentials, manage operational security roles, toggle account statuses, and inspect cryptographic ledgers.'
    },
    PUBLIC: {
      title: 'Citizen Scientist & Public Explorer',
      clearance: 'OPEN ARCHIVE ACCESS',
      icon: Compass,
      color: 'bg-[#F9F6F0] text-[#1C1B18]',
      desc: 'Explore published verified species, inspect research citations, and explore sightings with 50km anti-poaching coordinate masking.'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1B18]/70 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[8px_8px_0px_#1C1B18] p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#1C1B18] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#E65F2B] text-white border border-[#1C1B18]">
                SECURITY PROTOCOL §1.2
              </span>
              <span className="text-xs font-mono text-[#8C8476]">BIOTRUST CLEARANCE GATEWAY</span>
            </div>
            <h2 className="text-2xl font-black text-[#1C1B18] mt-1 tracking-tight">
              Operational Persona & Clearance Selection
            </h2>
            <p className="text-xs text-[#8C8476] mt-0.5">
              Select your authorized institutional credential to enter the corresponding command studio. You can switch personas at any time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-[#1C1B18] bg-[#EFE9DF] hover:bg-[#1C1B18] hover:text-[#F9F6F0] transition-colors cursor-pointer"
            title="Close Gateway"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allUsers.map((user) => {
            const meta = roleMeta[user.role];
            const Icon = meta.icon;
            const isCurrent = currentUser.userId === user.userId;

            return (
              <div
                key={user.userId}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`p-4 border-2 border-[#1C1B18] transition-all cursor-pointer relative group ${
                  isCurrent
                    ? 'bg-[#EFE9DF] shadow-[4px_4px_0px_#2C5E3B] border-[#2C5E3B]'
                    : 'bg-[#F9F6F0] shadow-[3px_3px_0px_#1C1B18] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_#1C1B18]'
                }`}
              >
                {/* Active Indicator Stamp */}
                {isCurrent && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 bg-[#2C5E3B] text-white border border-[#1C1B18]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACTIVE CLEARANCE</span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 border-2 border-[#1C1B18] flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1C1B18] leading-tight">{user.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#8C8476] uppercase block mt-0.5">
                      {meta.clearance}
                    </span>
                    <span className="text-xs font-semibold text-[#2C5E3B] block">
                      {user.organizationName || 'Citizen Science Network'}
                    </span>
                    <p className="text-[11px] text-[#1C1B18] mt-2 leading-relaxed">
                      {meta.desc}
                    </p>

                    <div className="mt-3 pt-2 border-t border-[#D6CEBE] flex items-center justify-between text-[11px] font-mono text-[#8C8476]">
                      <span>Role: <strong className="text-[#1C1B18]">{user.role}</strong></span>
                      <span className="text-[#2C5E3B] font-bold group-hover:underline flex items-center gap-1">
                        Assume Role <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#1C1B18]">
            <ShieldCheck className="w-4 h-4 text-[#2C5E3B]" />
            The BioTrust Golden Rule: No biodiversity submission becomes trusted without verification.
          </span>
          <button
            onClick={onClose}
            className="btn-primary px-4 py-1 text-xs"
          >
            Enter Archive
          </button>
        </div>
      </div>
    </div>
  );
};
