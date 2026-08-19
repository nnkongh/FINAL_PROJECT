import api from '@/lib/axios'
import type { ApiResponse } from '@/lib/axios'

export interface UserProfileResponse {
  id?: string
  fullName?: string
  name?: string
  userName?: string
  userRole?: string
  role?: string
  phoneNumber?: string
  phone?: string
  email?: string
  major?: string
  specialization?: string
  studentId?: string
  mssv?: string
  userCode?: string
  avatarUrl?: string
  avatar?: string
  githubUsername?: string
  githubUserName?: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  passwordConfirm: string
}

export interface ChangeAvatarPayload {
  file: File
}

export interface SearchUserResponse {
  id: number
  fullName: string
  email: string
  avatarUrl?: string
  userCode?: string
  isActive?: boolean
  userRole?: string
  userName?: string
}

export interface LinkGithubPayload {
  email: string
}

export interface LinkGithubResponse {
  redirectUrl: string
}

const normalizeApiResponse = <T>(raw: any): ApiResponse<T> => {
  const isWrapped =
    raw &&
    typeof raw === 'object' &&
    'data' in raw &&
    ('success' in raw || 'statusCode' in raw || 'message' in raw)

  if (isWrapped) {
    return raw as ApiResponse<T>
  }

  return {
    success: true,
    statusCode: 200,
    message: '',
    data: raw as T
  }
}

export const getUserProfileAPI = async (): Promise<
  ApiResponse<UserProfileResponse>
> => {
  const { data } = await api.get('/user/profile')
  return normalizeApiResponse<UserProfileResponse>(data)
}

export const changePasswordAPI = async (
  payload: ChangePasswordPayload
): Promise<ApiResponse<null>> => {
  const { data } = await api.put<ApiResponse<null>>(
    '/user/change-password',
    payload
  )
  return data
}

export const changeAvatarAPI = async (
  payload: ChangeAvatarPayload
): Promise<ApiResponse<UserProfileResponse>> => {
  const formData = new FormData()
  formData.append('file', payload.file)

  const { data } = await api.put('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return normalizeApiResponse<UserProfileResponse>(data)
}

export const searchUsersAPI = async (
  keyword: string
): Promise<SearchUserResponse[]> => {
  const { data } = await api.get('/user/search', {
    params: {
      keyword
    }
  })

  const payload = normalizeApiResponse<any>(data)

  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(data?.value)
        ? data.value
        : []

  return rawList
    .map(
      (item: any): SearchUserResponse => ({
        id: Number(item?.id ?? 0),
        fullName: item?.fullName || item?.name || item?.userName || '',
        email: item?.email || '',
        avatarUrl: item?.avatarUrl || item?.avatar || '',
        userCode: item?.userCode || item?.studentId || item?.mssv || '',
        isActive: item?.isActive ?? true,
        userRole: item?.userRole || item?.role || 'Student',
        userName: item?.userName || item?.name || item?.fullName || ''
      })
    )
    .filter((user: SearchUserResponse) => user.id > 0 && !!user.email)
}

export const linkGithubAccountAPI = async (
  payload: LinkGithubPayload
): Promise<LinkGithubResponse> => {
  const { data } = await api.post('/auth/github/link', payload)

  const redirectUrl =
    data?.redirectUrl || data?.data?.redirectUrl || data?.value?.redirectUrl

  if (!redirectUrl) {
    throw new Error('Không nhận được đường dẫn chuyển hướng GitHub')
  }

  return {
    redirectUrl
  }
}
