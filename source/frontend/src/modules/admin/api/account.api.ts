import api from '@/lib/axios'
import type { Account } from '../types/account'

interface UserAccountDto {
  id: number
  userName?: string
  email?: string
  avatarUrl?: string
  userCode?: string
  userRole?: string
  isActive?: boolean
}

interface UserListResponse {
  value?: UserAccountDto[]
  data?: UserAccountDto[]
  isSuccess?: boolean
  isFailure?: boolean
  error?: {
    code?: string
    message?: string
  }
}

const mapRole = (role?: string): Account['role'] => {
  const normalized = String(role || '')
    .trim()
    .toLowerCase()

  if (normalized === 'admin') return 'Admin'
  if (normalized === 'teacher') return 'Teacher'
  return 'Student'
}

const mapToAccount = (item: UserAccountDto): Account => ({
  id: String(item.id),
  email: item.email || '',
  fullName: item.userName || '',
  mssv: item.userCode || '',
  role: mapRole(item.userRole),
  status: item.isActive === false ? 'Inactive' : 'Active'
})

export const getAccountsAPI = async (role?: string): Promise<Account[]> => {
  const response = await api.get<UserListResponse | UserAccountDto[]>('/user', {
    params: role ? { role } : undefined
  })

  const payload = response.data

  if (Array.isArray(payload)) {
    return payload.map(mapToAccount)
  }

  if (payload?.isFailure) {
    throw new Error(payload?.error?.message || 'Không thể tải danh sách user')
  }

  const rawList = Array.isArray(payload?.value)
    ? payload.value
    : Array.isArray(payload?.data)
      ? payload.data
      : []

  return rawList.map(mapToAccount)
}
