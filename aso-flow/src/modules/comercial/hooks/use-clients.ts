import { useQuery } from "@tanstack/react-query"
import { getClientAction } from "../services/clientService"

export function useClients() {
  return useQuery({
    queryKey: ["clients"], // Esta é a "chave" do cache.
    queryFn: async () => {
      const data = await getClientAction()
      return data || [] 
    },
  })
}