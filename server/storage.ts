import { createClient } from '@supabase/supabase-js';
import type { Lead, Case } from '@shared/schema';

type CreateLeadData = { case_id: string; agent_id: string; content: string; source_url?: string };

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface IStorage {
  getLeads(): Promise<Lead[]>;
  createCase(data: { title: string; description: string; location: string; agent_id?: string }): Promise<Case>;
  createLead(data: CreateLeadData): Promise<Lead>;
  incrementAgentRpScore(agentId: string, points: number): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  async incrementAgentRpScore(agentId: string, points: number): Promise<void> {
    const { error } = await supabase.rpc('increment_agent_rp_score', {
      agent_id: agentId,
      points,
    });

    if (error) {
      console.error('incrementAgentRpScore error:', error.message);
    }
  }

  async createCase(data: { title: string; description: string; location: string; agent_id?: string }): Promise<Case> {
    const { agent_id, ...caseData } = data;
    const { data: created, error } = await supabase
      .from('cases')
      .insert({ ...caseData, status: 'active' })
      .select('id, title, description, location, status, created_at')
      .single();

    if (error) {
      console.error('Error creating case:', error);
      throw new Error(error.message);
    }

    if (agent_id) {
      await this.incrementAgentRpScore(agent_id, 50);
    }

    return created as Case;
  }

  async createLead(data: CreateLeadData): Promise<Lead> {
    const { agent_id, ...leadData } = data;
    const { data: created, error } = await supabase
      .from('leads')
      .insert({ ...leadData, agent_id, consensus_score: 0 })
      .select(`
        *,
        agents ( id, name ),
        cases ( id, title )
      `)
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw new Error(error.message);
    }

    await this.incrementAgentRpScore(agent_id, 10);

    return created as Lead;
  }

  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
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
