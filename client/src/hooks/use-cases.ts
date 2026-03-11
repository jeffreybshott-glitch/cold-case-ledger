import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CaseRow = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string | null;
};

export function useCases() {
  return useQuery<CaseRow[]>({
    queryKey: ['/api/cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, description, created_at')
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return (data as CaseRow[]) || [];
    },
  });
}
