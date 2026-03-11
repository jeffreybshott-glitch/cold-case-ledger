import { createClient } from '@supabase/supabase-js';
import type { Lead } from '@shared/schema';

const supabaseUrl = 'https://krwospkublmuzclzmbpm.supabase.co';
const supabaseKey = 'sb_publishable_UlJ2tWMoFJsYkiPMpqzjzA_Dhd_NTON';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface IStorage {
  getLeads(): Promise<Lead[]>;
}

export class SupabaseStorage implements IStorage {
  async getLeads(): Promise<Lead[]> {
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
