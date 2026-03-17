import { useQuery } from "@tanstack/react-query"
import { getAttendancesAction } from "../services/attendanceService"

export function useAttendances() {
  return useQuery({
    queryKey: ["attendances"],
    queryFn: async () => {
      const response = await getAttendancesAction()

      if (response && !Array.isArray(response) && typeof response === "object" && "error" in response) {
        throw new Error((response as { error: string }).error)
      }

      return response as any[]
    },
  })
}
