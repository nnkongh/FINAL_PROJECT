import { Users, FileText, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useExportReport } from '@/modules/reports/hooks/useExportReport'
import { toast } from 'sonner'
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
import { useDeleteGroup } from '@/modules/groups/hooks/useGroups'

interface GroupCardProps {
  group: any
  onClick?: () => void
  actionButton?: React.ReactNode
  maxMembersPerGroup?: number
  isMyGroup?: boolean
  onJoin?: () => void
  isJoinDisabled?: boolean
  showReportButton?: boolean
  showDeleteButton?: boolean
  onDeleted?: () => void
}

export default function GroupCard({
  group,
  onClick,
  actionButton,
  maxMembersPerGroup,
  isMyGroup,
  onJoin,
  isJoinDisabled,
  showReportButton = false,
  showDeleteButton = false,
  onDeleted
}: GroupCardProps) {
  const { isLoading: isExportingReport, exportAndDownload } = useExportReport()
  const deleteGroupMutation = useDeleteGroup()

  const computeProgressPercent = (
    progressData:
      | { totalTasks?: number; doneTasks?: number }
      | number
      | undefined
      | null
  ) => {
    if (progressData === null || progressData === undefined) return null

    if (typeof progressData === 'number') {
      if (!Number.isFinite(progressData)) return 0
      const normalized = Math.floor(progressData)
      return Math.min(100, Math.max(0, normalized))
    }

    const totalTasks = Number(progressData?.totalTasks ?? 0)
    const doneTasks = Number(progressData?.doneTasks ?? 0)

    if (!Number.isFinite(totalTasks) || totalTasks <= 0) return 0
    if (!Number.isFinite(doneTasks) || doneTasks <= 0) return 0

    return Math.floor((doneTasks / totalTasks) * 100)
  }

  const progress = computeProgressPercent(group.progress)
  const hasProgress = progress !== null

  const memberCount =
    typeof group.memberCount === 'number'
      ? group.memberCount
      : typeof group.totalMemberCount === 'number'
        ? group.totalMemberCount
        : 0
  const memberLimit =
    typeof maxMembersPerGroup === 'number' && maxMembersPerGroup > 0
      ? maxMembersPerGroup
      : typeof group.limitedUser === 'number'
        ? group.limitedUser
        : 0
  const isFull = memberLimit > 0 && memberCount === memberLimit

  const getProgressColor = (progressValue: number) => {
    if (progressValue >= 75) return 'bg-green-500'
    if (progressValue >= 50) return 'bg-blue-500'
    if (progressValue >= 25) return 'bg-yellow-500'
    return 'bg-slate-400'
  }

  const resolvedIsMyGroup =
    typeof isMyGroup === 'boolean'
      ? isMyGroup
      : typeof group?.isMyGroup === 'boolean'
        ? group.isMyGroup
        : undefined

  const isClickable = Boolean(onClick) || resolvedIsMyGroup === true

  const resolveNumericGroupId = (): number | null => {
    const rawId = group?.rawGroupId ?? group?.id
    const parsed = Number(String(rawId).replace(/\D/g, ''))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }

  const handleExportReport = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const numericGroupId = resolveNumericGroupId()
    if (!numericGroupId) {
      toast.error('ID nhóm không hợp lệ để xuất báo cáo')
      return
    }

    try {
      await exportAndDownload(numericGroupId)
      toast.success('Xuất báo cáo thành công')
    } catch {
      toast.error('Xuất báo cáo thất bại, vui lòng thử lại')
    }
  }

  const handleDeleteGroup = async () => {
    const numericGroupId = resolveNumericGroupId()
    if (!numericGroupId) {
      toast.error('ID nhóm không hợp lệ để xóa')
      return
    }

    try {
      await deleteGroupMutation.mutateAsync(String(numericGroupId))
      toast.success('Đã xóa nhóm thành công')
      onDeleted?.()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Không thể xóa nhóm. Vui lòng thử lại.'
      )
    }
  }

  return (
    <Card
      className={`group flex flex-col h-full border-2 transition-all ${
        isClickable
          ? 'cursor-pointer hover:shadow-md hover:border-blue-300'
          : 'cursor-default'
      }`}
      onClick={onClick}
    >
      <CardHeader className='pb-3 flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='text-lg group-hover:text-blue-600 transition-colors'>
          {group.name}
        </CardTitle>
        <div
          className='flex items-center gap-2'
          onClick={e => e.stopPropagation()}
        >
          {actionButton}
          {showDeleteButton && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='destructive'
                  size='icon'
                  className='h-8 w-8'
                  disabled={deleteGroupMutation.isPending}
                >
                  {deleteGroupMutation.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Trash2 className='h-4 w-4' />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa nhóm</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa nhóm này không? Hành động này
                    không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGroup}
                    className='bg-red-600 hover:bg-red-700'
                  >
                    Xóa nhóm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>

      <CardContent className='flex-1 flex flex-col space-y-4'>
        <div className='flex items-center gap-2 text-sm text-slate-600'>
          <Users className='h-4 w-4' />
          <span className='font-medium'>
            {memberCount} / {memberLimit} thành viên
          </span>
          {isFull && (
            <Badge className='ml-auto text-xs border-emerald-200 bg-emerald-50 text-emerald-700'>
              Đầy đủ
            </Badge>
          )}
        </div>

        {/* Chỉ hiện tiến độ khi progress không phải null */}
        {hasProgress && (
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-slate-600 font-medium'>Tiến độ dự án</span>
              <span className='font-bold text-slate-900'>{progress}%</span>
            </div>
            <Progress
              value={progress}
              className='h-2'
              indicatorClassName={getProgressColor(progress)}
            />
          </div>
        )}

        {showReportButton && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='w-full gap-2'
            onClick={handleExportReport}
            disabled={isExportingReport}
          >
            {isExportingReport ? (
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
        )}

        {resolvedIsMyGroup === false && Boolean(onJoin) && (
          <div className='mt-auto pt-4'>
            <Button
              type='button'
              variant='outline'
              className='w-full rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100'
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onJoin?.()
              }}
              disabled={isJoinDisabled}
            >
              Xin gia nhập
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
