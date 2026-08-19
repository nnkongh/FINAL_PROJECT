import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Copy, CheckCircle2, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CreateClassModal from '../components/CreateClassModal'
import { useGetClasses, useGetClassroomCodes } from '../hooks/useClass'
import type { ClassResponse } from '../types/class'
import { getCurrentUserFromToken } from '@/lib/token'
import ClassroomActionDemo from '../components/ClassroomActionDemo'
import type { JoinClassResponse } from '../api/classroomActionApi'

type ClassCardData = {
  id: string
  name: string
  subject: string
  joinCode: string
  studentCount: number
  groupCount: number
}

const mapClassResponseToClass = (item: ClassResponse): ClassCardData => {
  const totalStudents = item.totalEnrollments
  const totalGroups = item.totalGroups

  return {
    id: String(item.id),
    name: item.className,
    subject: item.subjectName,
    joinCode: item.classCode,
    studentCount: totalStudents,
    groupCount: totalGroups
  }
}

export default function MyClassesPage() {
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const currentUser = getCurrentUserFromToken()
  const normalizedRole = (currentUser.systemRole || '').toUpperCase()
  const isStudent = normalizedRole.includes('STUDENT')
  const {
    data: classList = [],
    isLoading,
    isError,
    error,
    refetch
  } = useGetClasses()

  const { data: classroomCodes = {} } = useGetClassroomCodes(
    classList.map(item => item.id)
  )

  const classes = classList.map(mapClassResponseToClass)

  const getJoinCode = (classItem: ClassCardData) => {
    return classroomCodes[classItem.id] || classItem.joinCode || 'N/A'
  }

  const handleCopyJoinCode = (joinCode: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (!joinCode || joinCode === 'N/A') return
    navigator.clipboard.writeText(joinCode)
    setCopiedCode(joinCode)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleViewClass = (classId: string) => {
    navigate(`/classes/${classId}`)
  }

  const handleStudentJoinSuccess = async (payload: JoinClassResponse) => {
    void refetch()

    const joinedClassId = payload.classId ?? payload.id
    if (joinedClassId) {
      navigate(`/classes/${joinedClassId}`)
    }
  }

  if (isLoading) {
    return (
      <div className='h-full overflow-y-auto p-6'>
        <div className='rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600'>
          Đang tải danh sách lớp học...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='h-full overflow-y-auto p-6'>
        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          {(error as Error)?.message || 'Không thể tải danh sách lớp học'}
        </div>
        <Button className='mt-4' onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className='h-full overflow-y-auto p-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8'>
        <div className='min-w-0'>
          <h1 className='text-3xl font-bold text-slate-900'>
            {isStudent ? 'Lớp học của tôi' : 'Quản lý Lớp học của tôi'}
          </h1>
          <p className='text-slate-600 mt-2'>
            {isStudent
              ? 'Xem các lớp đã tham gia và nhập mã để tham gia lớp mới'
              : 'Quản lý các lớp học và theo dõi tiến độ nhóm sinh viên'}
          </p>
        </div>

        {isStudent ? (
          <div className='w-full md:w-80 md:shrink-0'>
            <ClassroomActionDemo
              role='STUDENT'
              compact
              onJoinSuccess={handleStudentJoinSuccess}
            />
          </div>
        ) : (
          <Button onClick={() => setIsCreateModalOpen(true)} className='gap-2'>
            <Plus className='h-4 w-4' />
            Tạo Lớp Học
          </Button>
        )}
      </div>

      {!isStudent && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-600 mb-1'>Tổng số lớp</p>
                  <p className='text-3xl font-bold text-slate-900'>
                    {classes.length}
                  </p>
                </div>
                <div className='p-3 bg-blue-100 rounded-lg'>
                  <Users className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-600 mb-1'>Tổng sinh viên</p>
                  <p className='text-3xl font-bold text-slate-900'>
                    {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                  </p>
                </div>
                <div className='p-3 bg-green-100 rounded-lg'>
                  <UserCircle className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card> */}

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-slate-600 mb-1'>Tổng nhóm</p>
                  <p className='text-3xl font-bold text-slate-900'>
                    {classes.reduce((sum, c) => sum + c.groupCount, 0)}
                  </p>
                </div>
                <div className='p-3 bg-purple-100 rounded-lg'>
                  <Users className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Classes Grid */}
      {classes.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {classes.map(classItem => {
            const joinCode = getJoinCode(classItem)

            return (
              <Card
                key={classItem.id}
                className='hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-200'
                onClick={() => handleViewClass(classItem.id)}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between mb-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {classItem.subject}
                    </Badge>
                  </div>
                  <CardTitle className='text-xl group-hover:text-blue-600 transition-colors'>
                    {classItem.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Join Code Section */}
                  {!isStudent && (
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                      <p className='text-xs text-blue-600 font-medium mb-1'>
                        MÃ THAM GIA
                      </p>
                      <div className='flex items-center justify-between'>
                        <span className='text-lg font-bold text-blue-900 tracking-wider font-mono'>
                          {joinCode}
                        </span>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={e => handleCopyJoinCode(joinCode, e)}
                          className='h-8 w-8 p-0'
                          disabled={!joinCode || joinCode === 'N/A'}
                        >
                          {copiedCode === joinCode ? (
                            <CheckCircle2 className='h-4 w-4 text-green-600' />
                          ) : (
                            <Copy className='h-4 w-4 text-blue-600' />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-slate-600 flex items-center gap-2'>
                        <Users className='h-4 w-4' />
                        Sinh viên
                      </span>
                      <span className='font-semibold text-slate-900'>
                        {classItem.studentCount}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-slate-600'>Số nhóm đã tạo</span>
                      <Badge variant='outline'>
                        {classItem.groupCount} nhóm
                      </Badge>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    variant='outline'
                    className='w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all'
                    onClick={e => {
                      e.stopPropagation()
                      handleViewClass(classItem.id)
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <div className='rounded-full bg-slate-100 p-6 mb-4'>
            <Users className='h-12 w-12 text-slate-400' />
          </div>
          <h3 className='text-xl font-semibold text-slate-900 mb-2'>
            Chưa có lớp học nào
          </h3>
          <p className='text-slate-600 mb-6 max-w-sm'>
            {isStudent
              ? 'Bạn chưa tham gia lớp nào. Hãy dùng mã lớp để tham gia.'
              : 'Tạo lớp học đầu tiên để bắt đầu quản lý sinh viên và nhóm học tập.'}
          </p>
        </div>
      )}

      {/* Create Class Modal */}
      {!isStudent && (
        <CreateClassModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            void refetch()
          }}
        />
      )}
    </div>
  )
}
