import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, CheckCircle2, Users, UserCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GroupCard from '../components/GroupCard'
import UngroupedStudentsTable from '../components/UngroupedStudentsTable'
import type { ClassGroup, Student } from '../types/class'
import { useGetClassroomCodes, useGetClassroomDetail } from '../hooks/useClass'
import { getCurrentUserFromToken } from '@/lib/token'
import StudentGroupTab from '../components/StudentGroupTab'
import {
  useClassroomEnrollments,
  useClassroomGroups
} from '../hooks/useClassroomGroups'
import { classroomGroupKeys } from '../hooks/useClassroomGroups'
import type { ClassroomEnrollmentItem } from '../api/classroomGroupApi'
import ClassroomTeacherActions from '../components/ClassroomTeacherActions'
import { useExportAllGroups } from '@/modules/reports/hooks/useExportAllGroups'
import { toast } from 'sonner'

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUser = getCurrentUserFromToken()
  const normalizedRole = (currentUser.systemRole || '').toUpperCase()
  const isStudent = normalizedRole.includes('STUDENT')
  const [copiedCode, setCopiedCode] = useState(false)
  const queryClient = useQueryClient()

  // Gọi API lấy chi tiết 1 lớp học
  const {
    data: classData,
    isLoading,
    isError,
    error,
    refetch
  } = useGetClassroomDetail(id)

  const { data: classroomCodes = {}, isLoading: codeLoading } =
    useGetClassroomCodes(classData?.id ? [classData.id] : [])

  const {
    data: classroomGroups = [],
    isLoading: groupsLoading,
    isError: groupsError
  } = useClassroomGroups(id)

  const { isLoading: isExportingAll, exportAndDownload: exportAllGroups } =
    useExportAllGroups()

  const {
    data: classroomEnrollments = [],
    isLoading: enrollmentsLoading,
    isError: enrollmentsError
  } = useClassroomEnrollments(id)

  const getNumericId = (value: unknown): number | null => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }

  const normalizeText = (value: unknown): string => {
    return typeof value === 'string' ? value.trim().toUpperCase() : ''
  }

  const currentClassroomId = getNumericId(id)

  const isStudentEnrollment = (item: ClassroomEnrollmentItem): boolean => {
    const roleCandidates = [
      item.userRole,
      item.role,
      item.roleName,
      item.enrollmentRole
    ]

    const normalizedRoles = roleCandidates
      .map(value => normalizeText(value))
      .filter(Boolean)

    if (normalizedRoles.length === 0) return false

    return normalizedRoles.some(role => role.includes('STUDENT'))
  }

  const isInCurrentClassroom = (item: ClassroomEnrollmentItem): boolean => {
    if (!currentClassroomId) return true

    const classroomIds = [item.classroomId, item.classId]
      .map(value => getNumericId(value))
      .filter((value): value is number => value !== null)

    if (classroomIds.length === 0) return true

    return classroomIds.includes(currentClassroomId)
  }

  const computeProgressPercent = (progressData: {
    totalTasks?: number
    doneTasks?: number
  }) => {
    const totalTasks = Number(progressData?.totalTasks ?? 0)
    const doneTasks = Number(progressData?.doneTasks ?? 0)

    if (!Number.isFinite(totalTasks) || totalTasks <= 0) return 0
    if (!Number.isFinite(doneTasks) || doneTasks <= 0) return 0

    return Math.floor((doneTasks / totalTasks) * 100)
  }

  const groups: ClassGroup[] = useMemo(() => {
    return classroomGroups.map(group => {
      const memberCount =
        typeof group.totalMemberCount === 'number'
          ? group.totalMemberCount
          : typeof group.memberCount === 'number'
            ? group.memberCount
            : Array.isArray(group.members)
              ? group.members.length
              : 0

      // const progressValue = computeProgressPercent(
      //   (group as { progress?: { totalTasks?: number; doneTasks?: number } })
      //     .progress ?? {}
      // )
      const rawProgress = (
        group as {
          progress?: { totalTasks?: number; doneTasks?: number } | null
        }
      ).progress

      const progressValue =
        rawProgress == null ? null : computeProgressPercent(rawProgress)

      return {
        id: `group-${group.id}`,
        rawGroupId: group.id,
        name: group.name,
        classId: String(id || ''),
        memberCount,
        maxMembers: group.limitedUser ?? 0,
        progress: progressValue,
        totalMemberCount: group.totalMemberCount,
        limitedUser: group.limitedUser,
        isMyGroup: group.isMyGroup
      }
    })
  }, [classroomGroups, id])

  const groupedMemberIds = useMemo(() => {
    const ids = new Set<number>()
    classroomGroups.forEach(group => {
      if (!Array.isArray(group.members)) return
      group.members.forEach(member => {
        const memberId = getNumericId(member.userId ?? member.id)
        if (memberId) ids.add(memberId)
      })
    })
    return ids
  }, [classroomGroups])

  const studentEnrollments = useMemo(() => {
    return classroomEnrollments.filter(item => {
      const enrollmentId = getNumericId(item.userId ?? item.id)
      if (!enrollmentId) return false
      if (!isStudentEnrollment(item)) return false
      if (!isInCurrentClassroom(item)) return false

      return true
    })
  }, [classroomEnrollments, currentClassroomId])

  const ungroupedStudents: Student[] = useMemo(() => {
    return studentEnrollments
      .filter(item => {
        const enrollmentId = getNumericId(item.userId ?? item.id)

        if (!enrollmentId) return false
        return !groupedMemberIds.has(enrollmentId)
      })
      .map(item => {
        const rawId = getNumericId(item.userId ?? item.id) || 0
        return {
          id: String(rawId),
          mssv: String(rawId),
          fullName: item.fullName || item.userName || `Sinh viên ${rawId}`,
          email: item.email || 'N/A'
        }
      })
  }, [studentEnrollments, groupedMemberIds])

  const classStudents: Student[] = useMemo(() => {
    return studentEnrollments.map(item => {
      const rawId = getNumericId(item.userId ?? item.id) || 0
      return {
        id: String(rawId),
        mssv: item.userCode || String(rawId),
        fullName: item.fullName || item.userName || `Sinh viên ${rawId}`,
        email: item.email || 'N/A'
      }
    })
  }, [studentEnrollments])

  const studentCount = classStudents.length
  const ungroupedStudentCount = ungroupedStudents.length

  if (isLoading) {
    return (
      <div className='h-full overflow-y-auto p-6 pt-0'>
        <div className='rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600'>
          Đang tải thông tin lớp học...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='h-full overflow-y-auto p-6 pt-0'>
        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          {(error as Error)?.message || 'Không thể tải thông tin lớp học'}
        </div>
        <Button className='mt-4' onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className='h-full overflow-y-auto p-6 pt-0 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-slate-900 mb-2'>
            Không tìm thấy lớp học
          </h2>
          <p className='text-slate-600 mb-6'>
            Lớp học này không tồn tại hoặc đã bị xóa
          </p>
          <Button onClick={() => navigate('/classes')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }
  const joinCode =
    classroomCodes[String(classData?.id)] ||
    classData.classCode ||
    classData.inviteCode ||
    'N/A'

  const handleCopyJoinCode = () => {
    if (!joinCode || joinCode === 'N/A') return

    navigator.clipboard.writeText(joinCode)
    setCopiedCode(true)

    setTimeout(() => {
      setCopiedCode(false)
    }, 2000)
  }

  const handleViewGroup = (rawGroupId: string | number) => {
    navigate(`/groups/${rawGroupId}`)
  }

  const handleExportAllGroups = async () => {
    const classroomId = Number(classData.id)
    if (!Number.isFinite(classroomId) || classroomId <= 0) {
      toast.error('ID lớp học không hợp lệ để xuất báo cáo')
      return
    }

    try {
      await exportAllGroups(classroomId, classData.className)
      toast.success('Xuất báo cáo tất cả nhóm thành công')
    } catch {
      toast.error('Xuất báo cáo tất cả nhóm thất bại, vui lòng thử lại')
    }
  }

  const classroomIdForActions = id || String(classData.id)

  const handleGroupDeleted = () => {
    queryClient.invalidateQueries({
      queryKey: classroomGroupKeys.groups(classroomIdForActions)
    })
  }

  return (
    <div className='h-full overflow-y-auto p-4 pt-0'>
      {/* Header */}
      <div className='mb-3'>
        <Button
          variant='ghost'
          onClick={() => navigate('/classes')}
          className='mb-2 h-8 px-2'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại danh sách lớp
        </Button>

        {/* Class Info Card */}
        <Card className='border-2'>
          <CardHeader className='pb-3 pt-4'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <CardTitle className='text-3xl'>
                    {classData.className}
                  </CardTitle>
                  <Badge variant='secondary' className='text-sm'>
                    {classData.subjectName}
                  </Badge>
                </div>
                {/* <CardDescription className='text-base'>
                  {studentCount} sinh viên • 
                  {classData.totalGroups ?? 0} nhóm
                  đã tạo
                </CardDescription> */}

                {!isStudent && (
                  <div className='mt-4'>
                    <ClassroomTeacherActions
                      classroomId={String(classData.id)}
                      isActive={classData.isActive !== false}
                      initialData={{
                        className: classData.className || '',
                        subjectName: classData.subjectName || ''
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Join Code Display */}
              {!isStudent && (
                <div className='bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-w-50'>
                  <p className='text-xs text-blue-600 font-semibold mb-2'>
                    MÃ THAM GIA LỚP HỌC
                  </p>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='text-2xl font-bold text-blue-900 tracking-wider font-mono'>
                      {codeLoading ? 'Đang tải...' : joinCode}
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleCopyJoinCode}
                      className='h-9 w-9 p-0'
                    >
                      {copiedCode ? (
                        <CheckCircle2 className='h-5 w-5 text-green-600' />
                      ) : (
                        <Copy className='h-5 w-5 text-blue-600' />
                      )}
                    </Button>
                  </div>
                  <p className='text-xs text-blue-600 mt-2'>
                    Chia sẻ mã này cho sinh viên
                  </p>
                </div>
              )}
            </div>
          </CardHeader>

          {/* Quick Stats */}
          <CardContent>
            <div className='grid grid-cols-3 gap-4'>
              <div className='flex items-center gap-3 p-3 bg-slate-50 rounded-lg'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <Users className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm text-slate-600'>Sinh viên</p>
                  <p className='text-xl font-bold text-slate-900'>
                    {studentCount}
                  </p>
                </div>
              </div>

              {/* <div className='flex items-center gap-3 p-3 bg-slate-50 rounded-lg'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <Users className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-slate-600'>Nhóm đã tạo</p>
                  <p className='text-xl font-bold text-slate-900'>
                    {classData.totalGroups ?? 0}
                  </p>
                </div>
              </div> */}

              <div className='flex items-center gap-3 p-3 bg-slate-50 rounded-lg'>
                <div className='p-2 bg-amber-100 rounded-lg'>
                  <UserCircle className='h-5 w-5 text-amber-600' />
                </div>
                <div>
                  <p className='text-sm text-slate-600'>Chưa có nhóm</p>
                  <p className='text-xl font-bold text-slate-900'>
                    {classData.membersWithoutGroup ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      {isStudent ? (
        <Tabs defaultValue='student-group' className='w-full pb-10'>
          <TabsList className='grid w-full max-w-md grid-cols-1'>
            <TabsTrigger value='student-group' className='gap-2'>
              <Users className='h-4 w-4' />
              Quản lý nhóm
            </TabsTrigger>
          </TabsList>
          <TabsContent value='student-group' className='mt-6'>
            <StudentGroupTab
              subjectName={classData.subjectName}
              maxMembersPerGroup={classData.maxMembersPerGroup ?? 10}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue='groups' className='w-full'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='groups' className='gap-2'>
              <Users className='h-4 w-4' />
              Danh sách Nhóm
            </TabsTrigger>
            <TabsTrigger value='students' className='gap-2'>
              <UserCircle className='h-4 w-4' />
              Danh sách sinh viên
              {classStudents.length > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-2 h-5 min-w-5 rounded-full p-1 flex justify-center align-center'
                >
                  {classStudents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Groups Overview */}
          <TabsContent value='groups' className='space-y-4 mt-6 h-max pb-10'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h3 className='text-lg font-semibold text-slate-900'>
                Danh sách Nhóm
              </h3>
              <Button
                variant='outline'
                onClick={handleExportAllGroups}
                disabled={isExportingAll || groupsLoading}
              >
                {isExportingAll ? 'Đang xuất...' : 'Xuất báo cáo các nhóm'}
              </Button>
            </div>
            {groupsLoading ? (
              <Card>
                <CardContent className='py-8 text-sm text-slate-600'>
                  Đang tải danh sách nhóm...
                </CardContent>
              </Card>
            ) : groupsError ? (
              <Card>
                <CardContent className='py-8 text-sm text-red-600'>
                  Không thể tải danh sách nhóm của lớp học.
                </CardContent>
              </Card>
            ) : groups.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {groups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    maxMembersPerGroup={classData.maxMembersPerGroup ?? 0}
                    onClick={() =>
                      group.rawGroupId && handleViewGroup(group.rawGroupId)
                    }
                    showReportButton={!isStudent}
                    showDeleteButton={!isStudent}
                    onDeleted={handleGroupDeleted}
                  />
                ))}
              </div>
            ) : (
              <Card className='border-dashed border-2'>
                <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
                  <div className='rounded-full bg-slate-100 p-6 mb-4'>
                    <Users className='h-12 w-12 text-slate-400' />
                  </div>
                  <h3 className='text-xl font-semibold text-slate-900 mb-2'>
                    Chưa có nhóm nào
                  </h3>
                  <p className='text-slate-600 max-w-md'>
                    Sinh viên chưa tạo nhóm dự án. Các nhóm sẽ hiển thị ở đây
                    sau khi được tạo.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 2: Students List */}
          <TabsContent value='students' className='mt-6 h-max pb-10'>
            {enrollmentsLoading ? (
              <Card>
                <CardContent className='py-8 text-sm text-slate-600'>
                  Đang tải danh sách sinh viên...
                </CardContent>
              </Card>
            ) : enrollmentsError ? (
              <Card>
                <CardContent className='py-8 text-sm text-red-600'>
                  Không thể tải danh sách thành viên lớp học.
                </CardContent>
              </Card>
            ) : (
              <UngroupedStudentsTable
                students={classStudents}
                classroomId={classData.id}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
