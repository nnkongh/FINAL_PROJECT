export interface TokenUserInfo {
  id?: number
  fullName?: string
  email?: string
  studentId?: string
  avatarUrl?: string
  systemRole?: string
}

const parseJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    )
    const json = atob(padded)

    return JSON.parse(json)
  } catch {
    return null
  }
}

const claim = (
  payload: Record<string, any>,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

const numericClaim = (
  payload: Record<string, any>,
  keys: string[]
): number | undefined => {
  for (const key of keys) {
    const value = payload[key]

    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value
    }

    if (typeof value === 'string') {
      const parsed = Number(value.trim())
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed
      }
    }
  }

  return undefined
}

export const getCurrentUserFromToken = (): TokenUserInfo => {
  const token = localStorage.getItem('accessToken')
  if (!token) return {}

  const payload = parseJwtPayload(token)
  if (!payload) return {}

  return {
    id: numericClaim(payload, [
      'id',
      'userId',
      'nameid',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'
    ]),
    fullName: claim(payload, [
      'fullName',
      'name',
      'unique_name',
      'given_name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
    ]),
    email: claim(payload, [
      'email',
      'upn',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    ]),
    studentId: claim(payload, ['studentId', 'mssv', 'student_code', 'sub']),
    avatarUrl: claim(payload, ['avatarUrl', 'avatar', 'picture']),
    systemRole: claim(payload, [
      'systemRole',
      'userRole',
      'role',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ])
  }
}
