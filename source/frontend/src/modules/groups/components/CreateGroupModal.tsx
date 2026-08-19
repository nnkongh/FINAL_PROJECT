import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateGroupRequest } from '../types/group.request'
import { useCreateGroupForm } from '../hooks/useCreateGroupForm'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  maxMembersPerGroup: number
  onSuccess?: () => void
  onCreateGroup?: (payload: CreateGroupRequest) => Promise<unknown> | unknown
  isSubmitting?: boolean
  fixedSubjectName?: string
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  maxMembersPerGroup,
  onSuccess,
  onCreateGroup,
  isSubmitting,
  fixedSubjectName
}: CreateGroupModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    isSubmitting: formSubmitting
  } = useCreateGroupForm({
    fixedSubjectName,
    maxMembersPerGroup,
    onCreateGroup,
    onSuccess,
    onClose
  })

  const submitting = isSubmitting ?? formSubmitting

  const {
    register,
    formState: { errors }
  } = form

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
          <h2 className='text-2xl font-bold text-slate-900'>Tạo nhóm mới</h2>
          <button
            type='button'
            onClick={handleClose}
            className='text-slate-400 hover:text-slate-600 transition-colors'
            disabled={submitting}
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className='space-y-4'>
          {/* Tên nhóm */}
          <div className='space-y-2'>
            <Label htmlFor='name'>
              Tên nhóm <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='Ví dụ: Nhóm 1'
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              disabled={submitting}
            />
            {errors.name && (
              <p className='text-xs text-red-500'>{errors.name.message}</p>
            )}
          </div>

          {fixedSubjectName && (
            <div className='space-y-2'>
              <Label htmlFor='category'>Môn học</Label>
              <Input
                id='category'
                value={fixedSubjectName}
                readOnly
                disabled={submitting}
                className='bg-slate-50 text-slate-600 cursor-not-allowed'
              />
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='flex-1'
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type='submit' className='flex-1' disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang tạo...
                </>
              ) : (
                'Tạo nhóm'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
