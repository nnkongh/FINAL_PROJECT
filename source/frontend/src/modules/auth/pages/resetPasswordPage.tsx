import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useResetPasswordForm } from '../hook/useResetPasswordForm.hook'
import { useResetPassword } from '../hook/auth.hook'
import { LoginBranding } from '../components/LoginBranding'
import ResetPasswordForm from '../components/ResetPasswordForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { ResetPasswordFormType } from '../types/reset-password'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [serverError, setServerError] = useState<string | null>(null)

  const resetPasswordMutation = useResetPassword()

  // Validate URL parameters
  if (!email || !token) {
    return (
      <div className='min-h-screen w-full flex font-inter'>
        <LoginBranding />
        <div className='flex-1 flex items-center justify-center bg-white p-8'>
          <div className='w-full max-w-md'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Link không hợp lệ. Vui lòng kiểm tra lại email của bạn hoặc yêu
                cầu gửi lại link đặt lại mật khẩu.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  const handleResetPassword = async (data: ResetPasswordFormType) => {
    try {
      setServerError(null)
      await resetPasswordMutation.mutateAsync({
        email,
        token,
        newPassword: data.newPassword,
        passwordConfirm: data.passwordConfirm
      })

      // Navigate to login on success
      alert('Đặt lại mật khẩu thành công!')
      navigate('/login')
    } catch (error: any) {
      // Lấy message từ response BE
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'

      console.log('Reset password error:', error?.response?.data)

      // Chỉ hiển thị ở serverError alert (bỏ setError cho field)
      setServerError(errorMessage)
    }
  }

  const formProps = useResetPasswordForm({
    email,
    onSubmit: handleResetPassword
  })

  return (
    <div className='min-h-screen w-full flex font-inter'>
      <LoginBranding />
      <ResetPasswordForm
        {...formProps}
        serverError={serverError}
        onClearError={() => setServerError(null)}
      />
    </div>
  )
}
