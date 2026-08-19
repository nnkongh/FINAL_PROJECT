import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  ResetPasswordSchema,
  type ResetPasswordFormType
} from '../types/reset-password'
import { useState } from 'react'

interface UseResetPasswordFormProps {
  email: string
  onSubmit: (data: ResetPasswordFormType) => Promise<void>
}

export const useResetPasswordForm = ({
  email,
  onSubmit
}: UseResetPasswordFormProps) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    setError
  } = useForm<ResetPasswordFormType>({
    resolver: yupResolver(ResetPasswordSchema),
    mode: 'onChange'
  })

  const newPassword = watch('newPassword')
  const passwordConfirm = watch('passwordConfirm')
  const canSubmit = !!newPassword && !!passwordConfirm && !loading

  const handleFormSubmit = async (data: ResetPasswordFormType) => {
    try {
      setLoading(true)
      await onSubmit(data)
    } catch (error) {
      const err = error as any
      console.error('Reset password error:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.getElementById('passwordConfirm')?.focus()
    }
  }

  const handleConfirmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(handleFormSubmit)()
    }
  }

  return {
    register,
    onSubmit: handleSubmit(handleFormSubmit),
    errors,
    clearErrors,
    loading,
    canSubmit,
    handlePasswordKeyDown,
    handleConfirmKeyDown,
    email,
    setError
  }
}
