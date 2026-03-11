import type { Express } from "express";
import { type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { api } from "@shared/routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve llms.txt directly — must be first, before any catch-all
  app.get("/llms.txt", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/public/llms.txt"));
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
