import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve llms.txt directly — must be first, before any catch-all.
  // In dev: file lives at client/public/llms.txt
  // In production: Vite copies client/public/ to dist/public/ at build time
  const llmsFile = path.join(
    process.cwd(),
    process.env.NODE_ENV === "production" ? "dist/public" : "client/public",
    "llms.txt"
  );
  app.get("/llms.txt", (_req, res) => {
    res.sendFile(llmsFile);
  });

  app.get(api.leads.list.path, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  return httpServer;
}
