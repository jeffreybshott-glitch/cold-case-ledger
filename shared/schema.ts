import { z } from "zod";
import { pgTable, serial } from "drizzle-orm/pg-core";

// We define Zod schemas to type the data coming from Supabase
export const agentSchema = z.object({
  id: z.string().or(z.number()),
  name: z.string(),
});

export const caseSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
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
