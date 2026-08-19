import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { SUBJECTS } from '../types/class'
import { useCreateClassForm } from '../hooks/useCreateClassForm'
import {
  MAJOR_TYPE_OPTIONS,
  type CreateClassFormData,
  type CreateClassModalProps
} from '../types/createClassForm'

export default function CreateClassModal({
  isOpen,
  onClose,
  onSuccess
}: CreateClassModalProps) {
  const { formData, setFormData, errors, isSubmitting, resetForm, submitForm } =
    useCreateClassForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isSuccess = await submitForm()
    if (!isSuccess) return

    handleClose()
    onSuccess?.()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-125'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Tạo lớp học mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5 mt-4'>
          {/* Class Name */}
          <div className='space-y-2'>
            <Label htmlFor='name'>
              Tên lớp học <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='Ví dụ: Thực hành Web - Ca 1'
              value={formData.className}
              onChange={e =>
                setFormData({ ...formData, className: e.target.value })
              }
              className={errors.className ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.className && (
              <p className='text-xs text-red-500'>{errors.className}</p>
            )}
          </div>

          {/* Subject */}
          {/* <div className='space-y-2'>
            <Label htmlFor='subject'>
              Môn học <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.subjectName}
              onValueChange={value =>
                setFormData({ ...formData, subjectName: value })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={errors.subjectName ? 'border-red-500' : ''}
              >
                <SelectValue placeholder='Chọn môn học' />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subjectName && (
              <p className='text-xs text-red-500'>{errors.subjectName}</p>
            )}
          </div> */}
          <div className='space-y-2'>
            <Label htmlFor='subjectName'>
              Môn học <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='subjectName'
              placeholder='Ví dụ: Lập trình Web, Kế toán tài chính...'
              value={formData.subjectName}
              onChange={e =>
                setFormData({ ...formData, subjectName: e.target.value })
              }
              className={errors.subjectName ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.subjectName && (
              <p className='text-xs text-red-500'>{errors.subjectName}</p>
            )}
          </div>

          {/* Major Type */}
          <div className='space-y-2'>
            <Label htmlFor='majorType'>
              Phân loại chuyên ngành <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.majorType}
              onValueChange={value =>
                setFormData({
                  ...formData,
                  majorType: value as CreateClassFormData['majorType']
                })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                id='majorType'
                className={errors.majorType ? 'border-red-500' : ''}
              >
                <SelectValue placeholder='Chọn phân loại chuyên ngành' />
              </SelectTrigger>
              <SelectContent>
                {MAJOR_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.majorType && (
              <p className='text-xs text-red-500'>{errors.majorType}</p>
            )}
            <p className='text-xs text-slate-500'>
              Lớp IT sẽ yêu cầu sinh viên liên kết GitHub trong các bước sau.
            </p>
          </div>

          {/* Max Members Per Group */}
          <div className='space-y-2'>
            <Label htmlFor='maxMembersPerGroup'>
              Số lượng sinh viên tối đa mỗi nhóm{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='maxMembersPerGroup'
              type='number'
              min={2}
              max={10}
              value={formData.maxMembersPerGroup}
              onChange={e =>
                setFormData({
                  ...formData,
                  maxMembersPerGroup: parseInt(e.target.value, 10) || 2
                })
              }
              className={errors.maxMembersPerGroup ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.maxMembersPerGroup && (
              <p className='text-xs text-red-500'>
                {errors.maxMembersPerGroup}
              </p>
            )}
            <p className='text-xs text-slate-500'>
              Giá trị hợp lệ từ 2 đến 10 sinh viên/nhóm.
            </p>
          </div>

          {/* Info Box */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h4 className='text-sm font-medium text-blue-900 mb-2'>💡 Lưu ý</h4>
            <ul className='text-xs text-blue-700 space-y-1'>
              <li>• Mã tham gia sẽ được tự động tạo sau khi tạo lớp</li>
              <li>• Sinh viên dùng mã này để tham gia lớp học</li>
              <li>• Bạn có thể chia sẻ mã cho sinh viên qua email hoặc LMS</li>
            </ul>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='flex-1'
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type='submit' className='flex-1' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang tạo...
                </>
              ) : (
                'Tạo lớp học'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
