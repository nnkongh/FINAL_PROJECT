import api from '@/lib/axios'

export interface JoinClassRequest {
  classCode: string
}

export interface JoinClassResponse {
  id?: number
  classId?: number
  className?: string
  classCode?: string
  inviteCode?: string
}

export interface RegenerateInviteCodeResponse {
  classId?: number
  className?: string
  classCode?: string
  inviteCode?: string
}

interface ApiErrorPayload {
  code?: string
  message?: string
}

interface ApiEnvelope<T> {
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

export const joinClassApi = async (
  payload: JoinClassRequest
): Promise<JoinClassResponse> => {
  try {
    const response = await api.post<
      ApiEnvelope<JoinClassResponse> | JoinClassResponse
    >('/classroom/join', payload)

    return unwrapEnvelope<JoinClassResponse>(response.data)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Tham gia lớp thất bại')
  }
}

export const regenerateInviteCodeApi = async (
  classroomId: number | string
): Promise<RegenerateInviteCodeResponse> => {
  const response = await api.post<
    ApiEnvelope<RegenerateInviteCodeResponse> | RegenerateInviteCodeResponse
  >(`/classroom/${classroomId}/invite-code`)

  return unwrapEnvelope<RegenerateInviteCodeResponse>(response.data)
}
