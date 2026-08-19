import api from '@/lib/axios'

export * from '../types/classroomGroup'
import type {
  ApiEnvelope,
  ClassroomGroupItem,
  ClassroomEnrollmentItem,
  CreateClassroomGroupRequest
} from '../types/classroomGroup'

const isObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const unwrapEnvelope = <T>(payload: ApiEnvelope<T> | T): T => {
  if (!isObject(payload)) return payload as T

  if ('isFailure' in payload || 'isSuccess' in payload || 'value' in payload) {
    const envelope = payload as ApiEnvelope<T>

    if (envelope.isFailure || envelope.isSuccess === false) {
      throw new Error(envelope.error?.message || 'Request failed')
    }

    if (envelope.value !== undefined) return envelope.value
    if (envelope.data !== undefined) return envelope.data
  }

  return payload as T
}

const extractArrayByKeys = <T>(payload: unknown, keys: string[]): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (!isObject(payload)) return []

  for (const key of keys) {
    const value = payload[key]
    if (Array.isArray(value)) return value as T[]
  }

  return []
}

export const getClassroomGroupsApi = async (
  classroomId: number | string
): Promise<ClassroomGroupItem[]> => {
  const response = await api.get<ApiEnvelope<unknown> | unknown>(
    `/classroom/${classroomId}/groups`
  )

  const data = unwrapEnvelope<unknown>(
    response.data as ApiEnvelope<unknown> | unknown
  )

  return extractArrayByKeys<ClassroomGroupItem>(data, ['groups', 'items'])
}

export const getClassroomEnrollmentsApi = async (
  classroomId: number | string
): Promise<ClassroomEnrollmentItem[]> => {
  const response = await api.get<ApiEnvelope<unknown> | unknown>(
    `/classroom/${classroomId}/enrollment`
  )

  const data = unwrapEnvelope<unknown>(
    response.data as ApiEnvelope<unknown> | unknown
  )

  return extractArrayByKeys<ClassroomEnrollmentItem>(data, [
    'enrollments',
    'students',
    'members',
    'items'
  ])
}

export const createClassroomGroupApi = async (
  classroomId: number | string,
  payload: CreateClassroomGroupRequest
): Promise<ClassroomGroupItem> => {
  const response = await api.post<
    ApiEnvelope<ClassroomGroupItem> | ClassroomGroupItem
  >(`/classroom/${classroomId}/groups`, payload)

  return unwrapEnvelope<ClassroomGroupItem>(response.data)
}

export const requestJoinGroupApi = async (
  groupId: number | string
): Promise<void> => {
  const response = await api.post<ApiEnvelope<unknown>>(
    `/group/${groupId}/join-request`
  )

  unwrapEnvelope(response.data)
}
