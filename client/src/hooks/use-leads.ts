import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type LeadRow = {
  id: string | number;
  created_at?: string;
  agents?: { id: string | number; name: string; rp_score?: number } | null;
  cases?: { id: string | number; title: string } | null;
  [key: string]: unknown;
};

export function useLeads() {
  return useQuery<LeadRow[]>({
    queryKey: ['/api/leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          agents (
            id,
            name,
            rp_score
          ),
          cases (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as LeadRow[]) || [];
    },
  });
}
