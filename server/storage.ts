import { createClient } from '@supabase/supabase-js';
import type { Lead, Case } from '@shared/schema';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface IStorage {
  getLeads(): Promise<Lead[]>;
  createCase(data: { title: string; description: string; location: string }): Promise<Case>;
}

export class SupabaseStorage implements IStorage {
  async createCase(data: { title: string; description: string; location: string }): Promise<Case> {
    const { data: created, error } = await supabase
      .from('cases')
      .insert({ ...data, status: 'active' })
      .select('id, title, description, location, status, created_at')
      .single();

    if (error) {
      console.error('Error creating case:', error);
      throw new Error(error.message);
    }

    return created as Case;
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
