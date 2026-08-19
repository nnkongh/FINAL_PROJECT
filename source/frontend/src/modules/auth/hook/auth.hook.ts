import { useMutation } from '@tanstack/react-query'
import type { LoginFormType } from '../types/login'
import {
  login,
  type LoginResponse,
  forgotPasswordAPI,
  resetPasswordAPI,
  type ForgotPasswordPayload,
  type ResetPasswordPayload
} from '../api/auth.api'

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginFormType) => login(payload),
    // Dùng 'any' để TypeScript thôi không càm ràm sai kiểu dữ liệu nữa
    onSuccess: (response: any) => {
      console.log('Login successful!', response)

      // LẤY TRỰC TIẾP TỪ RESPONSE, KHÔNG CÓ .DATA
      const token = response.accessToken
      const refreshToken = response.refreshToken

      if (token) {
        // Cất vào ví (Local Storage)
        localStorage.setItem('accessToken', token)

        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        console.log('🎉 LƯU TOKEN THÀNH CÔNG RỒI NHÉ!')

        // F5 tự động chuyển về trang chủ để Header cập nhật tên luôn
        window.location.href = '/'
      }
    },
    onError: error => {
      console.error('Login failed:', error)
    }
  })
}

/**
 * Hook for Forgot Password
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordAPI(payload),
    onSuccess: data => {
      console.log('Forgot password email sent!', data)
    },
    onError: error => {
      console.error('Forgot password failed:', error)
    }
  })
}

/**
 * Hook for Reset Password
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPasswordAPI(payload),
    onSuccess: data => {
      console.log('Password reset successful!', data)
    },
    onError: error => {
      console.error('Reset password failed:', error)
    }
  })
}

// TODO: Implement change password when backend provides endpoint
// export const useChangePassword = () => {
//   return useMutation({
//     mutationFn: (payload: ChangePasswordFormType) => changePassword(payload),
//   });
// };
