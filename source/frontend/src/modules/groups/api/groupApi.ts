import api from '@/lib/axios'

export interface Contribution {
  userName: string
  githubUserName: string | null
  totalCommit: number
  totalContribution: number
}

export interface GroupContributionResponse {
  value: Contribution[]
  isSuccess: boolean
  isFailure: boolean
  error: {
    code: string
    message: string
  }
}

export const getGroupContributions = async (
  groupId: string
): Promise<GroupContributionResponse> => {
  const response = await api.get<GroupContributionResponse>(
    `/group/${groupId}/contribution`
  )

  return response.data
}
