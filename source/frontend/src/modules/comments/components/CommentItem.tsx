import { useMemo } from 'react'
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc
} from '@/lib/avatar'
import { formatDateTimeVi } from '@/lib/dayjs'
import type { TaskCommentDto } from '../api/comment.api'

const URL_REGEX = /(https?:\/\/[^\s]+)/gi
const SINGLE_URL_REGEX = /^https?:\/\/[^\s]+$/i

interface ParsedCommentContent {
  text: string
  images: string[]
}

const parseCommentContent = (content: string): ParsedCommentContent => {
  const imagePattern = /!\[[^\]]*\]\(([^)]+)\)/g
  const images: string[] = []
  let match: RegExpExecArray | null = imagePattern.exec(content)

  while (match) {
    if (match[1]) {
      images.push(match[1])
    }
    match = imagePattern.exec(content)
  }

  const text = content.replace(imagePattern, '').trim()
  return { text, images }
}

const formatDateTime = (value?: string) => {
  return formatDateTimeVi(value)
}

const renderTextWithLinks = (content: string) => {
  const lines = content.split('\n')

  return lines.map((line, lineIndex) => {
    const segments = line.split(URL_REGEX)

    return (
      <span key={`line-${lineIndex}`}>
        {segments.map((segment, segmentIndex) => {
          if (SINGLE_URL_REGEX.test(segment)) {
            return (
              <a
                key={`segment-${lineIndex}-${segmentIndex}`}
                href={segment}
                target='_blank'
                rel='noopener noreferrer'
                className='break-all text-blue-600 underline hover:text-blue-700'
              >
                {segment}
              </a>
            )
          }

          return (
            <span key={`segment-${lineIndex}-${segmentIndex}`}>{segment}</span>
          )
        })}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </span>
    )
  })
}

interface CommentItemProps {
  comment: TaskCommentDto
  canEdit: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLast: boolean
  isReply?: boolean
  isAuthorActive?: boolean
  canReply?: boolean
  onStartEdit: () => void
  onDelete: () => void
  onReply: () => void
}

export default function CommentItem({
  comment,
  canEdit,
  isUpdating,
  isDeleting,
  isLast,
  isReply = false,
  isAuthorActive = true,
  canReply = true,
  onStartEdit,
  onDelete,
  onReply
}: CommentItemProps) {
  const { text, images } = useMemo(
    () => parseCommentContent(comment.content || ''),
    [comment.content]
  )

  const displayName =
    comment.userName?.trim() ||
    (comment as any)?.user?.name?.trim() ||
    'User ẩn danh'

  const displayAvatarUrl =
    comment.userAvatarUrl || (comment as any)?.user?.avatarUrl || null

  return (
    <div
      className={`px-4 py-3 ${isReply ? 'rounded-md border border-slate-200 bg-slate-50' : 'bg-white'} ${!isLast ? 'border-b border-slate-100' : ''}`}
    >
      <div className='flex items-start gap-2.5'>
        <Avatar
          className={`mt-0.5 h-7 w-7 shrink-0 ${!isAuthorActive ? 'opacity-50 grayscale' : ''}`}
        >
          <AvatarImage src={getAvatarSrc(displayAvatarUrl)} alt={displayName} />
          <AvatarFallback
            className={`${getAvatarColorClass(displayName)} text-[10px] font-semibold text-white ${!isAuthorActive ? 'opacity-50 grayscale' : ''}`}
          >
            {getAvatarFallback(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-2'>
            <div className='min-w-0 flex items-center gap-2 overflow-hidden'>
              <span className='truncate whitespace-nowrap text-sm font-medium text-slate-900'>
                {displayName}
              </span>
              {!isAuthorActive && (
                <span className='shrink-0 whitespace-nowrap text-[11px] text-slate-400'>
                  (Đã rời nhóm)
                </span>
              )}
              <span className='shrink-0 whitespace-nowrap text-[11px] text-slate-400'>
                {formatDateTime(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className='shrink-0 whitespace-nowrap text-[11px] text-slate-400'>
                  (đã chỉnh sửa)
                </span>
              )}
            </div>

            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 shrink-0'
                  >
                    <MoreHorizontal className='h-3.5 w-3.5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onSelect={event => {
                      event.preventDefault()
                      onStartEdit()
                    }}
                    disabled={isUpdating}
                  >
                    <Pencil className='mr-2 h-3.5 w-3.5' />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={event => {
                      event.preventDefault()
                      onDelete()
                    }}
                    disabled={isDeleting}
                    className='text-red-600 focus:text-red-600'
                  >
                    <Trash2 className='mr-2 h-3.5 w-3.5' />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {(text || images.length > 0) && (
            <div className='mt-1 space-y-2'>
              {text && (
                <p className='text-sm leading-relaxed text-slate-800'>
                  {renderTextWithLinks(text)}
                </p>
              )}
              {images.length > 0 && (
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {images.map((imageUrl, index) => (
                    <img
                      key={`${comment.id}-${index}`}
                      src={imageUrl}
                      alt={`comment-image-${index + 1}`}
                      className='max-h-48 w-full rounded-md border border-slate-200 object-cover'
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className='mt-2'>
            <button
              type='button'
              className={`flex items-center gap-1 text-xs transition-colors ${
                canReply
                  ? 'text-slate-400 hover:text-blue-600'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              onClick={canReply ? onReply : undefined}
              disabled={!canReply}
              title={
                canReply
                  ? 'Trả lời'
                  : 'Không thể trả lời thành viên đã rời nhóm'
              }
            >
              <MessageSquare className='h-3 w-3' />
              Trả lời
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
