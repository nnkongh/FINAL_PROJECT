import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, History, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTaskHistory } from '../hooks/useTaskHistory'
import { useGetGroupMembers } from '@/modules/groups/hooks/useGroups'
import TaskHistoryTimeline from '../components/TaskHistoryTimeline'
import type { TaskHistoryTimelineMember } from '../components/TaskHistoryTimeline'

export default function TaskHistoryPage() {
  const { taskId, groupId } = useParams<{ taskId: string; groupId: string }>()
  const navigate = useNavigate()

  const numericTaskId = useMemo(() => {
    const parsed = Number(taskId)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }, [taskId])

  const numericGroupId = useMemo(() => {
    const parsed = Number(groupId)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }, [groupId])

  const {
    data: history = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useTaskHistory(numericTaskId)

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

  const isValidTaskId = numericTaskId !== undefined

  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Button variant='outline' onClick={() => navigate(-1)}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>

        <Button
          type='button'
          variant='outline'
          onClick={() => refetch()}
          disabled={isFetching || isLoading || !isValidTaskId}
        >
          {isFetching ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <History className='mr-2 h-4 w-4' />
          )}
          Làm mới
        </Button>
      </div>

      <Card className='overflow-hidden'>
        <CardHeader className='border-b bg-slate-50/80'>
          <CardTitle className='flex items-center gap-2'>
            <History className='h-5 w-5 text-blue-600' />
            Lịch sử task {taskId ? `#${taskId}` : ''}
          </CardTitle>
        </CardHeader>

        <CardContent className='p-6'>
          {!isValidTaskId ? (
            <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700'>
              `taskId` không hợp lệ.
            </div>
          ) : isLoading ? (
            <div className='flex items-center justify-center py-12 text-slate-600'>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              Đang tải lịch sử task...
            </div>
          ) : isError ? (
            <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
              {(error as Error)?.message || 'Không thể tải lịch sử task'}
            </div>
          ) : (
            <TaskHistoryTimeline
              items={history}
              members={displayMembers}
              className='border-0 shadow-none'
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
