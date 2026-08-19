import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CalendarClock, AlertTriangle } from 'lucide-react'
import { useGetOverdueTasks } from '../hooks/useTask'
import { formatDateTimeVi } from '@/lib/dayjs'

interface OverdueTaskListProps {
  groupId: number | string
  groupName?: string
}

const getPriorityVariant = (priority?: string) => {
  const normalized = (priority || '').toLowerCase()
  if (normalized === 'high') return 'destructive'
  if (normalized === 'medium') return 'secondary'
  return 'outline'
}

export default function OverdueTaskList({
  groupId,
  groupName
}: OverdueTaskListProps) {
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useGetOverdueTasks(groupId)

  return (
    <div className='rounded-lg border border-slate-200 bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between px-5 py-4'>
        <div>
          <p className='flex items-center gap-1.5 text-sm font-semibold text-red-500'>
            Công việc quá hạn
          </p>
          {groupName && (
            <p className='mt-0.5 text-xs text-slate-400'>{groupName}</p>
          )}
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => refetch()}
          disabled={isFetching || isLoading}
          className='text-slate-500 hover:text-slate-700'
        >
          {isFetching ? (
            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
          ) : (
            <RefreshCw className='mr-1.5 h-3.5 w-3.5' />
          )}
          Làm mới
        </Button>
      </div>

      <div className='border-t border-slate-100' />

      {/* Body */}
      <div className='px-5 py-4'>
        {isLoading ? (
          <div className='flex items-center justify-center py-6 text-sm text-slate-400'>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Đang tải công việc quá hạn...
          </div>
        ) : isError ? (
          <p className='py-4 text-center text-sm text-red-500'>
            {(error as Error)?.message ||
              'Không thể tải danh sách công việc quá hạn'}
          </p>
        ) : data.length === 0 ? (
          <p className='py-6 text-center text-sm text-slate-400'>
            Không có công việc nào quá hạn.
          </p>
        ) : (
          <div className='divide-y divide-slate-100'>
            {data.map(task => (
              <div
                key={String(task.id)}
                className='flex flex-wrap items-start justify-between gap-3 py-3'
              >
                <div>
                  <p className='text-sm font-medium text-slate-800'>
                    {task.title}
                  </p>
                  <div className='mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400'>
                    {task.assigneeName && (
                      <span>Phân công: {task.assigneeName}</span>
                    )}
                    {task.dueDate && (
                      <span className='flex items-center gap-1'>
                        <CalendarClock className='h-3.5 w-3.5' />
                        Hạn: {formatDateTimeVi(task.dueDate)}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className='mt-1.5 text-xs text-slate-400'>
                      {task.description}
                    </p>
                  )}
                </div>

                <div className='flex flex-wrap gap-1.5'>
                  {task.priority && (
                    <Badge
                      variant={getPriorityVariant(task.priority)}
                      className='text-xs'
                    >
                      {task.priority}
                    </Badge>
                  )}
                  {task.status && (
                    <Badge variant='outline' className='text-xs'>
                      {task.status}
                    </Badge>
                  )}
                  {typeof task.overdueDays === 'number' &&
                    task.overdueDays > 0 && (
                      <Badge variant='destructive' className='text-xs'>
                        {task.overdueDays} ngày quá hạn
                      </Badge>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
