import { Link } from "wouter";
import { AlertTriangle, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background crt-flicker p-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center border-2 border-primary/30 bg-card p-8 md:p-12 relative neon-box"
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary"></div>

        <div className="flex justify-center mb-8">
          <div className="p-5 bg-primary/10 border border-primary/20 animate-pulse">
            <AlertTriangle className="w-16 h-16 text-primary neon-text" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-primary mb-4 tracking-widest neon-text font-mono">
          404
        </h1>
        
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 bg-primary/10 py-2 border-y border-primary/30 uppercase tracking-widest">
          DIRECTORY_NOT_FOUND
        </h2>

        <p className="text-muted-foreground mb-10 text-sm md:text-base uppercase tracking-wider leading-relaxed max-w-md mx-auto">
          The requested record does not exist or requires higher security clearance. Access attempt has been logged.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-3 text-primary border border-primary bg-primary/5 px-8 py-4 hover:bg-primary/20 transition-all font-bold tracking-widest uppercase group w-full sm:w-auto"
        >
          <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          Return to Ledger
        </Link>
      </motion.div>
    </div>
  );
}
