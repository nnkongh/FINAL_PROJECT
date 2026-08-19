import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Card as CardType } from '../types/board'
import CardDetailSheet from './CardDetailSheet'
import CardPriorityDropdown from './CardPriorityDropdown'
import CardAssigneePopover from './CardAssigneePopover'
import { useBoardStore } from '../stores/useBoardStore'
import {
  useCardDnD,
  useCardSyncURL,
  useCardAssignee
} from '../hooks/useBoardHooks'
import { formatIssueKey } from '~/utils/formatters'
import { formatDueDateForCard } from '@/utils/boardFormatters'
import { type PriorityLevel } from '~/utils/priority'

interface CardProps {
  card: CardType
}

function TrelloCard({ card }: CardProps) {
  const [isAssignPopoverOpen, setIsAssignPopoverOpen] = useState(false)
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false)
  const { updateCard } = useBoardStore()

  const taskId = useMemo(() => {
    const id = Number(String(card._id || '').replace(/\D/g, ''))
    return Number.isFinite(id) && id > 0 ? id : 0
  }, [card._id])

  const groupId = useMemo(() => {
    const id = Number(String(card.boardId || '').replace(/\D/g, ''))
    return Number.isFinite(id) && id > 0 ? id : 0
  }, [card.boardId])

  const { isDetailOpen, openDetail, closeDetail } = useCardSyncURL(taskId)
  const { attributes, listeners, setNodeRef, isDragging, dndKitCardStyles } =
    useCardDnD(card)

  const {
    assignedUser,
    currentGroupMembers,
    handleAssignToMe,
    handleAssignToUser,
    handleUnassign
  } = useCardAssignee({ card, taskId, groupId })

  const getDueDateMeta = (dateString?: string) => {
    const formatted = formatDueDateForCard(dateString)
    if (!formatted || !dateString) return null

    const parsedDate = new Date(dateString)
    const now = new Date()
    const isOverdue = parsedDate.getTime() < now.getTime()

    return {
      formatted,
      isOverdue
    }
  }

  const handlePriorityChange = (
    priority: PriorityLevel,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    updateCard(card._id, { priority })
    setIsPriorityDropdownOpen(false)
  }

  if (card?.FE_PlaceholderCard) {
    return (
      <div
        ref={setNodeRef}
        style={{ display: 'none' }}
        {...attributes}
        {...listeners}
      />
    )
  }

  const dueDate = getDueDateMeta(card?.dueDate)

  const handleCardClick = () => {
    if (isDragging) return
    openDetail()
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={dndKitCardStyles}
        {...attributes}
        {...listeners}
        onClick={handleCardClick}
        className='cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-white min-w-0'
      >
        <CardContent className='p-3 space-y-2 min-w-0'>
          {/* Title */}
          <h4 className='text-sm font-medium text-slate-900 line-clamp-2 wrap-break-word'>
            {card?.title || 'Untitled'}
          </h4>

          {/* Metadata Row */}
          <div className='flex items-center gap-2 flex-wrap'>
            {/* Issue Key Badge */}
            <Badge
              variant='outline'
              className='text-xs font-mono text-blue-600 border-blue-200'
            >
              {formatIssueKey(card._id, card.issueKey)}
            </Badge>

            {/* Quick Priority Dropdown */}
            {card?.priority && (
              <CardPriorityDropdown
                priority={card.priority}
                open={isPriorityDropdownOpen}
                onOpenChange={setIsPriorityDropdownOpen}
                onPriorityChange={handlePriorityChange}
              />
            )}

            {/* Due Date */}
            {dueDate && (
              <Badge
                variant='outline'
                className={`text-xs ${dueDate.isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700'}`}
              >
                <Clock className='h-3 w-3 mr-1' />
                {dueDate.formatted}
              </Badge>
            )}
          </div>

          {/* Bottom Row - Quick Actions & Stats */}
          <div className='flex items-center justify-between pt-1'>
            {/* Task Stats */}
            <div className='flex items-center gap-3 text-xs text-slate-500'>
              {(card?.comments?.length || 0) > 0 && (
                <span className='flex items-center gap-1 hover:text-slate-700'>
                  💬 {card.comments?.length}
                </span>
              )}
              {(card?.attachments?.length || 0) > 0 && (
                <span className='flex items-center gap-1 hover:text-slate-700'>
                  📎 {card.attachments?.length}
                </span>
              )}
            </div>

            {/* Quick Assign Popover */}
            <CardAssigneePopover
              open={isAssignPopoverOpen}
              onOpenChange={setIsAssignPopoverOpen}
              assignedUser={assignedUser}
              currentGroupMembers={currentGroupMembers}
              assignedTo={card.assignedTo}
              onUnassign={event =>
                handleUnassign(event, () => setIsAssignPopoverOpen(false))
              }
              onAssignToMe={event =>
                handleAssignToMe(event, () => setIsAssignPopoverOpen(false))
              }
              onAssignToUser={(assignedUserId, event) =>
                handleAssignToUser(assignedUserId, event, () =>
                  setIsAssignPopoverOpen(false)
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      <CardDetailSheet
        card={card}
        isOpen={isDetailOpen}
        onClose={closeDetail}
      />
    </>
  )
}

export default TrelloCard
