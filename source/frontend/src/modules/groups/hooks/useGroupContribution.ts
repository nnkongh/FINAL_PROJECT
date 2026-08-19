import { useQuery } from '@tanstack/react-query'
import { getGroupContributions } from '@/modules/groups/api/groupApi'

export const useGroupContribution = (groupId?: string) => {
  return useQuery({
    queryKey: ['groupContributions', groupId],
    queryFn: () => getGroupContributions(groupId as string),
    enabled: !!groupId
  })
}
