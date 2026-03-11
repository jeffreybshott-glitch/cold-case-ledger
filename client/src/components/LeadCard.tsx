import { type LeadRow } from "@/hooks/use-leads";
import { format } from "date-fns";
import { ShieldAlert, User, FileText, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface LeadCardProps {
  lead: LeadRow;
  index: number;
}

// Attempts to find a meaningful text body from whatever columns exist
function getLeadContent(lead: LeadRow): string {
  const knownContentKeys = ["description", "notes", "details", "content", "summary", "body", "text", "info"];
  for (const key of knownContentKeys) {
    if (typeof lead[key] === "string" && (lead[key] as string).trim()) {
      return lead[key] as string;
    }
  }
  // Fallback: find any string field that isn't an id or timestamp
  const skipKeys = new Set(["id", "created_at", "updated_at", "agent_id", "case_id"]);
  for (const [key, val] of Object.entries(lead)) {
    if (!skipKeys.has(key) && typeof val === "string" && val.trim() && !key.endsWith("_id")) {
      return val;
    }
  }
  return "NO_CONTENT_AVAILABLE";
}

export function LeadCard({ lead, index }: LeadCardProps) {
  const agentName = lead.agents?.name ?? "UNASSIGNED_AGENT";
  const caseTitle = lead.cases?.title ?? "UNCLASSIFIED_CASE";
  const content = getLeadContent(lead);
  const formattedDate = lead.created_at
    ? format(new Date(lead.created_at as string), "yyyy-MM-dd HH:mm:ss")
    : "UNKNOWN_TIMESTAMP";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="group relative bg-card border border-primary/20 p-5 md:p-6 neon-box hover:border-primary/80 transition-colors duration-300"
      data-testid={`card-lead-${lead.id}`}
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary transition-all group-hover:w-4 group-hover:h-4 duration-300"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary transition-all group-hover:w-4 group-hover:h-4 duration-300"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary transition-all group-hover:w-4 group-hover:h-4 duration-300"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary transition-all group-hover:w-4 group-hover:h-4 duration-300"></div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 border-b border-primary/10 pb-4">
        {/* Left: Case Info */}
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
            <ShieldAlert className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-1">
              <FileText className="w-3 h-3 text-primary/70" />
              <span data-testid={`text-case-${lead.id}`}>{caseTitle}</span>
            </div>
            <div className="font-bold text-lg md:text-xl text-primary uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary/40 text-sm">ID:</span>
              <span data-testid={`text-lead-id-${lead.id}`}>{lead.id}</span>
            </div>
          </div>
        </div>

        {/* Right: Meta Info */}
        <div className="flex flex-col md:items-end gap-2">
          <div
            className="flex items-center gap-2 text-sm text-foreground bg-primary/5 px-3 py-1.5 border border-primary/20 whitespace-nowrap"
            data-testid={`text-agent-${lead.id}`}
          >
            <User className="w-4 h-4 text-primary" />
            <span className="font-semibold tracking-wide">{agentName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            <span className="opacity-80" data-testid={`text-date-${lead.id}`}>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="relative mt-2">
        <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-primary/50 to-transparent"></div>
        <div className="pl-4">
          <p
            className="text-foreground/90 leading-relaxed text-sm md:text-base whitespace-pre-wrap flex items-start gap-2"
            data-testid={`text-content-${lead.id}`}
          >
            <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-1 opacity-70" />
            <span className="break-words">{content}</span>
          </p>
        </div>
      </div>

      {/* Scanline hover effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"></div>
    </motion.div>
  );
}
