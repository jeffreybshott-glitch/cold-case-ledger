import { useLeads } from "@/hooks/use-leads";
import { LeadCard } from "@/components/LeadCard";
import { Terminal, Database, RefreshCw, AlertTriangle, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: leads, isLoading, error, refetch, isRefetching } = useLeads();

  return (
    <div className="min-h-screen pt-8 pb-24 px-4 md:px-8 max-w-5xl mx-auto crt-flicker relative z-10">
      <header className="mb-10 border-b-2 border-primary/30 pb-6 relative">
        <div className="absolute bottom-0 left-0 w-1/4 h-[2px] bg-primary shadow-[0_0_15px_rgba(255,153,0,0.8)]"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3 text-primary neon-text">
              <Terminal className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                COLD_CASE_LEDGER
              </h1>
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
            LATEST_LEADS.DAT
          </h2>
          
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary border border-primary/40 px-4 py-2 hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-auto justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Sync Databank
          </button>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-4 md:space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/40 border border-primary/10 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                <div className="flex gap-4 mb-4 relative z-10">
                  <div className="w-10 h-10 bg-primary/20"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-primary/20 w-1/3"></div>
                    <div className="h-6 bg-primary/20 w-1/4"></div>
                  </div>
                </div>
                <div className="space-y-2 relative z-10">
                  <div className="h-4 bg-primary/10 w-full"></div>
                  <div className="h-4 bg-primary/10 w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
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

        {/* Success / Data State */}
        {!isLoading && !error && leads && (
          <div className="space-y-4 md:space-y-6">
            {leads.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 border-2 border-dashed border-primary/30 text-muted-foreground flex flex-col items-center gap-4 bg-card/30"
              >
                <Terminal className="w-12 h-12 opacity-20" />
                <span className="tracking-widest uppercase text-sm font-bold">
                  NO_ACTIVE_LEADS_FOUND_IN_DIRECTORY
                </span>
              </motion.div>
            ) : (
              leads.map((lead, index) => (
                <LeadCard key={lead.id} lead={lead} index={index} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
