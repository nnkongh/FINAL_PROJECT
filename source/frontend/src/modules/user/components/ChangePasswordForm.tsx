import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useChangePassword } from '../hook/user.hook'
import type { ChangePasswordPayload } from '../api/user.api'

const changePasswordSchema: yup.ObjectSchema<ChangePasswordPayload> =
  yup.object({
    oldPassword: yup
      .string()
      .required('Mật khẩu hiện tại là bắt buộc')
      .min(6, 'Mật khẩu hiện tại phải có ít nhất 6 ký tự'),
    newPassword: yup
      .string()
      .required('Mật khẩu mới là bắt buộc')
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    passwordConfirm: yup
      .string()
      .required('Xác nhận mật khẩu là bắt buộc')
      .oneOf([yup.ref('newPassword')], 'Xác nhận mật khẩu không khớp')
  })

export default function ChangePasswordForm() {
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const changePasswordMutation = useChangePassword()

  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors, isValid }
  } = useForm<ChangePasswordPayload>({
    resolver: yupResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      passwordConfirm: ''
    }
  })

  const onSubmit = async (values: ChangePasswordPayload) => {
    await changePasswordMutation.mutateAsync(values)
    reset()
  }

  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
      </CardHeader>

      <CardContent>
        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-2'>
            <Label htmlFor='oldPassword'>Mật khẩu hiện tại</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
              <Input
                id='oldPassword'
                type={showOldPassword ? 'text' : 'password'}
                placeholder='Nhập mật khẩu hiện tại'
                className={`pl-10 pr-10 h-11 ${
                  errors.oldPassword
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                {...register('oldPassword', {
                  onChange: () => clearErrors('oldPassword')
                })}
              />
              <button
                type='button'
                onClick={() => setShowOldPassword(!showOldPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
              >
                {showOldPassword ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>
            <div className='min-h-5'>
              {errors.oldPassword && (
                <p className='text-sm text-red-600'>
                  {errors.oldPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='newPassword'>Mật khẩu mới</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
              <Input
                id='newPassword'
                type={showNewPassword ? 'text' : 'password'}
                placeholder='Nhập mật khẩu mới'
                className={`pl-10 pr-10 h-11 ${
                  errors.newPassword
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                {...register('newPassword', {
                  onChange: () => clearErrors('newPassword')
                })}
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
              >
                {showNewPassword ? (
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

          <div className='space-y-2'>
            <Label htmlFor='passwordConfirm'>Xác nhận mật khẩu mới</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
              <Input
                id='passwordConfirm'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Nhập lại mật khẩu mới'
                className={`pl-10 pr-10 h-11 ${
                  errors.passwordConfirm
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
                {...register('passwordConfirm', {
                  onChange: () => clearErrors('passwordConfirm')
                })}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
              >
                {showConfirmPassword ? (
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

          <Button
            type='submit'
            disabled={!isValid || changePasswordMutation.isPending}
            className='w-full h-12 text-base font-semibold'
            size='lg'
          >
            {changePasswordMutation.isPending ? (
              <div className='flex items-center justify-center gap-2'>
                <div className='w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                <span>Đang cập nhật...</span>
              </div>
            ) : (
              'Đổi mật khẩu'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
