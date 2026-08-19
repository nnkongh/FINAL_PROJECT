import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateClassroom } from '../hooks/useClassroomTeacherActions'
import type {
  EditClassroomFormErrors,
  EditClassroomFormState,
  EditClassroomModalProps
} from '../types/classroomTeacher'

const initialErrors: EditClassroomFormErrors = {
  className: '',
  subjectName: ''
}

export default function EditClassroomModal({
  classroomId,
  initialData,
  isOpen,
  onClose
}: EditClassroomModalProps) {
  const [form, setForm] = useState<EditClassroomFormState>({
    className: initialData.className || '',
    subjectName: initialData.subjectName || ''
  })
  const [errors, setErrors] = useState<EditClassroomFormErrors>(initialErrors)

  const updateClassroomMutation = useUpdateClassroom(classroomId)

  useEffect(() => {
    if (!isOpen) return

    setForm({
      className: initialData.className || '',
      subjectName: initialData.subjectName || ''
    })
    setErrors(initialErrors)
  }, [initialData.className, initialData.subjectName, isOpen])

  const validate = () => {
    const nextErrors: EditClassroomFormErrors = { ...initialErrors }

    if (!form.className.trim()) {
      nextErrors.className = 'Tên lớp học là bắt buộc'
    }

    if (!form.subjectName.trim()) {
      nextErrors.subjectName = 'Môn học là bắt buộc'
    }

    setErrors(nextErrors)
    return !nextErrors.className && !nextErrors.subjectName
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return

    await updateClassroomMutation.mutateAsync({
      className: form.className.trim(),
      subjectName: form.subjectName.trim()
    })

    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !updateClassroomMutation.isPending) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Sửa thông tin lớp học</DialogTitle>
        </DialogHeader>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <Label htmlFor='edit-class-name'>Tên lớp học</Label>
            <Input
              id='edit-class-name'
              value={form.className}
              onChange={event =>
                setForm(prev => ({ ...prev, className: event.target.value }))
              }
              disabled={updateClassroomMutation.isPending}
              className={errors.className ? 'border-red-500' : ''}
            />
            {errors.className && (
              <p className='text-xs text-red-500'>{errors.className}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-subject-name'>Môn học</Label>
            <Input
              id='edit-subject-name'
              value={form.subjectName}
              onChange={event =>
                setForm(prev => ({ ...prev, subjectName: event.target.value }))
              }
              disabled={updateClassroomMutation.isPending}
              className={errors.subjectName ? 'border-red-500' : ''}
            />
            {errors.subjectName && (
              <p className='text-xs text-red-500'>{errors.subjectName}</p>
            )}
          </div>

          <div className='flex items-center justify-end gap-3 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={updateClassroomMutation.isPending}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={updateClassroomMutation.isPending}>
              {updateClassroomMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
