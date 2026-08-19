import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  activateClassroomApi,
  deactivateClassroomApi,
  updateClassroomApi
} from '../api/classroomTeacherApi'
import type {
  ClassroomId,
  ClassroomTeacherResponse,
  UpdateClassroomRequest
} from '../types/classroomTeacher'
import { classKeys } from './useClass'

const invalidateClassroomData = (
  queryClient: ReturnType<typeof useQueryClient>,
  classroomId: ClassroomId
) => {
  queryClient.invalidateQueries({ queryKey: classKeys.lists() })
  queryClient.invalidateQueries({ queryKey: classKeys.detail(classroomId) })
}

export const useUpdateClassroom = (classroomId: ClassroomId) => {
  const queryClient = useQueryClient()

  return useMutation<ClassroomTeacherResponse, Error, UpdateClassroomRequest>({
    mutationFn: payload => updateClassroomApi(classroomId, payload),
    onSuccess: () => {
      invalidateClassroomData(queryClient, classroomId)
      toast.success('Cập nhật thông tin lớp học thành công')
    }
  })
}

export const useActivateClassroom = (classroomId: ClassroomId) => {
  const queryClient = useQueryClient()

  return useMutation<ClassroomTeacherResponse, Error, void>({
    mutationFn: () => activateClassroomApi(classroomId),
    onSuccess: () => {
      queryClient.setQueryData(classKeys.detail(classroomId), (prev: any) =>
        prev ? { ...prev, isActive: true } : prev
      )
      invalidateClassroomData(queryClient, classroomId)
      toast.success('Đã kích hoạt lại lớp học')
    }
  })
}

export const useDeactivateClassroom = (classroomId: ClassroomId) => {
  const queryClient = useQueryClient()

  return useMutation<ClassroomTeacherResponse, Error, void>({
    mutationFn: () => deactivateClassroomApi(classroomId),
    onSuccess: () => {
      queryClient.setQueryData(classKeys.detail(classroomId), (prev: any) =>
        prev ? { ...prev, isActive: false } : prev
      )
      invalidateClassroomData(queryClient, classroomId)
      toast.success('Đã vô hiệu hóa lớp học')
    }
  })
}
