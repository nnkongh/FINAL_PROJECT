import api from '@/lib/axios'
import type {
  ClassroomId,
  ClassroomTeacherResponse,
  UpdateClassroomRequest
} from '../types/classroomTeacher'

type ApiErrorPayload = {
  code?: string
  message?: string
}

type ApiEnvelope<T> = {
  value?: T
  data?: T
  isSuccess?: boolean
  isFailure?: boolean
  error?: ApiErrorPayload
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const unwrapEnvelope = <T>(payload: ApiEnvelope<T> | T): T => {
  if (!isObject(payload)) {
    return payload as T
  }

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

export const updateClassroomApi = async (
  classroomId: ClassroomId,
  payload: UpdateClassroomRequest
): Promise<ClassroomTeacherResponse> => {
  const response = await api.put<
    ApiEnvelope<ClassroomTeacherResponse> | ClassroomTeacherResponse
  >(`/classroom/${classroomId}`, payload)

  return unwrapEnvelope<ClassroomTeacherResponse>(response.data)
}

export const activateClassroomApi = async (
  classroomId: ClassroomId
): Promise<ClassroomTeacherResponse> => {
  const response = await api.put<
    ApiEnvelope<ClassroomTeacherResponse> | ClassroomTeacherResponse
  >(`/classroom/${classroomId}/activate`)

  return unwrapEnvelope<ClassroomTeacherResponse>(response.data)
}

export const deactivateClassroomApi = async (
  classroomId: ClassroomId
): Promise<ClassroomTeacherResponse> => {
  const response = await api.put<
    ApiEnvelope<ClassroomTeacherResponse> | ClassroomTeacherResponse
  >(`/classroom/${classroomId}/deactivate`)

  return unwrapEnvelope<ClassroomTeacherResponse>(response.data)
}
