import { useMemo } from "react";
import { useLeads, type LeadRow } from "@/hooks/use-leads";
import { useCases } from "@/hooks/use-cases";
import { Terminal, Database, RefreshCw, AlertTriangle, Activity, FolderOpen, ChevronRight, MessageSquare, User, Clock, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";

function getLeadContent(lead: LeadRow): string {
  const knownContentKeys = ["description", "notes", "details", "content", "summary", "body", "text", "info", "message"];
  for (const key of knownContentKeys) {
    if (typeof lead[key] === "string" && (lead[key] as string).trim()) {
      return lead[key] as string;
    }
  }
  const skipKeys = new Set(["id", "created_at", "updated_at", "agent_id", "case_id"]);
  for (const [key, val] of Object.entries(lead)) {
    if (!skipKeys.has(key) && typeof val === "string" && val.trim() && !key.endsWith("_id")) {
      return val;
    }
  }
  return "NO_CONTENT_AVAILABLE";
}

interface CaseGroup {
  caseId: string;
  caseTitle: string;
  leads: LeadRow[];
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="border border-primary/10 relative overflow-hidden">
          <div className="p-4 bg-primary/5 border-b border-primary/10">
            <div className="h-5 bg-primary/20 w-1/3 animate-pulse"></div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="h-16 bg-primary/5 animate-pulse border border-primary/10"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentTag({ lead }: { lead: LeadRow }) {
  const agentName = lead.agents?.name ?? "UNKNOWN_AGENT";
  const rpScore = lead.agents?.rp_score ?? 0;
  const isSenior = rpScore > 50;

  return (
    <span className="flex items-center gap-1.5">
      <span
        className="text-xs font-bold text-primary uppercase tracking-wider"
        data-testid={`text-agent-name-${lead.id}`}
      >
        {agentName}
      </span>
      <span className="text-[10px] text-primary/50 font-mono">[{rpScore} RP]</span>
      {isSenior && (
        <span
          title="Senior Investigator"
          data-testid={`badge-senior-${lead.id}`}
          className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider"
        >
          <Medal className="w-3 h-3 text-amber-400" />
        </span>
      )}
    </span>
  );
}

function LeadPreviewRow({ lead }: { lead: LeadRow }) {
  const caseId = String(lead.cases?.id ?? lead.case_id ?? "unknown");
  const content = getLeadContent(lead);
  const formattedDate = lead.created_at
    ? format(new Date(lead.created_at as string), "MMM dd, HH:mm")
    : "??:??";

  return (
    <Link href={`/case/${caseId}`}>
      <div
        className="group flex items-start gap-4 px-5 py-4 border-b border-primary/5 last:border-b-0 cursor-pointer hover:bg-primary/5 transition-colors duration-200"
        data-testid={`row-lead-${lead.id}`}
      >
        <div className="shrink-0 mt-0.5 p-1.5 border border-primary/20 bg-primary/5 group-hover:border-primary/50 transition-colors">
          <User className="w-3.5 h-3.5 text-primary/70" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            <AgentTag lead={lead} />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />{formattedDate}
            </span>
          </div>
          <p className="text-sm text-foreground/70 truncate">{content}</p>
        </div>
        <ChevronRight className="shrink-0 w-4 h-4 text-primary/30 group-hover:text-primary transition-colors mt-1 invisible group-hover:visible" />
      </div>
    </Link>
  );
}

function CaseGroupCard({ group, index }: { group: CaseGroup; index: number }) {
  const preview = group.leads.slice(0, 3);
  const remaining = group.leads.length - preview.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      className="border border-primary/20 bg-card relative group"
      data-testid={`group-case-${group.caseId}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary"></div>

      {/* Case header — clicking opens the full case file */}
      <Link href={`/case/${group.caseId}`}>
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 border-b border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors duration-200"
          data-testid={`header-case-${group.caseId}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <FolderOpen className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">CASE FILE</div>
              <h2 className="font-bold text-base md:text-lg text-primary uppercase tracking-wider truncate">
                {group.caseTitle}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground border border-primary/20 px-2.5 py-1 bg-primary/5">
              <MessageSquare className="w-3 h-3" />
              {group.leads.length} LEAD{group.leads.length !== 1 ? "S" : ""}
            </span>
            <ChevronRight className="w-4 h-4 text-primary/50" />
          </div>
        </div>
      </Link>

      {/* Lead preview rows or empty state */}
      {preview.length > 0 ? (
        <div>
          {preview.map((lead) => (
            <LeadPreviewRow key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <Link href={`/case/${group.caseId}`}>
          <div
            className="px-5 py-5 flex items-center gap-3 text-xs text-primary/35 uppercase tracking-widest font-mono cursor-pointer hover:text-primary/60 hover:bg-primary/5 transition-colors border-t border-primary/10"
            data-testid={`empty-case-${group.caseId}`}
          >
            <span className="animate-pulse text-primary/50">▋</span>
            AWAITING FIRST TRANSMISSION — OPEN CASE FILE TO SUBMIT LEADS
          </div>
        </Link>
      )}

      {/* Footer link if more leads */}
      {remaining > 0 && (
        <Link href={`/case/${group.caseId}`}>
          <div className="px-5 py-3 border-t border-primary/10 text-xs text-primary/60 hover:text-primary cursor-pointer hover:bg-primary/5 transition-colors flex items-center gap-2 uppercase tracking-widest">
            <ChevronRight className="w-3 h-3" />
            {remaining} MORE TRANSMISSION{remaining !== 1 ? "S" : ""} — OPEN FULL TRANSCRIPT
          </div>
        </Link>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: leads, isLoading: leadsLoading, error: leadsError, refetch: refetchLeads, isRefetching } = useLeads();
  const { data: cases, isLoading: casesLoading, refetch: refetchCases } = useCases();

  function refetch() {
    refetchLeads();
    refetchCases();
  }

  const isLoading = leadsLoading || casesLoading;
  const error = leadsError;

  const caseGroups = useMemo<CaseGroup[]>(() => {
    const map = new Map<string, CaseGroup>();

    // Seed every known case (even those with no leads)
    if (cases) {
      for (const c of cases) {
        map.set(String(c.id), { caseId: String(c.id), caseTitle: c.title, leads: [] });
      }
    }

    // Layer leads onto their cases
    if (leads) {
      for (const lead of leads) {
        const caseId = String(lead.cases?.id ?? (lead as any).case_id ?? "unknown");
        const caseTitle = lead.cases?.title ?? "UNCLASSIFIED_CASE";
        if (!map.has(caseId)) {
          map.set(caseId, { caseId, caseTitle, leads: [] });
        }
        map.get(caseId)!.leads.push(lead);
      }
    }

    return Array.from(map.values());
  }, [cases, leads]);

  return (
    <div className="min-h-screen pt-8 pb-24 px-4 md:px-8 max-w-5xl mx-auto crt-flicker relative z-10">
      <header className="mb-10 border-b-2 border-primary/30 pb-6 relative">
        <div className="absolute bottom-0 left-0 w-1/4 h-[2px] bg-primary shadow-[0_0_15px_rgba(255,153,0,0.8)]"></div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3 text-primary neon-text">
              <Terminal className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">COLD_CASE_LEDGER</h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-semibold">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary/70" />
                STATUS: <span className="text-green-500 neon-text">ONLINE</span>
              </span>
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary/70" />
                AUTH: <span className="text-primary neon-text">LEVEL_5</span>
              </span>
            </div>
          </div>
          <div className="text-left md:text-right text-[10px] md:text-xs text-primary/50 space-y-1">
            <div className="tracking-widest">SECURE_CONNECTION_ESTABLISHED</div>
            <div className="tracking-widest">ENCRYPTION: AES-256-GCM</div>
            <div className="tracking-widest">NODE: SECTOR_7_ALPHA</div>
          </div>
        </div>
      </header>

      <main>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-3 border border-primary/20 px-4 py-2 bg-primary/5">
            <span className="text-primary animate-pulse">_</span>
            ACTIVE_CASE_FILES.DAT
          </h2>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            data-testid="button-sync"
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary border border-primary/40 px-4 py-2 hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-auto justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            Sync Databank
          </button>
        </div>

        {isLoading && <LoadingSkeleton />}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-destructive/10 border-2 border-destructive p-6 flex flex-col sm:flex-row items-start gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse"></div>
            <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h3 className="font-bold text-xl mb-2 text-destructive uppercase tracking-widest">FATAL SYSTEM ERROR</h3>
              <p className="text-destructive/80 text-sm mb-4">
                Connection to primary databank severed. Ensure your access clearance has not been revoked.
              </p>
              <div className="text-xs bg-destructive/20 p-3 border border-destructive/30 text-destructive/90 font-mono break-all">
                {error.message}
              </div>
            </div>
          </motion.div>
        )}

        {!isLoading && !error && caseGroups.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border-2 border-dashed border-primary/30 text-muted-foreground flex flex-col items-center gap-4 bg-card/30"
          >
            <Terminal className="w-12 h-12 opacity-20" />
            <span className="tracking-widest uppercase text-sm font-bold">
              NO_ACTIVE_CASE_FILES_FOUND_IN_DIRECTORY
            </span>
          </motion.div>
        )}

        {!isLoading && !error && caseGroups.length > 0 && (
          <div className="space-y-6">
            {caseGroups.map((group, index) => (
              <CaseGroupCard key={group.caseId} group={group} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
