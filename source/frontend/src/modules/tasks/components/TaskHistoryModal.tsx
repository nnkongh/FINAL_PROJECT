import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { useTaskHistory } from '../hooks/useTaskHistory'
import { useGetGroupMembers } from '@/modules/groups/hooks/useGroups'
import TaskHistoryTimeline from './TaskHistoryTimeline'
import type { TaskHistoryTimelineMember } from './TaskHistoryTimeline'

interface TaskHistoryModalProps {
  taskId?: number | string
  taskTitle?: string
  isOpen: boolean
  onClose: () => void
  groupId?: number
}

export default function TaskHistoryModal({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  groupId
}: TaskHistoryModalProps) {
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useTaskHistory(taskId)

  const numericGroupId = useMemo(() => {
    return typeof groupId === 'number' && groupId > 0 ? groupId : 0
  }, [groupId])

  const { data: groupMembersResponse } = useGetGroupMembers(numericGroupId)

  const displayMembers: TaskHistoryTimelineMember[] = useMemo(() => {
    const payload = groupMembersResponse as
      | { value?: Array<Record<string, unknown>> }
      | Array<Record<string, unknown>>
      | undefined

    const rawMembers = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.value)
        ? payload.value
        : []

    return rawMembers
      .map(member => ({
        id: (member.userId ?? member.id ?? 0) as number | string,
        fullName:
          (member.fullName as string) ||
          (member.name as string) ||
          (member.userName as string) ||
          undefined,
        userName:
          (member.userName as string) ||
          (member.userCode as string) ||
          (member.fullName as string) ||
          undefined
      }))
      .filter(member => member.id)
  }, [groupMembersResponse])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <DialogTitle>Lịch sử </DialogTitle>
              {taskTitle && (
                <p className='mt-1 text-sm text-slate-500'>{taskTitle}</p>
              )}
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => refetch()}
              disabled={isFetching || isLoading || !taskId}
            >
              {isFetching ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
              )}
              Làm mới
            </Button>
          </div>
        </DialogHeader>

        {!taskId ? (
          <div className='rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700'>
            Không có taskId hợp lệ để tải lịch sử.
          </div>
        ) : isLoading ? (
          <div className='flex items-center justify-center py-10 text-slate-600'>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            Đang tải lịch sử task...
          </div>
        ) : isError ? (
          <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
            {(error as Error)?.message || 'Không thể tải lịch sử task'}
          </div>
        ) : (
          <TaskHistoryTimeline items={data} members={displayMembers} />
        )}
      </DialogContent>
    </Dialog>
  )
}
