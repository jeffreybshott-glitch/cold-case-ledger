import { createClient } from '@supabase/supabase-js';
import type { Lead } from '@shared/schema';

const supabaseUrl = 'https://krwospkublmuzclzmbpm.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface IStorage {
  getLeads(): Promise<Lead[]>;
}

export class SupabaseStorage implements IStorage {
  async getLeads(): Promise<Lead[]> {
    if (!supabase) {
      console.warn("SUPABASE_ANON_KEY is not set. Returning mock leads for preview.");
      return [
        {
          id: "mock-1",
          description: "Unidentified signal intercepted on frequency 88.5 MHz. Possible coordinates linked to sector 7G.",
          created_at: new Date().toISOString(),
          agent_id: "a1",
          case_id: "c1",
          agents: { id: "a1", name: "Agent K" },
          cases: { id: "c1", title: "Project Blue Book" }
        },
        {
          id: "mock-2",
          description: "Subject 'Neon' spotted near the abandoned docks. Surveillance footage corrupted at 03:42 AM.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          agent_id: "a2",
          case_id: "c2",
          agents: { id: "a2", name: "Agent J" },
          cases: { id: "c2", title: "The Neon Syndicate" }
        }
      ];
    }

    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        description,
        created_at,
        agent_id,
        case_id,
        agents (
          id,
          name
        ),
        cases (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Failed to fetch leads');
    }

    return (data || []) as Lead[];
  }
}

export const storage = new SupabaseStorage();
