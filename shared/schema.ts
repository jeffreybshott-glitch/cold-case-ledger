import { z } from "zod";
import { pgTable, serial } from "drizzle-orm/pg-core";

// We define Zod schemas to type the data coming from Supabase
export const agentSchema = z.object({
  id: z.string().or(z.number()),
  name: z.string(),
  rp_score: z.number().int().default(0).optional(),
});

export const caseSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
});

export const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  agent_id: z.string().uuid("agent_id must be a valid UUID").optional(),
});

export const createLeadSchema = z.object({
  case_id: z.string().uuid("case_id must be a valid UUID"),
  agent_id: z.string().uuid("agent_id must be a valid UUID"),
  content: z.string().min(1, "Content is required"),
  source_url: z.string().url().optional().or(z.literal("")),
});

export const leadSchema = z.object({
  id: z.string().or(z.number()),
  description: z.string(),
  created_at: z.string().optional(),
  agent_id: z.string().or(z.number()).optional(),
  case_id: z.string().or(z.number()).optional(),
  agents: agentSchema.optional().nullable(),
  cases: caseSchema.optional().nullable(),
});

export type Agent = z.infer<typeof agentSchema>;
export type Case = z.infer<typeof caseSchema>;
export type Lead = z.infer<typeof leadSchema>;

// Dummy table to satisfy Drizzle setup if needed
export const _dummy = pgTable("_dummy", { id: serial("id").primaryKey() });
