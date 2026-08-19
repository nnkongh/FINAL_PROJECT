import { Loader2, RefreshCw } from 'lucide-react'
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
import { useChangeInviteCode } from '../hooks/useClassroomActions'

interface ChangeInviteCodeButtonProps {
  classroomId: number | string
}

export default function ChangeInviteCodeButton({
  classroomId
}: ChangeInviteCodeButtonProps) {
  const changeInviteCodeMutation = useChangeInviteCode(classroomId)

  const handleConfirm = async () => {
    await changeInviteCodeMutation.mutateAsync()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='secondary'
          disabled={changeInviteCodeMutation.isPending}
        >
          {changeInviteCodeMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Đang tạo mã mới...
            </>
          ) : (
            <>
              <RefreshCw className='mr-2 h-4 w-4' />
              Tạo mã mời mới
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận tạo mã mời mới</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn tạo mã mời mới không? Mã cũ sẽ bị vô hiệu hóa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Tạo mã mới
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
