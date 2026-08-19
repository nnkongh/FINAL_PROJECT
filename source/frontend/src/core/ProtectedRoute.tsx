import { Navigate, Outlet } from 'react-router-dom'
import { useGetMe, type UserRole } from '@/hooks/useGetMe'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  redirectTo?: string
  children?: React.ReactNode
}

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

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/',
  children
}: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken')
  const { data } = useGetMe()

  if (!token) {
    return <Navigate to='/login' replace />
  }

  const role = normalizeRole(data?.data?.role)
  const isAllowed = allowedRoles.includes(role)

  if (!isAllowed) {
    const fallbackPath = redirectTo || getDefaultPath(role)
    return <Navigate to={fallbackPath} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
