import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CheckSquare, Calendar, User, CornerDownLeft, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  useCreateGroupTask,
  useGetGroupMemberOptions
} from '../hooks/useBoardHooks'
import { toast } from 'sonner'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc
} from '@/lib/avatar'
import { formatDueDateForSubmit } from '@/utils/boardFormatters'

interface InlineCreateCardFormProps {
  columnId: string
  boardId: string
  onCancel: () => void
}

export default function InlineCreateCardForm({
  columnId,
  boardId,
  onCancel
}: InlineCreateCardFormProps) {
  const groupId = Number((boardId || '').replace(/\D/g, ''))
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<number | undefined>(undefined)
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false)
  const [assigneeKeyword, setAssigneeKeyword] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dueDateInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const { mutateAsync: createTaskMutateAsync, isPending } =
    useCreateGroupTask(groupId)
  const { data: members = [] } = useGetGroupMemberOptions(groupId)

  const activeMembers = members.filter(member => member.isActive !== false)

  const filteredMembers = activeMembers.filter(member => {
    const keyword = assigneeKeyword.trim().toLowerCase()
    if (!keyword) return true
    return (
      member.userName?.toLowerCase().includes(keyword) ||
      member.email?.toLowerCase().includes(keyword)
    )
  })

  const hasAssignedUser = Number.isFinite(assignedTo)
  const selectedAssignee = hasAssignedUser
    ? activeMembers.find(member => member.userId === assignedTo)
    : undefined

  const formattedDueDate = dueDate
    ? new Date(`${dueDate}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : ''

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const clickedInsidePopover = Boolean(
        target.closest('[data-radix-popper-content-wrapper]')
      )

      if (clickedInsidePopover) return

      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (!isPending) {
          onCancel()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPending, onCancel])

  const handleSubmit = async () => {
    if (!title.trim() || isPending || groupId <= 0) return

    try {
      const payload = {
        title: title.trim(),
        description: '',
        taskStatus: 'ToDo' as const,
        priority: 'Medium' as const,
        dueDate: formatDueDateForSubmit(dueDate) ?? null,
        assignedTo:
          assignedTo === undefined || assignedTo === null || assignedTo === 0
            ? null
            : Number(assignedTo)
      }

      await createTaskMutateAsync(payload)

      onCancel()
    } catch (error) {
      toast.error('Không thể tạo task', {
        description: 'Vui lòng thử lại sau.'
      })
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      if (isAssigneePopoverOpen) {
        setIsAssigneePopoverOpen(false)
        return
      }
      onCancel()
    }
  }

  const handleOpenDatePicker = () => {
    if (isPending) return

    const input = dueDateInputRef.current
    if (!input) return

    textareaRef.current?.blur()
    input.focus({ preventScroll: true })

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.focus()
    input.click()
  }

  return (
    <div ref={formRef} className='p-2'>
      {/* Form Container with Blue Border (JIRA Style) */}
      <div className='border-2 border-blue-500 rounded-md bg-white shadow-sm'>
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='What needs to be done?'
          disabled={isPending}
          rows={2}
          className='border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-sm'
        />

        {/* Toolbar */}
        <div className='flex items-center justify-between px-3 py-2 border-t border-slate-200'>
          {/* Left Side - Action Buttons */}
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-slate-500 hover:text-slate-700'
              disabled={isPending}
            >
              <CheckSquare className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              className='h-7 px-2 text-slate-500 hover:text-slate-700 gap-1.5'
              disabled={isPending}
              onClick={handleOpenDatePicker}
              title={dueDate ? `Due date: ${dueDate}` : 'Set due date'}
            >
              <Calendar className='h-4 w-4' />
              {formattedDueDate && (
                <span className='text-xs font-medium'>{formattedDueDate}</span>
              )}
            </Button>

            <input
              ref={dueDateInputRef}
              type='date'
              value={dueDate}
              onChange={event => {
                setDueDate(event.target.value)
                textareaRef.current?.focus()
              }}
              onKeyDown={event => {
                event.stopPropagation()
              }}
              className='absolute h-0 w-0 opacity-0 pointer-events-none'
              tabIndex={-1}
              aria-hidden='true'
            />

            {dueDate && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-slate-500 hover:text-slate-700'
                onClick={() => setDueDate('')}
                title='Clear due date'
                disabled={isPending}
              >
                <X className='h-3.5 w-3.5' />
              </Button>
            )}

            <Popover
              open={isAssigneePopoverOpen}
              onOpenChange={setIsAssigneePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-slate-500 hover:text-slate-700'
                  disabled={isPending}
                  title={
                    selectedAssignee
                      ? `Assignee: ${selectedAssignee.userName}`
                      : 'Assign task'
                  }
                >
                  {selectedAssignee ? (
                    <Avatar className='h-5.5 w-5.5'>
                      <AvatarImage
                        src={getAvatarSrc(selectedAssignee.avatarUrl)}
                        alt={selectedAssignee.userName}
                      />
                      <AvatarFallback
                        className={`${getAvatarColorClass(selectedAssignee.userName)} text-[9px] text-white font-medium`}
                      >
                        {getAvatarFallback(selectedAssignee.userName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className='h-4 w-4' />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-72 p-0'
                align='start'
                onOpenAutoFocus={event => event.preventDefault()}
              >
                <Command>
                  <CommandInput
                    placeholder='Tìm thành viên...'
                    value={assigneeKeyword}
                    onValueChange={setAssigneeKeyword}
                  />
                  <CommandList>
                    <CommandEmpty>Không có thành viên phù hợp.</CommandEmpty>
                    <CommandGroup>
                      {filteredMembers.map(member => (
                        <CommandItem
                          key={member.userId}
                          value={`${member.userName}-${member.email || ''}`}
                          onSelect={() => {
                            setAssignedTo(member.userId)
                            setAssigneeKeyword('')
                            setIsAssigneePopoverOpen(false)
                          }}
                          className='gap-2 py-2'
                        >
                          <Avatar className='h-7 w-7'>
                            <AvatarImage
                              src={getAvatarSrc(member.avatarUrl)}
                              alt={member.userName}
                            />
                            <AvatarFallback
                              className={`${getAvatarColorClass(member.userName)} text-[10px] text-white font-medium`}
                            >
                              {getAvatarFallback(member.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-medium'>
                              {member.userName}
                            </p>
                            {member.email && (
                              <p className='truncate text-xs text-slate-500'>
                                {member.email}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedAssignee && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-slate-500 hover:text-slate-700'
                onClick={() => setAssignedTo(undefined)}
                title='Clear assignee'
                disabled={isPending}
              >
                <X className='h-3.5 w-3.5' />
              </Button>
            )}
          </div>

          {/* Right Side - Submit & Cancel */}
          <div className='flex items-center'>
            <Button
              size='icon'
              onClick={handleSubmit}
              disabled={!title.trim() || isPending || groupId <= 0}
              className='h-7 w-7 bg-blue-600 hover:bg-blue-700'
            >
              <CornerDownLeft className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
