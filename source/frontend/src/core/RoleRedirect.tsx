import { Navigate } from 'react-router-dom'
import { useGetMe, type UserRole } from '@/hooks/useGetMe'

const normalizeRole = (role?: string): UserRole => {
  const normalized = (role || '').toUpperCase()

  if (normalized.includes('ADMIN')) return 'Admin'
  if (normalized.includes('TEACHER') || normalized.includes('GIANGVIEN')) {
    return 'Teacher'
  }
  if (normalized.includes('STUDENT')) return 'Student'

  return ''
}

const getDefaultPath = (role: UserRole): string => {
  if (role === 'Admin') return '/account-management'
  if (role === 'Teacher') return '/classes'
  if (role === 'Student') return '/groups'
  return '/login'
}

export default function RoleRedirect() {
  const { data } = useGetMe()
  const role = normalizeRole(data?.data?.role)

  return <Navigate to={getDefaultPath(role)} replace />
}
