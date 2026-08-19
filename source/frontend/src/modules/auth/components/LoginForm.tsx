import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormClearErrors
} from 'react-hook-form'
import type { LoginFormType } from '../types/login'
import LogoImage from '@/assets/logo-DHNT-300x300.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  register: UseFormRegister<LoginFormType>
  handleSubmit: UseFormHandleSubmit<LoginFormType>
  errors: FieldErrors<LoginFormType>
  clearErrors: UseFormClearErrors<LoginFormType>
  loading: boolean
  canSubmit: boolean
  onSubmit: (data: LoginFormType) => void
  handleMssvKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handlePasswordKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const LoginForm = ({
  register,
  handleSubmit,
  errors,
  clearErrors,
  loading,
  canSubmit,
  onSubmit,
  handleMssvKeyDown,
  handlePasswordKeyDown
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)

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
              Chào mừng trở lại
            </h1>
            <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>
              Đăng nhập để tiếp tục
            </p>
          </div>

          {/* Form */}
          <form className='space-y-1' onSubmit={handleSubmit(onSubmit)}>
            {/* MSSV Field  */}
            <div className='space-y-2'>
              <Label htmlFor='mssv' className='text-gray-700'>
                Mã số
              </Label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='mssv'
                  type='text'
                  placeholder='Nhập mã số của bạn'
                  className={`pl-10 h-11 ${
                    errors.mssv
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  {...register('mssv', {
                    onChange: () => clearErrors('mssv')
                  })}
                  onKeyDown={handleMssvKeyDown}
                />
              </div>
              <div className='min-h-5'>
                {errors.mssv && (
                  <p className='text-sm text-red-600'>{errors.mssv.message}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <Label htmlFor='password' className='text-gray-700'>
                Mật khẩu
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu của bạn'
                  className={`pl-10 pr-10 h-11 ${
                    errors.password
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  {...register('password', {
                    onChange: () => clearErrors('password')
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
                {errors.password && (
                  <p className='text-sm text-red-600'>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/*Quên mật khẩu?*/}
            <div className='flex justify-end'>
              <Link
                to='/forgot-password'
                className='text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors'
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type='submit'
              disabled={!canSubmit}
              className='w-full h-12 text-base font-semibold'
              size='lg'
            >
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
