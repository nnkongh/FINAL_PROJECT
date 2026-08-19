import { useMemo } from 'react'
import { getCurrentUserFromToken } from '@/lib/token'

export type UserRole = 'Student' | 'Teacher' | 'Admin' | ''

const normalizeRole = (rawRole?: string): UserRole => {
  const normalized = (rawRole || '').toUpperCase()

  if (normalized.includes('ADMIN')) return 'Admin'
  if (normalized.includes('TEACHER') || normalized.includes('GIANGVIEN')) {
    return 'Teacher'
  }
  if (normalized.includes('STUDENT')) return 'Student'

  return ''
}

export const useGetMe = () => {
  const tokenUser = useMemo(() => getCurrentUserFromToken(), [])
  const role = normalizeRole(tokenUser.systemRole)

  return {
    data: {
      data: {
        role
      }
    },
    isLoading: false,
    isError: false
  }
}
