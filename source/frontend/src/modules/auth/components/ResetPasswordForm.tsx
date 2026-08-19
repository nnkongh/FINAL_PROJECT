import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Eye, EyeOff, Lock, X } from 'lucide-react'
import { useState } from 'react'
import type {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit
} from 'react-hook-form'
import type { ResetPasswordFormType } from '../types/reset-password'
import LogoImage from '@/assets/logo-DHNT-300x300.png'

interface ResetPasswordFormProps {
  email: string
  register: UseFormRegister<ResetPasswordFormType>
  errors: FieldErrors<ResetPasswordFormType>
  loading: boolean
  canSubmit: boolean
  onSubmit: (e: React.FormEvent) => void
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleConfirmKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  serverError?: string | null
  onClearError?: () => void
  clearErrors: any
}

export default function ResetPasswordForm({
  email,
  register,
  errors,
  loading,
  canSubmit,
  onSubmit,
  handlePasswordKeyDown,
  handleConfirmKeyDown,
  serverError,
  onClearError,
  clearErrors
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className='flex flex-col justify-center items-center w-full shrink-0 lg:w-2/5 p-4 sm:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-blue-50/30 min-h-screen'>
      <div className='w-full max-w-sm sm:max-w-md'>
        <div className='bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl'>
          {/* Logo */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-30 h-30 bg-blue-100 rounded-2xl mb-4 shadow-lg'>
              <img src={LogoImage} alt='Logo' className='w-30 h-30' />
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-2 tracking-tight'>
              Reset Password
            </h1>
            <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>
              Set new password for:{' '}
              <span className='font-semibold text-blue-600'>{email}</span>
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <Alert
              variant='destructive'
              // 1. Thêm gap-3 để tách icon và text, py-3 để ép padding trên dưới cho cân
              className='relative mb-6 flex items-center gap-3 py-3'
            >
              {/* 2. Ép icon về dạng static (loại bỏ absolute mặc định của shadcn) */}
              <AlertCircle className='h-5 w-5 static! shrink-0' />

              {/* 3. Bỏ padding trái mặc định (nếu có) và không cho chữ bị đẩy */}
              <AlertDescription className='flex-1 pr-8 translate-y-0! text-sm leading-tight'>
                {serverError}
              </AlertDescription>

              {onClearError && (
                <button
                  onClick={onClearError}
                  // Nút X này bạn làm chuẩn rồi, giữ nguyên
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-800'
                  type='button'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </Alert>
          )}

          {/* Form */}
          <form className='space-y-1' onSubmit={onSubmit}>
            {/* New Password */}
            <div className='space-y-2'>
              <Label htmlFor='newPassword' className='text-gray-700'>
                New Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter new password (min 6 characters)'
                  className={`pl-10 pr-10 h-11 ${
                    errors.newPassword
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  {...register('newPassword', {
                    onChange: () => clearErrors('newPassword')
                  })}
                  onKeyDown={handlePasswordKeyDown}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              <div className='min-h-5'>
                {errors.newPassword && (
                  <p className='text-sm text-red-600'>
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className='space-y-2'>
              <Label htmlFor='passwordConfirm' className='text-gray-700'>
                Confirm Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='passwordConfirm'
                  type={showConfirm ? 'text' : 'password'}
                  placeholder='Re-enter new password'
                  className={`pl-10 pr-10 h-11 ${
                    errors.passwordConfirm
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  {...register('passwordConfirm', {
                    onChange: () => clearErrors('passwordConfirm')
                  })}
                  onKeyDown={handleConfirmKeyDown}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirm(!showConfirm)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  {showConfirm ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              <div className='min-h-5'>
                {errors.passwordConfirm && (
                  <p className='text-sm text-red-600'>
                    {errors.passwordConfirm.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={!canSubmit}
              className='w-full h-12 text-base font-semibold'
              size='lg'
            >
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
