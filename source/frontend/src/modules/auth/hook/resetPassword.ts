import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '../api/auth.api'

// TODO: Add validatePasswordResetToken to auth.api.ts when needed
export const useValidateToken = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      // Placeholder - implement when backend provides this endpoint
      return { success: true }
    }
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: any) => resetPassword(payload)
  })
}
