import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createClass,
  getClasses,
  getClassroomCode,
  getClassroomDetail
} from '../api/classApi'
import type { ClassResponse, CreateClassPayload } from '../types/class'
import { getCurrentUserFromToken } from '@/lib/token'

export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...classKeys.details(), String(id)] as const,
  codes: () => [...classKeys.all, 'codes'] as const,
  code: (id: number | string) => [...classKeys.codes(), String(id)] as const,
  codesByIds: (ids: Array<number | string>) =>
    [...classKeys.codes(), 'batch', ids.map(String).join(',')] as const
}

export const useGetClasses = () => {
  return useQuery<ClassResponse[]>({
    queryKey: classKeys.lists(),
    queryFn: getClasses
  })
}

export const useCreateClass = () => {
  const queryClient = useQueryClient()

  return useMutation<ClassResponse, Error, CreateClassPayload>({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
    }
  })
}

export const useGetClassroomDetail = (id?: string) => {
  return useQuery({
    queryKey: classKeys.detail(id as string),
    queryFn: () => getClassroomDetail(id as string),
    enabled: !!id
  })
}

export const useGetClassroomCodes = (ids: Array<number | string>) => {
  const normalizedIds = ids.map(String).filter(Boolean)

  const currentUser = getCurrentUserFromToken()
  const normalizedRole = (currentUser?.systemRole || '').toUpperCase()

  const isStudent = normalizedRole.includes('STUDENT')

  return useQuery<Record<string, string>>({
    queryKey: classKeys.codesByIds(normalizedIds),

    enabled: normalizedIds.length > 0 && !isStudent,

    queryFn: async () => {
      const entries = await Promise.all(
        normalizedIds.map(async id => {
          const code = await getClassroomCode(id)
          return [id, code] as const
        })
      )

      return Object.fromEntries(entries)
    }
  })
}
