import api from '@/lib/axios'
import type { ClassResponse, CreateClassPayload } from '../types/class'
import { getCurrentUserFromToken } from '@/lib/token'

interface CreateClassApiResponse {
  value?: ClassResponse
  data?: ClassResponse
  isSuccess?: boolean
  isFailure?: boolean
  error?: {
    code?: string
    message?: string
  }
}

interface GetClassesApiResponse {
  value?: ClassResponse[]
  data?: ClassResponse[]
  isSuccess?: boolean
  isFailure?: boolean
  error?: {
    code?: string
    message?: string
  }
}

interface GetClassroomCodeApiResponse {
  value?: string | { classCode?: string; inviteCode?: string; code?: string }
  data?: string | { classCode?: string; inviteCode?: string; code?: string }
  isSuccess?: boolean
  isFailure?: boolean
  error?: {
    code?: string
    message?: string
  }
}

const throwIfFailure = (payload: {
  isSuccess?: boolean
  isFailure?: boolean
  error?: { message?: string }
}) => {
  if (payload?.isFailure || payload?.isSuccess === false) {
    throw new Error(payload?.error?.message || 'Request failed')
  }
}

const isClassResponse = (value: unknown): value is ClassResponse => {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof (value as { id?: unknown }).id === 'number'
  )
}

const isCreateClassApiResponse = (
  value: unknown
): value is CreateClassApiResponse => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const isGetClassesApiResponse = (
  value: unknown
): value is GetClassesApiResponse => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const isGetClassroomCodeApiResponse = (
  value: unknown
): value is GetClassroomCodeApiResponse => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const extractClassCode = (payload: unknown): string | null => {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim()
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const codeCandidate = (
      payload as { classCode?: unknown; inviteCode?: unknown; code?: unknown }
    ).classCode
    const inviteCandidate = (
      payload as { classCode?: unknown; inviteCode?: unknown; code?: unknown }
    ).inviteCode
    const genericCodeCandidate = (
      payload as { classCode?: unknown; inviteCode?: unknown; code?: unknown }
    ).code

    const candidates = [codeCandidate, inviteCandidate, genericCodeCandidate]
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim()
      }
    }
  }

  return null
}

export const createClass = async (
  payload: CreateClassPayload
): Promise<ClassResponse> => {
  const response = await api.post<CreateClassApiResponse | ClassResponse>(
    '/classroom',
    payload
  )

  const data = response.data

  if (isClassResponse(data)) {
    return data
  }

  if (isCreateClassApiResponse(data)) {
    throwIfFailure(data)

    if (data.value) return data.value
    if (data.data) return data.data
  }

  throw new Error('Không nhận được dữ liệu lớp học sau khi tạo')
}

// Hàm gọi API lấy chi tiết 1 lớp học
export const getClassroomDetail = async (
  id: string
): Promise<ClassResponse> => {
  const response = await api.get<CreateClassApiResponse | ClassResponse>(
    `/classroom/${id}`
  )

  const data = response.data

  if (isClassResponse(data)) {
    return data
  }

  if (isCreateClassApiResponse(data)) {
    throwIfFailure(data)

    if (data.value) return data.value
    if (data.data) return data.data
  }

  throw new Error('Không thể lấy thông tin chi tiết lớp học')
}

export const getClasses = async (): Promise<ClassResponse[]> => {
  const response = await api.get<GetClassesApiResponse | ClassResponse[]>(
    '/classroom/my-classrooms'
  )

  const data = response.data

  if (Array.isArray(data)) {
    return data
  }

  if (isGetClassesApiResponse(data)) {
    throwIfFailure(data)

    if (Array.isArray(data.value)) return data.value
    if (Array.isArray(data.data)) return data.data
  }

  return []
}

export const getClassroomCode = async (
  classroomId: number | string
): Promise<string> => {
  const currentUser = getCurrentUserFromToken()
  const normalizedRole = (currentUser?.systemRole || '').toUpperCase()

  const isStudent = normalizedRole.includes('STUDENT')

  // student không được gọi API này
  if (isStudent) {
    return ''
  }

  const response = await api.get<
    GetClassroomCodeApiResponse | string | { classCode?: string }
  >(`/classroom/${classroomId}/code`)

  const data = response.data

  const directCode = extractClassCode(data)
  if (directCode) return directCode

  if (isGetClassroomCodeApiResponse(data)) {
    throwIfFailure(data)

    const valueCode = extractClassCode(data.value)
    if (valueCode) return valueCode

    const dataCode = extractClassCode(data.data)
    if (dataCode) return dataCode
  }

  return ''
}
