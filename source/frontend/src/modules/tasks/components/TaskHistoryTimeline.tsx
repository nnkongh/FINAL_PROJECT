import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTimeVi } from '@/lib/dayjs'
import { ArrowRight, Clock3, History, UserRound } from 'lucide-react'
import type { TaskHistoryItem } from '../types/task'

export interface TaskHistoryTimelineMember {
  id: number | string
  fullName?: string
  userName?: string
  email?: string
}

interface TaskHistoryTimelineProps {
  items: TaskHistoryItem[]
  members?: TaskHistoryTimelineMember[]
  className?: string
}

const resolveUserLabel = (
  changedBy: number | string,
  members?: TaskHistoryTimelineMember[]
) => {
  const matchedUser = members?.find(
    member => String(member.id) === String(changedBy)
  )
  if (matchedUser) {
    return (
      matchedUser.fullName || matchedUser.userName || `Người dùng #${changedBy}`
    )
  }

  return `Người dùng #${changedBy}`
}

const formatStatusLabel = (status?: string) => {
  if (!status) return '—'
  return status
}

export default function TaskHistoryTimeline({
  items,
  members,
  className
}: TaskHistoryTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-slate-900'>
          <History className='h-5 w-5 text-blue-600' />
          Lịch sử thay đổi
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600'>
            Chưa có lịch sử thay đổi cho công việc này.
          </div>
        ) : (
          <div className='space-y-4'>
            {items.map((item, index) => (
              <div key={String(item.id)} className='relative pl-6'>
                {index < items.length - 1 && (
                  <span className='absolute left-2 top-4 h-full w-px bg-slate-200' />
                )}
                <span className='absolute left-0 top-4 flex h-4 w-4 items-center justify-center rounded-full border-2 border-blue-500 bg-white'>
                  <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                </span>

                <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge variant='secondary'>
                      {formatStatusLabel(item.oldStatus)}
                    </Badge>
                    <ArrowRight className='h-4 w-4 text-slate-400' />
                    <Badge variant='outline'>
                      {formatStatusLabel(item.newStatus)}
                    </Badge>
                  </div>

                  <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600'>
                    <span className='inline-flex items-center gap-1.5'>
                      <UserRound className='h-4 w-4 text-slate-400' />
                      {resolveUserLabel(item.changedBy, members)}
                    </span>
                    <span className='inline-flex items-center gap-1.5'>
                      <Clock3 className='h-4 w-4 text-slate-400' />
                      {formatDateTimeVi(item.changedAt) || item.changedAt}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
