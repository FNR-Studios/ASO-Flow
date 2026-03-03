import { useQuery } from "@tanstack/react-query"
import { getProceduresAction } from "../services/procedureService"

export function useProcedures() {
  return useQuery({
    queryKey: ["procedures"],
    queryFn: async () => {
      const data = await getProceduresAction()
      return data || []
    },
  })
}