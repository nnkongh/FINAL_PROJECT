import { useRef, useState, useMemo } from 'react'
import { Image as ImageIcon, Loader2, MessageSquare, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc,
  getStoredAvatarUrl
} from '@/lib/avatar'
import { getCurrentUserFromToken } from '@/lib/token'
import { useUserProfile } from '@/modules/user/hook/user.hook'
import { toast } from 'sonner'
import { useBoardStore } from '@/modules/boards/stores/useBoardStore'
import type { TaskCommentDto } from '../api/comment.api'
import { useGetTaskComments, useTaskComments } from '../hooks/useTaskComments'
import CommentItem from './CommentItem'

interface TaskCommentSectionProps {
  taskId: number
}

type ReplyingTarget = {
  id: number
  name: string
}

// Mini inline composer (dùng cho cả new comment lẫn reply)
function CommentComposer({
  currentUser,
  placeholder = 'Viết bình luận...',
  isSubmitting,
  onSubmit,
  onCancel,
  showCancel = false,
  autoFocus = false
}: {
  currentUser: {
    displayName: string
    avatarUrl?: string | null
  }
  placeholder?: string
  isSubmitting: boolean
  onSubmit: (text: string, file: File | null) => Promise<void>
  onCancel?: () => void
  showCancel?: boolean
  autoFocus?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const displayName = currentUser.displayName
  const avatarUrl = currentUser.avatarUrl || null

  const handleSubmit = async () => {
    if (!text.trim() && !file) return
    await onSubmit(text, file)
    setText('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className='flex gap-2.5 items-start'>
      <Avatar className='h-7 w-7 shrink-0 mt-0.5'>
        <AvatarImage src={getAvatarSrc(avatarUrl)} alt={displayName} />
        <AvatarFallback
          className={`${getAvatarColorClass(displayName)} text-white text-[10px] font-semibold`}
        >
          {getAvatarFallback(displayName)}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
            if (e.key === 'Escape') onCancel?.()
          }}
          className='resize-none text-sm bg-slate-50 border-slate-200 focus:bg-white transition-colors'
        />

        <div className='flex items-center justify-between mt-1.5'>
          <div className='flex items-center gap-1'>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={isSubmitting}
            />
            {/* <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs text-slate-400 hover:text-slate-600'
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              <ImageIcon className='h-3.5 w-3.5 mr-1' />
              Ảnh
            </Button> */}
            {file && (
              <div className='flex items-center gap-1'>
                <span className='text-xs text-slate-400 truncate max-w-28'>
                  {file.name}
                </span>
                <button
                  type='button'
                  className='text-slate-400 hover:text-slate-600'
                  onClick={() => setFile(null)}
                >
                  <X className='h-3 w-3' />
                </button>
              </div>
            )}
          </div>

          <div className='flex items-center gap-1.5'>
            {showCancel && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-6 px-2 text-xs text-slate-500'
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            )}
            <Button
              type='button'
              size='sm'
              className='h-6 px-3 text-xs'
              onClick={handleSubmit}
              disabled={isSubmitting || (!text.trim() && !file)}
            >
              {isSubmitting ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                'Gửi'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TaskCommentSection({
  taskId
}: TaskCommentSectionProps) {
  const currentGroupMembers = useBoardStore(state => state.currentGroupMembers)
  const { data: userProfileResponse } = useUserProfile()
  const profileData = userProfileResponse?.data

  const { data: comments = [], isLoading } = useGetTaskComments(taskId)
  const {
    createCommentWithImage,
    updateComment,
    deleteComment,
    isCreating,
    isUploadingImage,
    isUpdating,
    isDeleting
  } = useTaskComments(taskId)

  const [replyingTo, setReplyingTo] = useState<ReplyingTarget | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const tokenUser = getCurrentUserFromToken()
  const composerUser = {
    displayName:
      profileData?.fullName ||
      profileData?.name ||
      profileData?.userName ||
      tokenUser.fullName ||
      tokenUser.email ||
      tokenUser.studentId ||
      'User',
    avatarUrl:
      profileData?.avatarUrl ||
      profileData?.avatar ||
      getStoredAvatarUrl() ||
      tokenUser.avatarUrl ||
      ''
  }
  const isSubmitting = isCreating || isUploadingImage

  const activeMemberIds = useMemo(() => {
    return new Set(
      currentGroupMembers
        .flatMap(member => [Number(member.userId), Number(member.id)])
        .filter(value => Number.isFinite(value) && value > 0)
    )
  }, [currentGroupMembers])

  const rootComments = useMemo(() => {
    const replyIds = new Set(
      comments.flatMap(c => ((c as any).replies || []).map((r: any) => r.id))
    )
    return comments.filter(c => !replyIds.has(c.id))
  }, [comments])

  const getCommentReplies = (comment: TaskCommentDto) => {
    return Array.isArray(comment.replies) ? comment.replies : []
  }

  const isCommentOwner = (comment: TaskCommentDto) => {
    const userId = Number(tokenUser?.id)
    const commentUserId = Number(
      (comment as any)?.userId ?? (comment as any)?.user?.id
    )
    return Number.isFinite(userId) && userId === commentUserId
  }

  const handleNewComment = async (text: string, file: File | null) => {
    await createCommentWithImage({ text, file, parentCommentId: undefined })
  }

  const handleReplySubmit = async (text: string, file: File | null) => {
    if (!replyingTo) return
    await createCommentWithImage({ text, file, parentCommentId: replyingTo.id })
    setReplyingTo(null)
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!editingContent.trim()) return

    try {
      await updateComment({ commentId, content: editingContent })
      setEditingCommentId(null)
      setEditingContent('')
      toast.success('Đã cập nhật bình luận')
    } catch (error: any) {
      console.error('Update comment failed', error)
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Không thể cập nhật bình luận'
      )
    }
  }

  const handleReply = (comment: TaskCommentDto) => {
    const isAuthorActive = isCommentAuthorActive(comment)
    if (!isAuthorActive) {
      toast.info('Không thể trả lời thành viên đã rời nhóm')
      return
    }

    const name =
      comment.userName?.trim() ||
      (comment as any)?.user?.name?.trim() ||
      'User ẩn danh'
    setReplyingTo({ id: comment.id, name })
  }

  function isCommentAuthorActive(comment: TaskCommentDto) {
    if ((comment as any)?.isTeacher === true) return true

    const candidates = [
      (comment as any)?.isActive,
      (comment as any)?.userIsActive,
      (comment as any)?.user?.isActive
    ]
    const resolved = candidates.find(value => typeof value === 'boolean')
    if (typeof resolved === 'boolean') return resolved

    const rawAuthorId = Number(
      (comment as any)?.userId ?? (comment as any)?.user?.id
    )

    if (!Number.isFinite(rawAuthorId) || rawAuthorId <= 0) return true

    if (activeMemberIds.size === 0) return true

    return activeMemberIds.has(rawAuthorId)
  }

  const getCommentDisplayName = (comment: TaskCommentDto) => {
    return (
      comment.userName?.trim() ||
      (comment as any)?.user?.name?.trim() ||
      'User ẩn danh'
    )
  }

  const getCommentAvatarUrl = (comment: TaskCommentDto) => {
    return comment.userAvatarUrl || (comment as any)?.user?.avatarUrl || null
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId)
      toast.success('Đã xóa bình luận')
    } catch (error: any) {
      console.error('Delete comment failed', error)
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Không thể xóa bình luận'
      )
    }
  }

  const renderEditBlock = (comment: TaskCommentDto, isReply = false) => {
    const displayName = getCommentDisplayName(comment)
    const avatarUrl = getCommentAvatarUrl(comment)

    return (
      <div className='flex gap-2 items-start'>
        <Avatar
          className={`${isReply ? 'h-6 w-6' : 'h-7 w-7'} shrink-0 mt-0.5`}
        >
          <AvatarImage src={getAvatarSrc(avatarUrl)} alt={displayName} />
          <AvatarFallback
            className={`${getAvatarColorClass(displayName)} text-white ${isReply ? 'text-[9px]' : 'text-[10px]'} font-semibold`}
          >
            {getAvatarFallback(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <Textarea
            value={editingContent}
            onChange={event => setEditingContent(event.target.value)}
            rows={2}
            autoFocus
            disabled={isUpdating}
            className='resize-none text-sm'
          />
          <div className='mt-1.5 flex justify-end gap-1.5'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-xs'
              onClick={() => setEditingCommentId(null)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              type='button'
              size='sm'
              className='h-6 px-3 text-xs'
              onClick={() => handleSaveEdit(comment.id)}
              disabled={isUpdating || !editingContent.trim()}
            >
              {isUpdating ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                'Lưu'
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderReplyComposer = (comment: TaskCommentDto, depth: number) => {
    if (replyingTo?.id !== comment.id) {
      return null
    }

    return (
      <div className='relative mt-2 ml-9 pl-4'>
        <span className='pointer-events-none absolute left-0 top-0 bottom-2 w-px bg-slate-300' />
        <span className='pointer-events-none absolute left-0 top-5 h-px w-3 bg-slate-300' />

        <div className='mb-1.5 flex items-center gap-1 text-xs text-slate-500'>
          <MessageSquare className='h-3 w-3' />
          <span>Trả lời {replyingTo.name}</span>
        </div>
        <CommentComposer
          currentUser={composerUser}
          placeholder={`Trả lời ${replyingTo.name}...`}
          isSubmitting={isSubmitting}
          onSubmit={handleReplySubmit}
          onCancel={() => setReplyingTo(null)}
          showCancel
          autoFocus
        />
      </div>
    )
  }

  const renderCommentNode = (
    comment: TaskCommentDto,
    depth = 0
  ): JSX.Element => {
    const replies = getCommentReplies(comment)
    const isReply = depth > 0
    const isAuthorActive = isCommentAuthorActive(comment)

    return (
      <div key={comment.id} className={isReply ? '' : 'px-4 pt-3 pb-2'}>
        {editingCommentId === comment.id ? (
          renderEditBlock(comment, isReply)
        ) : (
          <CommentItem
            comment={comment}
            canEdit={isCommentOwner(comment)}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isLast
            isReply={isReply}
            isAuthorActive={isAuthorActive}
            canReply={isAuthorActive}
            onStartEdit={() => {
              setEditingCommentId(comment.id)
              setEditingContent(comment.content)
            }}
            onDelete={() => handleDeleteComment(comment.id)}
            onReply={() => handleReply(comment)}
          />
        )}

        {replies.length > 0 && (
          <div className='mt-2 ml-9 pl-4 space-y-2'>
            {replies.map((child, index) => {
              const isLastChild = index === replies.length - 1

              return (
                <div key={child.id} className='relative'>
                  <span
                    className='pointer-events-none absolute -left-4 top-0 w-px bg-slate-300'
                    style={{
                      bottom: isLastChild ? 'calc(100% - 20px)' : '0'
                    }}
                  />
                  <span className='pointer-events-none absolute -left-4 top-5 h-px w-3 bg-slate-300' />
                  {renderCommentNode(child, depth + 1)}
                </div>
              )
            })}
          </div>
        )}

        {renderReplyComposer(comment, depth)}
      </div>
    )
  }

  return (
    <div className='rounded-lg border border-slate-200 bg-white overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-2.5 border-b border-slate-100 flex items-center gap-2'>
        <MessageSquare className='h-3.5 w-3.5 text-slate-400' />
        <span className='text-sm font-medium text-slate-700'>Bình luận</span>
        {comments.length > 0 && (
          <span className='ml-auto text-xs text-slate-400'>
            {comments.length} bình luận
          </span>
        )}
      </div>

      {/* Comment list */}
      <div className='divide-y divide-slate-100'>
        {isLoading ? (
          <div className='px-4 py-6 text-center text-sm text-slate-400'>
            Đang tải bình luận...
          </div>
        ) : rootComments.length === 0 ? (
          <div className='px-4 py-4 text-center text-sm text-slate-400'>
            Chưa có bình luận nào.
          </div>
        ) : (
          rootComments.map(rootComment => renderCommentNode(rootComment))
        )}
      </div>

      {/* New comment composer — luôn ở dưới cùng */}
      <div className='px-4 py-3 border-t border-slate-100'>
        <CommentComposer
          currentUser={composerUser}
          isSubmitting={isSubmitting}
          onSubmit={handleNewComment}
        />
      </div>
    </div>
  )
}
