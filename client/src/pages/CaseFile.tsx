import { useCaseLeads } from "@/hooks/use-case-leads";
import { type LeadRow } from "@/hooks/use-leads";
import { Terminal, ArrowLeft, ShieldAlert, User, Clock, AlertTriangle, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";

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

function TransmissionEntry({ lead, index }: { lead: LeadRow; index: number }) {
  const agentName = lead.agents?.name ?? "UNKNOWN_AGENT";
  const rpScore = lead.agents?.rp_score ?? 0;
  const isSenior = rpScore > 50;
  const content = getLeadContent(lead);
  const timestamp = lead.created_at ? new Date(lead.created_at as string) : null;
  const formattedDate = timestamp ? format(timestamp, "yyyy-MM-dd HH:mm:ss") : "UNKNOWN_TIMESTAMP";
  const relativeTime = timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="flex gap-4 group"
      data-testid={`transmission-${lead.id}`}
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="w-8 h-8 border border-primary/40 bg-primary/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/20 transition-colors duration-200 shrink-0">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="w-px flex-1 bg-primary/10 mt-1 min-h-4"></div>
      </div>

      {/* Message bubble */}
      <div className="flex-1 pb-6 min-w-0">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
          <span className="flex items-center gap-1.5">
            <span
              className="text-xs font-black text-primary uppercase tracking-widest"
              data-testid={`text-agent-name-${lead.id}`}
            >
              {agentName}
            </span>
            <span className="text-[10px] text-primary/50 font-mono">[{rpScore} RP]</span>
            {isSenior && (
              <span
                title="Senior Investigator"
                data-testid={`badge-senior-${lead.id}`}
                className="flex items-center gap-0.5"
              >
                <Medal className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider hidden sm:inline">
                  SR. INVESTIGATOR
                </span>
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3 opacity-60" />
            <span>{formattedDate}</span>
            {relativeTime && (
              <span className="text-primary/30 hidden sm:inline">({relativeTime})</span>
            )}
          </span>
          <span className="text-[10px] text-primary/30 uppercase tracking-widest font-mono hidden md:inline">
            LEAD_ID: {lead.id}
          </span>
        </div>

        {/* Content box */}
        <div className="border border-primary/15 bg-card/60 p-4 group-hover:border-primary/35 transition-colors duration-200 relative">
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-primary/50"></div>
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-primary/50"></div>
          <p
            className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap break-words font-mono"
            data-testid={`text-content-${lead.id}`}
          >
            <span className="text-primary/50 select-none mr-2">&gt;</span>
            {content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-8 h-8 bg-primary/10 border border-primary/20 shrink-0 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-primary/15 w-1/4 animate-pulse"></div>
            <div className="h-16 bg-card/50 border border-primary/10 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface CaseFileProps {
  params: { caseId: string };
}

export default function CaseFile({ params }: CaseFileProps) {
  const { caseId } = params;
  const { data: leads, isLoading, error } = useCaseLeads(caseId);

  const caseTitle = leads?.[0]?.cases?.title ?? "UNKNOWN CASE";
  const leadCount = leads?.length ?? 0;

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 md:px-8 max-w-5xl mx-auto crt-flicker relative z-10">
      {/* Top nav bar */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/">
          <button
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary/70 border border-primary/20 px-3 py-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
            data-testid="button-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Ledger
          </button>
        </Link>
        <div className="flex-1 h-px bg-primary/10"></div>
        <div className="text-[10px] text-primary/30 uppercase tracking-widest font-mono hidden sm:block">
          VIEWING: CASE_ID_{caseId}
        </div>
      </div>

      {/* Case header */}
      <header className="mb-10 border-b-2 border-primary/30 pb-6 relative">
        <div className="absolute bottom-0 left-0 w-1/4 h-[2px] bg-primary shadow-[0_0_15px_rgba(255,153,0,0.8)]"></div>
        <div className="flex items-start gap-5">
          <div className="p-3 border border-primary/40 bg-primary/10 shrink-0 mt-1">
            <ShieldAlert className="w-7 h-7 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              CLASSIFIED CASE FILE
            </div>
            <h1
              className="text-2xl md:text-4xl font-black tracking-tighter text-primary uppercase truncate neon-text"
              data-testid="text-case-title"
            >
              {caseTitle}
            </h1>
            {!isLoading && (
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground uppercase tracking-wider">
                <span>{leadCount} TRANSMISSION{leadCount !== 1 ? "S" : ""} LOGGED</span>
                {leads && leads.length > 0 && leads[0].created_at && (
                  <span>
                    OPENED:{" "}
                    {format(new Date(leads[0].created_at as string), "yyyy-MM-dd")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Transmission log */}
      <main>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-primary/15"></div>
          <span className="text-[10px] uppercase tracking-widest text-primary/40 font-mono">
            ── TRANSMISSION LOG (CHRONOLOGICAL) ──
          </span>
          <div className="h-px flex-1 bg-primary/15"></div>
        </div>

        {isLoading && <LoadingSkeleton />}

        {error && (
          <div className="bg-destructive/10 border-2 border-destructive p-6 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse"></div>
            <AlertTriangle className="w-7 h-7 text-destructive shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1 text-destructive uppercase tracking-widest">ACCESS DENIED</h3>
              <p className="text-destructive/80 text-sm font-mono">{error.message}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && leadCount === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-primary/20 text-muted-foreground flex flex-col items-center gap-4">
            <Terminal className="w-10 h-10 opacity-20" />
            <span className="tracking-widest uppercase text-sm">NO_TRANSMISSIONS_FOUND</span>
          </div>
        )}

        {!isLoading && !error && leads && leads.length > 0 && (
          <div>
            {leads.map((lead, index) => (
              <TransmissionEntry key={lead.id} lead={lead} index={index} />
            ))}
            {/* End of log marker */}
            <div className="flex items-center gap-4 mt-4">
              <div className="h-px flex-1 bg-primary/10"></div>
              <span className="text-[10px] uppercase tracking-widest text-primary/25 font-mono">── END OF RECORD ──</span>
              <div className="h-px flex-1 bg-primary/10"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
