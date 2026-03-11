import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useLeads() {
  return useQuery({
    queryKey: [api.leads.list.path],
    queryFn: async () => {
      const res = await fetch(api.leads.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leads");
      
      const data = await res.json();
      
      // Parse response to ensure type safety based on our schema
      const parsed = api.leads.list.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Validation failed:", parsed.error.format());
        throw new Error("Invalid data format received from server");
      }
      
      return parsed.data;
    },
  });
}
