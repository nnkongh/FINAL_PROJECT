import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  UserPlus,
  User,
  TrendingUp,
  FileUp,
  Loader2,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useGetGroups } from '../hooks/useGroups'
import { useExportReport } from '@/modules/reports/hooks/useExportReport'
import CreateGroupModal from './CreateGroupModal'
import JoinGroupModal from './JoinGroupModal'
import ImportFileDialog from './ImportFileDialog'

export default function GroupDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [currentExportGroupId, setCurrentExportGroupId] = useState<
    string | null
  >(null)
  const { isLoading: isExportingReport, exportAndDownload } = useExportReport()

  // Fetch groups using React Query
  const {
    data: groups = [],
    isLoading,
    isError,
    error,
    refetch
  } = useGetGroups()

  const handleImportSuccess = () => {
    console.log('Import success! Reloading data...')
    refetch()
  }

  const handleExportReport = async (
    event: React.MouseEvent,
    groupId: string
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const numericGroupId = Number(String(groupId).replace(/\D/g, ''))
    if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) {
      toast.error('ID nhóm không hợp lệ để xuất báo cáo')
      return
    }

    try {
      setCurrentExportGroupId(groupId)
      await exportAndDownload(numericGroupId)
      toast.success('Xuất báo cáo thành công')
    } catch {
      toast.error('Xuất báo cáo thất bại, vui lòng thử lại')
    } finally {
      setCurrentExportGroupId(null)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-slate-400'
  }

  // HÀM TÍNH TOÁN TIẾN ĐỘ TỪ DATA THẬT
  const calculateProgressPercent = (
    totalTasks?: number,
    totalTasksDone?: number
  ) => {
    const total = Number(totalTasks || 0)
    const done = Number(totalTasksDone || 0)

    if (total <= 0) return 0
    return Math.floor((done / total) * 100)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex flex-col items-center justify-center py-20'>
          <Loader2 className='h-12 w-12 animate-spin text-blue-600 mb-4' />
          <p className='text-slate-600'>Đang tải danh sách nhóm...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (isError) {
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : 'Có lỗi xảy ra khi tải danh sách nhóm'

    return (
      <div className='container mx-auto p-6'>
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='text-red-500 mb-4'>❌</div>
          <h3 className='text-xl font-semibold text-slate-900 mb-2'>
            Không thể tải dữ liệu
          </h3>
          <p className='text-slate-600 mb-4'>{errorMessage}</p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-slate-100'>
            Nhóm của tôi
          </h1>
          <p className='text-slate-600 dark:text-slate-400 mt-1'>
            Quản lý các nhóm và hoạt động cộng tác của bạn
          </p>
        </div>

        {/* <div className='flex gap-3'>
          <Button onClick={() => setIsCreateModalOpen(true)} className='gap-2'>
            <Plus className='h-4 w-4' />
            Tạo nhóm
          </Button>
          <Button
            onClick={() => setIsJoinModalOpen(true)}
            variant='outline'
            className='gap-2'
          >
            <UserPlus className='h-4 w-4' />
            Join Group
          </Button>
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            variant='secondary'
            className='gap-2'
          >
            <FileUp className='h-4 w-4' />
            Import
          </Button>
        </div> */}
      </div>

      {/* Groups Grid */}
      {groups.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {groups.map(group => (
            <Link key={group.id} to={`/groups/${group.id}`} className='block'>
              {(() => {
                const totalMemberCount = group.totalMemberCount ?? 0
                const limitedUser = group.limitedUser ?? 0

                // ÁP DỤNG HÀM TÍNH TOÁN Ở ĐÂY
                const progressValue = calculateProgressPercent(
                  group.totalTasks,
                  group.totalTasksDone
                )

                return (
                  <Card className='hover:shadow-lg transition-shadow cursor-pointer group h-full'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between mb-2'>
                        {/* Lấy majorType từ API thay vì category */}
                        <Badge variant='secondary' className='text-xs'>
                          {group.subjectOrProjectName || 'N/A'}
                        </Badge>
                        <TrendingUp
                          className={`h-4 w-4 ${
                            progressValue >= 50
                              ? 'text-green-500'
                              : 'text-slate-400'
                          }`}
                        />
                      </div>
                      <CardTitle className='text-lg group-hover:text-blue-600 transition-colors'>
                        {group.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className='space-y-4'>
                      {/* Members Count */}
                      <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
                        <User className='h-4 w-4' />
                        <span className='font-medium'>
                          {totalMemberCount} / {limitedUser} members
                        </span>
                        {limitedUser > 0 &&
                          totalMemberCount === limitedUser && (
                            <Badge
                              variant='outline'
                              className='ml-auto text-xs'
                            >
                              Full
                            </Badge>
                          )}
                      </div>

                      {/* Progress Section */}
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-slate-600 dark:text-slate-400 font-medium'>
                            Progress
                          </span>
                          <span className='font-bold text-slate-900 dark:text-slate-100'>
                            {progressValue}%
                          </span>
                        </div>
                        <Progress
                          value={progressValue}
                          className='h-2'
                          indicatorClassName={getProgressColor(progressValue)}
                        />
                      </div>

                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='w-full gap-2'
                        onClick={event => handleExportReport(event, group.id)}
                        disabled={isExportingReport}
                      >
                        {isExportingReport &&
                        currentExportGroupId === group.id ? (
                          <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <FileText className='h-4 w-4' />
                            Tạo Báo Cáo
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })()}
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <div className='rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4'>
            <User className='h-12 w-12 text-slate-400' />
          </div>
          <h3 className='text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2'>
            Chưa có nhóm nào
          </h3>
          <p className='text-slate-600 dark:text-slate-400 mb-6 max-w-sm'>
            Hãy tham gia một lớp học để có thể tạo hoặc tham gia nhóm.
          </p>
          {/* <div className='flex gap-3'>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className='gap-2'
            >
              <Plus className='h-4 w-4' />
              Tạo nhóm
            </Button>
            <Button
              onClick={() => setIsJoinModalOpen(true)}
              variant='outline'
              className='gap-2'
            >
              <UserPlus className='h-4 w-4' />
              Join Group
            </Button>
          </div> */}
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxMembersPerGroup={10}
        onSuccess={() => refetch()}
      />

      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <ImportFileDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  )
}
