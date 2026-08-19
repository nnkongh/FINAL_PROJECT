import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { X, Loader2, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useJoinGroup } from '../hooks/useGroups'
import { joinGroupSchema, type JoinGroupFormData } from '../types/validation'

interface JoinGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function JoinGroupModal({
  isOpen,
  onClose,
  onSuccess
}: JoinGroupModalProps) {
  const { mutate: joinGroup, isPending } = useJoinGroup()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<JoinGroupFormData>({
    resolver: yupResolver(joinGroupSchema)
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = (data: JoinGroupFormData) => {
    joinGroup(
      {
        inviteCode: data.inviteCode.toUpperCase()
      },
      {
        onSuccess: group => {
          console.log('Joined group:', group)
          handleClose()
          onSuccess?.()
          // Show success message
          alert(`Bạn đã tham gia nhóm "${group.name}" thành công!`)
        },
        onError: error => {
          console.error('Join group error:', error)
          const message =
            error instanceof Error
              ? error.message
              : 'Có lỗi xảy ra khi tham gia nhóm'
          alert(message)
        }
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={handleClose}
      />

      {/* Modal */}
      <div className='relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl p-6 m-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Key className='h-5 w-5 text-blue-600' />
            </div>
            <h2 className='text-2xl font-bold text-slate-900'>Tham gia nhóm</h2>
          </div>
          <button
            onClick={handleClose}
            className='text-slate-400 hover:text-slate-600 transition-colors'
            disabled={isPending}
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Description */}
        <p className='text-sm text-slate-600 mb-6'>
          Nhập mã tham gia được chia sẻ bởi quản trị viên nhóm để tham gia vào
          nhóm làm việc.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Invite Code */}
          <div className='space-y-2'>
            <Label htmlFor='inviteCode'>
              Mã tham gia <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='inviteCode'
              placeholder='Ví dụ: MERN2024'
              {...register('inviteCode')}
              className={`uppercase ${errors.inviteCode ? 'border-red-500' : ''}`}
              disabled={isPending}
              autoComplete='off'
              maxLength={20}
            />
            {errors.inviteCode && (
              <p className='text-xs text-red-500'>
                {errors.inviteCode.message}
              </p>
            )}
            <p className='text-xs text-slate-500'>
              Mã tham gia thường gồm chữ cái in hoa và số (ví dụ: MERN2024)
            </p>
          </div>

          {/* Info Box */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h4 className='text-sm font-medium text-blue-900 mb-2'>💡 Lưu ý</h4>
            <ul className='text-xs text-blue-700 space-y-1'>
              <li>• Mã tham gia phân biệt chữ hoa/thường</li>
              <li>• Mỗi nhóm có giới hạn số thành viên</li>
              <li>• Liên hệ quản trị viên nếu mã không hợp lệ</li>
            </ul>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='flex-1'
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type='submit' className='flex-1' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang tham gia...
                </>
              ) : (
                'Tham gia'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
