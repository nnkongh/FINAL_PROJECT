import { useState } from 'react'
import { Loader2, PencilLine, Power, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { useNavigate } from 'react-router-dom'
import EditClassroomModal from './EditClassroomModal'
import {
  useActivateClassroom,
  useDeactivateClassroom
} from '../hooks/useClassroomTeacherActions'
import { useDeleteClassroom } from '../hooks/useClassroomGroups'
import type { ClassroomTeacherActionsProps } from '../types/classroomTeacher'
import ChangeInviteCodeButton from './ChangeInviteCodeButton'

export default function ClassroomTeacherActions({
  classroomId,
  isActive,
  initialData
}: ClassroomTeacherActionsProps) {
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const activateMutation = useActivateClassroom(classroomId)
  const deactivateMutation = useDeactivateClassroom(classroomId)
  const deleteMutation = useDeleteClassroom()

  const isMutating =
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    deleteMutation.isPending

  const handleActivate = async () => {
    await activateMutation.mutateAsync()
  }

  const handleDeactivate = async () => {
    await deactivateMutation.mutateAsync()
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(classroomId)
    navigate('/classes')
  }

  return (
    <>
      <div className='flex flex-wrap items-center gap-2'>
        <Button variant='outline' onClick={() => setIsEditModalOpen(true)}>
          <PencilLine className='mr-2 h-4 w-4' />
          Sửa thông tin
        </Button>

        <ChangeInviteCodeButton classroomId={classroomId} />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' disabled={isMutating}>
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Xóa lớp
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa lớp học</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa lớp học này?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-red-600 hover:bg-red-700'
              >
                Xóa lớp
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isActive ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' disabled={isMutating}>
                {deactivateMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Power className='mr-2 h-4 w-4' />
                    Vô hiệu hóa
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Xác nhận vô hiệu hóa lớp học
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn vô hiệu hóa không? Tác vụ này sẽ ảnh
                  hưởng đến sinh viên.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeactivate}
                  className='bg-red-600 hover:bg-red-700'
                >
                  Xác nhận vô hiệu hóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button onClick={handleActivate} disabled={isMutating}>
            {activateMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              <>
                <ShieldCheck className='mr-2 h-4 w-4' />
                Kích hoạt lại
              </>
            )}
          </Button>
        )}
      </div>

      <EditClassroomModal
        classroomId={classroomId}
        initialData={initialData}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  )
}
