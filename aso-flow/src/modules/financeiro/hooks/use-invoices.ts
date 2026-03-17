import { useQuery } from "@tanstack/react-query"
import { getInvoicesAction } from "../services/invoiceService"

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await getInvoicesAction()

      // Handle if the Supabase action returns an error object explicitly
      if (response && !Array.isArray(response) && typeof response === "object" && "error" in response) {
        throw new Error((response as { error: string }).error)
      }

      return response as any[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
