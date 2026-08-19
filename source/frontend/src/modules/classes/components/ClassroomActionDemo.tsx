import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useJoinClass,
  useRegenerateInviteCode
} from '../hooks/useClassroomActions'
import type { JoinClassResponse } from '../api/classroomActionApi'

type ClassroomActionRole = 'TEACHER' | 'STUDENT'

interface ClassroomActionDemoProps {
  role: ClassroomActionRole
  classroomId?: number | string
  compact?: boolean
  onJoinSuccess?: (payload: JoinClassResponse) => void | Promise<void>
}

export default function ClassroomActionDemo({
  role,
  classroomId,
  compact = false,
  onJoinSuccess
}: ClassroomActionDemoProps) {
  const [classCode, setClassCode] = useState('')

  const joinClassMutation = useJoinClass()
  const regenerateInviteCodeMutation = useRegenerateInviteCode()

  const canRegenerate = useMemo(() => {
    return (
      classroomId !== undefined &&
      classroomId !== null &&
      String(classroomId).trim() !== ''
    )
  }, [classroomId])

  const handleJoinClass = async () => {
    const code = classCode.trim()
    if (!code) return

    const payload = await joinClassMutation.mutateAsync({ classCode: code })
    setClassCode('')
    await onJoinSuccess?.(payload)
  }

  const handleRegenerateCode = async () => {
    if (!canRegenerate) return
    await regenerateInviteCodeMutation.mutateAsync(
      classroomId as number | string
    )
  }

  if (role === 'STUDENT') {
    return (
      <div
        className={
          compact
            ? 'rounded-lg border p-3 space-y-2'
            : 'rounded-lg border p-4 space-y-4'
        }
      >
        <div className={compact ? 'space-y-1' : 'space-y-2'}>
          <Label
            htmlFor='class-code-input'
            className={compact ? 'text-xs' : ''}
          >
            Mã lớp học
          </Label>
          <Input
            id='class-code-input'
            value={classCode}
            onChange={e => setClassCode(e.target.value)}
            placeholder='Nhập mã lớp (VD: A4B1F490)'
            disabled={joinClassMutation.isPending}
            className={compact ? 'h-9' : ''}
          />
        </div>

        <Button
          onClick={handleJoinClass}
          disabled={joinClassMutation.isPending || !classCode.trim()}
          size={compact ? 'sm' : 'default'}
          className={compact ? 'w-full' : ''}
        >
          {joinClassMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Đang tham gia...
            </>
          ) : (
            'Tham gia'
          )}
        </Button>

        {joinClassMutation.isSuccess && (
          <p
            className={
              compact ? 'text-xs text-green-600' : 'text-sm text-green-600'
            }
          >
            Tham gia lớp thành công
            {joinClassMutation.data?.className
              ? `: ${joinClassMutation.data.className}`
              : ''}
          </p>
        )}

        {joinClassMutation.error && (
          <p
            className={
              compact ? 'text-xs text-red-600' : 'text-sm text-red-600'
            }
          >
            {joinClassMutation.error.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className='rounded-lg border p-4 space-y-4'>
      <Button
        onClick={handleRegenerateCode}
        disabled={!canRegenerate || regenerateInviteCodeMutation.isPending}
      >
        {regenerateInviteCodeMutation.isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Đang làm mới...
          </>
        ) : (
          'Làm mới mã mời'
        )}
      </Button>

      {!canRegenerate && (
        <p className='text-sm text-amber-600'>
          Thiếu `classroomId`, không thể làm mới mã mời.
        </p>
      )}

      {regenerateInviteCodeMutation.isSuccess && (
        <p className='text-sm text-green-600'>
          Làm mới mã thành công:{' '}
          {regenerateInviteCodeMutation.data?.classCode ||
            regenerateInviteCodeMutation.data?.inviteCode ||
            'Đã cập nhật'}
        </p>
      )}

      {regenerateInviteCodeMutation.error && (
        <p className='text-sm text-red-600'>
          {regenerateInviteCodeMutation.error.message}
        </p>
      )}
    </div>
  )
}
