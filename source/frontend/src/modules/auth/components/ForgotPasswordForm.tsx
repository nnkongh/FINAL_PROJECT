import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import type { ForgotPasswordType } from '../types/forgotPassword'
import LogoImage from '@/assets/logo-DHNT-300x300.png'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormClearErrors
} from 'react-hook-form'

interface ForgotPasswordFormProps {
  register: UseFormRegister<ForgotPasswordType>
  handleSubmit: UseFormHandleSubmit<ForgotPasswordType>
  errors: FieldErrors<ForgotPasswordType>
  clearErrors: UseFormClearErrors<ForgotPasswordType>
  loading: boolean
  canSubmit: boolean
  serverError: string | null
  isSuccess: boolean
  onSubmit: (data: ForgotPasswordType) => void
  onClearStatus: () => void
}

export const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
  const {
    register,
    handleSubmit,
    errors,
    clearErrors,
    loading,
    canSubmit,
    serverError,
    isSuccess,
    onSubmit,
    onClearStatus
  } = props

  const renderAlert = () => {
    if (!serverError && !isSuccess) return null

    const message =
      serverError ||
      'Password reset link sent successfully. Please check your mailbox.'
    const isError = !isSuccess && !!serverError
    const classes = isError
      ? 'bg-red-50 border-red-200'
      : 'bg-green-50 border-green-200'
    const IconComponent = isError ? CloseIcon : CheckCircleOutlineIcon
    const iconColor = isError ? 'text-red-500' : 'text-green-500'
    const messageColor = isError ? 'text-red-800' : 'text-green-800'
    const buttonColor = isError
      ? 'text-red-500 hover:text-red-700'
      : 'text-green-500 hover:text-green-700'

    return (
      <div
        className={`mb-6 rounded-xl p-4 flex items-start gap-3 border ${classes} shadow-sm transition-all`}
      >
        <IconComponent className={`w-5 h-5 ${iconColor} mt-0.5`} />
        <div className='flex-1'>
          <p className={`text-sm font-medium ${messageColor}`}>{message}</p>
        </div>
        <button
          type='button'
          onClick={onClearStatus}
          className={`${buttonColor} transition-colors`}
        >
          <CloseIcon style={{ fontSize: '1.25rem' }} />
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center items-center w-full shrink-0 lg:w-2/5 p-4 sm:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-blue-50/30 min-h-screen'>
      <div className='w-full max-w-sm sm:max-w-md'>
        <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl'>
          {/* Logo & Header */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-30 h-30 bg-blue-100 rounded-2xl mb-4 shadow-lg'>
              <img src={LogoImage} alt='Logo' className='w-30 h-30' />
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-2 tracking-tight'>
              Khôi phục mật khẩu
            </h1>
            <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>
              Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          {/* Alert Message */}
          {renderAlert()}

          {/* Form */}
          <form className='space-y-1' onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-gray-700'>
                Email
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='email'
                  type='email'
                  placeholder='Nhập địa chỉ email của bạn'
                  className={`pl-10 h-11 ${
                    errors.email
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  disabled={loading || isSuccess}
                  {...register('email', {
                    onChange: () => {
                      clearErrors('email')
                      onClearStatus()
                    }
                  })}
                />
              </div>

              {/* Error Message Space (min-h-5 để không giật layout) */}
              <div className='min-h-5'>
                {errors.email && (
                  <p className='text-sm text-red-600'>{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button (thêm mt-2 để bù khoảng cách với form báo lỗi) */}
            <div className='pt-2'>
              <Button
                type='submit'
                disabled={!canSubmit || isSuccess}
                className='w-full h-12 text-base font-semibold'
                size='lg'
              >
                {loading ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  'Gửi yêu cầu'
                )}
              </Button>
            </div>
          </form>

          {/* Back to Login */}
          <div className='text-center mt-8 pt-6 border-t border-gray-100'>
            <Link
              to='/login'
              className='text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors'
            >
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
