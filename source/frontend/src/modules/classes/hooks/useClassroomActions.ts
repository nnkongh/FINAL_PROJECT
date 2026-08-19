import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  joinClassApi,
  regenerateInviteCodeApi,
  type JoinClassRequest,
  type JoinClassResponse,
  type RegenerateInviteCodeResponse
} from '../api/classroomActionApi'
import { classKeys } from './useClass'

const invalidateClassroomQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  classroomId: number | string
) => {
  queryClient.invalidateQueries({ queryKey: classKeys.lists() })
  queryClient.invalidateQueries({ queryKey: classKeys.detail(classroomId) })
  queryClient.invalidateQueries({ queryKey: classKeys.codes() })
}

export const useJoinClass = () => {
  const queryClient = useQueryClient()

  return useMutation<JoinClassResponse, Error, JoinClassRequest>({
    mutationFn: joinClassApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
    }
  })
}

export const useRegenerateInviteCode = () => {
  const queryClient = useQueryClient()

  return useMutation<RegenerateInviteCodeResponse, Error, number | string>({
    mutationFn: regenerateInviteCodeApi,
    onSuccess: (_, classroomId) => {
      invalidateClassroomQueries(queryClient, classroomId)
      toast.success('Tạo mã mời mới thành công')
    }
  })
}

export const useChangeInviteCode = (classroomId: number | string) => {
  const queryClient = useQueryClient()

  return useMutation<RegenerateInviteCodeResponse, Error, void>({
    mutationFn: () => regenerateInviteCodeApi(classroomId),
    onSuccess: () => {
      invalidateClassroomQueries(queryClient, classroomId)
      toast.success('Tạo mã mời mới thành công')
    }
  })
}
