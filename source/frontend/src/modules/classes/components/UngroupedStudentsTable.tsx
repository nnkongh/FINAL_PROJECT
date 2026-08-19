import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
import { Button } from '@/components/ui/button'
import { useRemoveStudentFromClassroom } from '@/modules/classes/hooks/useClassroomGroups'
import type { Student } from '../types/class'

interface UngroupedStudentsTableProps {
  students: Student[]
  classroomId: number | string
}

export default function UngroupedStudentsTable({
  students,
  classroomId
}: UngroupedStudentsTableProps) {
  const removeStudentMutation = useRemoveStudentFromClassroom()

  const resolveStudentId = (student: Student): number | null => {
    const rawId = student.id || student.mssv
    const parsed = Number(String(rawId).replace(/\D/g, ''))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }

  if (students.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <h3 className='text-lg font-semibold text-slate-900 mb-2'>
          Chưa có sinh viên nào
        </h3>
        <p className='text-slate-600 text-sm max-w-md'>
          Chưa có sinh viên nào trong lớp học này.
        </p>
      </div>
    )
  }

  return (
    <div className='rounded-md border border-slate-200 bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MSSV</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className='text-right'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map(student => (
            <TableRow key={student.id}>
              <TableCell className='font-mono text-sm font-medium'>
                {student.mssv}
              </TableCell>
              <TableCell className='font-medium'>{student.fullName}</TableCell>
              <TableCell className='text-slate-600'>{student.email}</TableCell>
              <TableCell className='text-right'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      disabled={removeStudentMutation.isPending}
                    >
                      Xóa khỏi lớp
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Xác nhận xóa sinh viên
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc muốn xóa sinh viên này khỏi lớp?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const studentId = resolveStudentId(student)
                          if (!studentId) return
                          removeStudentMutation.mutate({
                            classroomId,
                            studentId
                          })
                        }}
                        className='bg-red-600 hover:bg-red-700'
                      >
                        Xóa khỏi lớp
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
