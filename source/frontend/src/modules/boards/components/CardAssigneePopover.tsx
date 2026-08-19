import { useMemo, type MouseEvent } from 'react'
import { User, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import type { GroupMember } from '../types/board'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc
} from '@/lib/avatar'

interface CardAssigneePopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignedUser: GroupMember | undefined
  currentGroupMembers: GroupMember[]
  assignedTo: number | null | undefined
  onAssignToMe: (event: MouseEvent) => void | Promise<void>
  onUnassign: (event: MouseEvent) => void | Promise<void>
  onAssignToUser: (
    assignedUserId: number,
    event: MouseEvent
  ) => void | Promise<void>
}

export default function CardAssigneePopover({
  open,
  onOpenChange,
  assignedUser,
  currentGroupMembers,
  assignedTo,
  onAssignToMe,
  onUnassign,
  onAssignToUser
}: CardAssigneePopoverProps) {
  const activeMembers = useMemo(
    () => currentGroupMembers.filter(member => member.isActive !== false),
    [currentGroupMembers]
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {assignedUser ? (
          <button
            className='flex items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-slate-300 outline-none'
            onClick={event => event.stopPropagation()}
            onPointerDown={event => event.stopPropagation()}
            title={`Assignee: ${assignedUser.userName}`}
          >
            <Avatar className='h-6 w-6'>
              <AvatarImage
                src={getAvatarSrc(assignedUser.avatarUrl)}
                alt={assignedUser.userName}
              />
              <AvatarFallback
                className={`${getAvatarColorClass(assignedUser.userName)} text-[10px] text-white font-medium`}
              >
                {getAvatarFallback(assignedUser.userName)}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button
            className='flex items-center justify-center h-6 w-6 rounded-full border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors'
            onClick={event => event.stopPropagation()}
            onPointerDown={event => event.stopPropagation()}
            title='Unassigned'
          >
            <User className='h-3.5 w-3.5' />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className='p-2 w-64'
        align='end'
        onClick={event => event.stopPropagation()}
        onPointerDown={event => event.stopPropagation()}
      >
        <div className='space-y-1'>
          <div className='px-2 py-1.5 text-xs font-semibold text-slate-700'>
            Assign to
          </div>

          <button
            className='w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-100 rounded transition-colors text-left'
            onClick={onUnassign}
          >
            <div className='h-6 w-6 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center'>
              <User className='h-3 w-3 text-slate-400' />
            </div>
            <span className='text-slate-600'>Unassigned</span>
          </button>

          <button
            className='w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-blue-50 rounded transition-colors text-left'
            onClick={onAssignToMe}
          >
            <div className='h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center'>
              <CheckCircle2 className='h-3.5 w-3.5 text-white' />
            </div>
            <span className='text-blue-600 font-medium'>Assign to me</span>
          </button>

          <div className='h-px bg-slate-200 my-1' />

          <div className='max-h-48 overflow-y-auto space-y-0.5'>
            {activeMembers.map(member => (
              <button
                key={member.id}
                className='w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-100 rounded transition-colors text-left'
                onClick={event =>
                  onAssignToUser(member.userId ?? member.id, event)
                }
              >
                <Avatar className='h-6 w-6'>
                  <AvatarImage
                    src={getAvatarSrc(member.avatarUrl)}
                    alt={member.userName}
                  />
                  <AvatarFallback
                    className={`${getAvatarColorClass(member.userName)} text-xs text-white font-medium`}
                  >
                    {getAvatarFallback(member.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm text-slate-900 truncate'>
                    {member.userName}
                  </div>
                  <div className='text-xs text-slate-500 truncate'>
                    {member.userCode}
                  </div>
                </div>
                {(assignedTo === member.id || assignedTo === member.userId) && (
                  <CheckCircle2 className='h-4 w-4 text-blue-600 shrink-0' />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
