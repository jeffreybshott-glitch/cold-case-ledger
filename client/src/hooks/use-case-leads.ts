import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type LeadRow } from "./use-leads";

export function useCaseLeads(caseId: string) {
  return useQuery<LeadRow[]>({
    queryKey: ['/api/leads/case', caseId],
    queryFn: async () => {
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
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return (data as LeadRow[]) || [];
    },
    enabled: !!caseId,
  });
}
