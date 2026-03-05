import { useQuery } from "@tanstack/react-query"
import { getJobRolesAction } from "../services/jobRoleService"

export function useJobRole() {
  return useQuery({
    queryKey: ["jobRoles"],
    queryFn: async () => {
      const response = await getJobRolesAction()
      
      if (response && 'error' in response) {
        throw new Error(response.error as string)
      }
      
      return response as any[] 
    },
  })
}