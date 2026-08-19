import { useQuery } from '@tanstack/react-query'
import { getAccountsAPI } from '@/modules/admin/api/account.api'
import type { TaskHistoryTimelineMember } from '../components/TaskHistoryTimeline'

export const taskHistoryUserKeys = {
  all: ['task-history-users'] as const
}

export const useTaskHistoryUsers = () => {
  return useQuery<TaskHistoryTimelineMember[]>({
    queryKey: taskHistoryUserKeys.all,
    queryFn: async () => {
      const accounts = await getAccountsAPI()

      return accounts.map(account => ({
        id: account.id,
        fullName: account.fullName,
        userName: account.fullName,
        email: account.email
      }))
    },
    staleTime: 5 * 60 * 1000
  })
}
