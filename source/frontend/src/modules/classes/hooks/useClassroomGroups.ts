import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getCurrentUserFromToken } from '@/lib/token'

// Import utils
import { getNumericId, getMemberIds } from '@/utils/groupUtils'

// Import APIs
import {
  createClassroomGroupApi,
  getClassroomEnrollmentsApi,
  getClassroomGroupsApi,
  requestJoinGroupApi
} from '../api/classroomGroupApi'
import {
  deleteClassroomApi,
  removeStudentFromClassroomApi
} from '../api/classroomApi'

// Import Types
import type { CreateGroupRequest } from '@/modules/groups/types/group.request'
import type {
  ClassroomEnrollmentItem,
  ClassroomGroupItem,
  CreateClassroomGroupRequest
} from '../types/classroomGroup'

// Import key list từ useClass (nếu project của bạn đang dùng)
import { classKeys } from './useClass'
import { toast } from 'sonner'

// ==========================================
// 1. QUERY KEYS
// ==========================================
export const classroomGroupKeys = {
  all: ['classroom-groups'] as const,
  groups: (classroomId: number | string) =>
    [...classroomGroupKeys.all, 'groups', String(classroomId)] as const,
  enrollments: (classroomId: number | string) =>
    [...classroomGroupKeys.all, 'enrollments', String(classroomId)] as const
}

// ==========================================
// 2. DATA FETCHING & MUTATION HOOKS
// ==========================================
export const useClassroomGroups = (classroomId?: number | string) => {
  return useQuery<ClassroomGroupItem[]>({
    queryKey: classroomId
      ? classroomGroupKeys.groups(classroomId)
      : [...classroomGroupKeys.all, 'groups', 'unknown'],
    queryFn: () => getClassroomGroupsApi(classroomId as number | string),
    enabled: classroomId !== undefined && String(classroomId).trim() !== ''
  })
}

export const useClassroomEnrollments = (classroomId?: number | string) => {
  return useQuery<ClassroomEnrollmentItem[]>({
    queryKey: classroomId
      ? classroomGroupKeys.enrollments(classroomId)
      : [...classroomGroupKeys.all, 'enrollments', 'unknown'],
    queryFn: () => getClassroomEnrollmentsApi(classroomId as number | string),
    enabled: classroomId !== undefined && String(classroomId).trim() !== ''
  })
}

export const useCreateClassroomGroup = (classroomId?: number | string) => {
  const queryClient = useQueryClient()

  return useMutation<ClassroomGroupItem, Error, CreateClassroomGroupRequest>({
    mutationFn: payload =>
      createClassroomGroupApi(classroomId as number | string, payload),
    onSuccess: () => {
      if (classroomId !== undefined && String(classroomId).trim() !== '') {
        queryClient.invalidateQueries({
          queryKey: classroomGroupKeys.groups(classroomId)
        })
        queryClient.invalidateQueries({
          queryKey: classroomGroupKeys.enrollments(classroomId)
        })
      }
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
    }
  })
}

export const useRequestJoinGroup = () => {
  return useMutation<void, Error, number | string>({
    mutationFn: groupId => requestJoinGroupApi(groupId)
  })
}

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classroomId: number | string) =>
      deleteClassroomApi(classroomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      toast.success('Xóa lớp học thành công')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa lớp học')
    }
  })
}

export const useRemoveStudentFromClassroom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classroomId,
      studentId
    }: {
      classroomId: number | string
      studentId: number
    }) => removeStudentFromClassroomApi(classroomId, studentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: classroomGroupKeys.enrollments(variables.classroomId)
      })
      queryClient.invalidateQueries({
        queryKey: classKeys.detail(String(variables.classroomId))
      })
      toast.success('Đã xóa sinh viên khỏi lớp')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa sinh viên')
    }
  })
}

// ==========================================
// 3. FEATURE HOOK (Logic kết hợp cho giao diện UI)
// ==========================================
export const useStudentGroupLogic = (subjectName: string) => {
  const { id: classroomIdParam } = useParams<{ id: string }>()
  const classroomId = classroomIdParam || ''

  const currentUser = getCurrentUserFromToken()
  const currentUserId = currentUser.id

  const {
    data: groups = [],
    isLoading: groupsLoading,
    isError: groupsError
  } = useClassroomGroups(classroomId)

  const {
    data: enrollments = [],
    isLoading: enrollmentLoading,
    isError: enrollmentError
  } = useClassroomEnrollments(classroomId)

  const createGroupMutation = useCreateClassroomGroup(classroomId)
  const joinGroupMutation = useRequestJoinGroup()

  const myGroup = useMemo(() => {
    const normalizedUserId = getNumericId(currentUserId)
    if (!normalizedUserId) return null

    return (
      groups.find(group => getMemberIds(group).includes(normalizedUserId)) ||
      null
    )
  }, [currentUserId, groups])

  const handleCreateGroup = async (payload: CreateGroupRequest) => {
    await createGroupMutation.mutateAsync({
      name: payload.name,
      subjectOrProjectName: subjectName,
      limitedUser: payload.limitedUser
    })
  }

  const handleJoinGroup = async (groupId: number | string) => {
    await joinGroupMutation.mutateAsync(groupId)
  }

  return {
    classroomId,
    groups,
    enrollments,
    myGroup,
    isLoading: groupsLoading || enrollmentLoading,
    hasLoadIssue: groupsError || enrollmentError,
    handleCreateGroup,
    isCreating: createGroupMutation.isPending,
    handleJoinGroup,
    isJoiningGroup: joinGroupMutation.isPending
  }
}
