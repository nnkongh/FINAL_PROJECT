import api from '@/lib/axios'
import type { ApiResponse } from '@/lib/axios'
import type { LoginFormType } from '../types/login'

/**
 * Login Response from Backend
 * According to Swagger: POST /api/Auth/login
 */
export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user?: {
    id: string
    mssv: string
    name?: string
    email?: string
  }
}

/**
 * Login API
 * Endpoint: POST /api/Auth/login
 * Request Body: { mssv: string, password: string }
 */
export const login = async (
  payload: LoginFormType
): Promise<ApiResponse<LoginResponse>> => {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    '/Auth/login',
    payload
  )
  return data
}

/**
 * Forgot Password Payload
 */
export interface ForgotPasswordPayload {
  email: string
  clientUri: string
}

/**
 * Reset Password Payload
 */
export interface ResetPasswordPayload {
  email: string
  token: string
  newPassword: string
  passwordConfirm: string
}

/**
 * Forgot Password API
 * Endpoint: POST /api/Auth/forgot-password
 * Sends reset password link to email
 */
export const forgotPasswordAPI = async (
  payload: ForgotPasswordPayload
): Promise<ApiResponse<any>> => {
  const { data } = await api.post<ApiResponse<any>>(
    '/Auth/forgot-password',
    payload
  )
  return data
}

/**
 * Reset Password API
 * Endpoint: POST /api/Auth/reset-password
 * Resets password using token from email
 */
export const resetPasswordAPI = async (
  payload: ResetPasswordPayload
): Promise<ApiResponse<any>> => {
  const { data } = await api.post<ApiResponse<any>>(
    '/Auth/reset-password',
    payload
  )
  return data
}

/**
 * @deprecated Use forgotPasswordAPI instead
 */
export const forgotPassword = async (payload: {
  email: string
}): Promise<ApiResponse<any>> => {
  const { data } = await api.post<ApiResponse<any>>('/Auth/forgot-password', {
    email: payload.email,
    clientUri: 'http://localhost:5173/reset-password'
  })
  return data
}

/**
 * @deprecated Use resetPasswordAPI instead
 */
export const resetPassword = async (
  payload: any
): Promise<ApiResponse<any>> => {
  const { data } = await api.post<ApiResponse<any>>(
    '/api/Auth/reset-password',
    payload
  )
  return data
}
