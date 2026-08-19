import type { UserRole } from './auth.enum'

export interface RegisterRequest {
  userName: string
  email: string
  password: string
  userCode?: string
  userRole?: UserRole
}

export interface LoginRequest {
  mssv: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  userName?: string
  avatarUrl?: string
}
