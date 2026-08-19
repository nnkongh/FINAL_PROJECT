import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useBoardStore } from '../stores/useBoardStore'
import type { Card } from '../types/board'
import { useDeleteTask, useUpdateTask } from '../hooks/useBoardHooks'
import { useTaskDetail } from '../hooks/useTaskDetail'
import TaskCommentSection from '@/modules/comments/components/TaskCommentSection'
import TaskHistoryModal from '@/modules/tasks/components/TaskHistoryModal'
import { getPriorityConfig, PRIORITY_OPTIONS } from '~/utils/priority'
import { toast } from 'sonner'
import { formatDueDateForSubmit } from '@/utils/boardFormatters'
import AIAssistant from '@/modules/chatbot/components/AIAssistant'
import SubtaskPreview from '@/modules/chatbot/components/SubtaskPreview'
import {
  extractEstimate,
  parseSubtasks
} from '@/modules/chatbot/hooks/useChatbot'
import type { AIActionType } from '@/modules/chatbot/api/chatbotApi'
import type { ChatbotResult } from '@/modules/chatbot/hooks/useChatbot'
import ReactMarkdown from 'react-markdown'
import {
  Trash2,
  User,
  Calendar,
  Flag,
  Loader2,
  MessageSquare,
  Paperclip,
  ListTodo,
  History,
  X
} from 'lucide-react'

interface CardDetailSheetProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

interface EditTaskFormState {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
}

export default function CardDetailSheet({
  card,
  isOpen,
  onClose
}: CardDetailSheetProps) {
  const { updateCard, deleteCard, board, currentGroupMembers } = useBoardStore()

  const taskId = useMemo(() => {
    const id = Number(String(card?._id || '').replace(/\D/g, ''))
    return Number.isFinite(id) && id > 0 ? id : 0
  }, [card?._id])

  const groupId = useMemo(() => {
    const id = Number(String(card?.boardId || '').replace(/\D/g, ''))
    return Number.isFinite(id) && id > 0 ? id : 0
  }, [card?.boardId])

  const { taskDetail, setTaskDetail } = useTaskDetail({ card, isOpen, taskId })

  const { mutateAsync: updateTaskMutateAsync, isPending: isUpdatingTask } =
    useUpdateTask(groupId)
  const { mutateAsync: deleteTaskMutateAsync } = useDeleteTask(groupId)

  const activeGroupMembers = useMemo(
    () => currentGroupMembers.filter(member => member.isActive !== false),
    [currentGroupMembers]
  )

  const [editForm, setEditForm] = useState<EditTaskFormState>({
    title: '',
    description: '',
    priority: 'medium',
    assignee: 'unassigned',
    dueDate: ''
  })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [aiSubtasks, setAiSubtasks] = useState<string[]>([])
  const [isEstimateOpen, setIsEstimateOpen] = useState(false)
  const [estimateText, setEstimateText] = useState('')
  const [estimateSummary, setEstimateSummary] = useState('')
  const [estimateDays, setEstimateDays] = useState<number | null>(null)

  const toInputDate = (dateValue?: string) => {
    if (!dateValue) return ''
    const parsedDate = new Date(dateValue)
    if (Number.isNaN(parsedDate.getTime())) {
      return ''
    }

    const year = parsedDate.getFullYear()
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
    const day = String(parsedDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const mapPriorityToApi = (
    value: 'low' | 'medium' | 'high'
  ): 'Low' | 'Medium' | 'High' => {
    if (value === 'high') return 'High'
    if (value === 'low') return 'Low'
    return 'Medium'
  }

  const mapColumnTitleToTaskStatus = (
    value?: string
  ): 'ToDo' | 'InProgress' | 'Test' | 'Done' => {
    const normalized = (value || '').replace(/\s+/g, '').toLowerCase()

    if (normalized === 'done') return 'Done'
    if (normalized === 'test' || normalized === 'testing') return 'Test'
    if (normalized === 'inprogress' || normalized === 'in_progress') {
      return 'InProgress'
    }

    return 'ToDo'
  }

  useEffect(() => {
    if (!taskDetail) return

    const matchedMember = activeGroupMembers.find(
      member =>
        member.id === taskDetail.assignedTo ||
        member.userId === taskDetail.assignedTo
    )

    setEditForm({
      title: taskDetail.title || '',
      description: taskDetail.description || '',
      priority: taskDetail.priority || 'medium',
      assignee: matchedMember ? String(matchedMember.id) : 'unassigned',
      dueDate: toInputDate(taskDetail.dueDate)
    })
  }, [taskDetail, activeGroupMembers])

  if (!card || !taskDetail || !board) return null

  const column = board.columns.find(col => col._id === card.columnId)

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Not set'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    setEditForm(prev => ({
      ...prev,
      title: prev.title.trim() || taskDetail.title || ''
    }))
  }

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleBlur()
    }
    if (e.key === 'Escape') {
      setEditForm(prev => ({ ...prev, title: taskDetail.title || '' }))
      setIsEditingTitle(false)
    }
  }

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false)
  }

  const handlePriorityChange = (newPriority: string) => {
    setEditForm(prev => ({
      ...prev,
      priority: newPriority as 'low' | 'medium' | 'high'
    }))
  }

  const handleAssigneeChange = (newAssigneeValue: string) => {
    setEditForm(prev => ({ ...prev, assignee: newAssigneeValue }))
  }

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, dueDate: e.target.value }))
  }

  const handleUpdateTask = async () => {
    if (taskId <= 0 || groupId <= 0) {
      console.error('Invalid task id/group id for update task API')
      return
    }

    const normalizedAssignedTo =
      editForm.assignee === 'unassigned' ||
      editForm.assignee === '' ||
      editForm.assignee === undefined ||
      editForm.assignee === null
        ? null
        : Number(editForm.assignee)

    const payload = {
      title: editForm.title.trim() || taskDetail.title || '',
      description: editForm.description || '',
      priority: mapPriorityToApi(editForm.priority),
      taskStatus: mapColumnTitleToTaskStatus(column?.title),
      assignedTo:
        normalizedAssignedTo === null || !Number.isFinite(normalizedAssignedTo)
          ? null
          : Number(normalizedAssignedTo),
      dueDate: formatDueDateForSubmit(editForm.dueDate) ?? null
    }

    try {
      await updateTaskMutateAsync({ taskId, body: payload })

      const selectedMember = activeGroupMembers.find(
        member => String(member.id) === editForm.assignee
      )

      updateCard(card._id, {
        title: payload.title,
        description: payload.description,
        priority: editForm.priority,
        assignedTo:
          editForm.assignee === 'unassigned'
            ? null
            : (selectedMember?.userId ??
              selectedMember?.id ??
              (Number.isFinite(normalizedAssignedTo)
                ? Number(normalizedAssignedTo)
                : null)),
        dueDate: payload.dueDate ?? undefined
      })

      setTaskDetail(prev =>
        prev
          ? {
              ...prev,
              title: payload.title,
              description: payload.description,
              priority: editForm.priority,
              dueDate: payload.dueDate ?? undefined
            }
          : prev
      )

      toast.success('Cập nhật công việc thành công')
      onClose()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const addDaysToDate = (days: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parsePriority = (content: string): 'low' | 'medium' | 'high' => {
    const normalized = content.toLowerCase()

    if (/(high|cao|khẩn|urgent)/.test(normalized)) return 'high'
    if (/(low|thấp|nhẹ)/.test(normalized)) return 'low'

    return 'medium'
  }

  const handleApplySubtasks = (markdown: string) => {
    if (!markdown) return

    setEditForm(prev => ({
      ...prev,
      description: prev.description
        ? `${prev.description}\n${markdown}`
        : markdown
    }))
    setIsEditingDescription(false)
    setAiSubtasks([])
  }

  const handleAIResult = (result: ChatbotResult) => {
    if (!result?.rawText) return

    const content = result.rawText
    const action = result.actionType

    if (action === 'description') {
      setEditForm(prev => ({ ...prev, description: content }))
      setIsEditingDescription(false)
      return
    }

    if (action === 'subtasks') {
      const items = result.subtasks || parseSubtasks(content)
      setAiSubtasks(items)
      return
    }

    if (action === 'estimate') {
      const estimate = result.estimate ?? extractEstimate(content)
      setEstimateText(content)
      setEstimateSummary(estimate?.label || '')
      setEstimateDays(estimate?.days ?? null)
      setIsEstimateOpen(true)
      return
    }

    if (action === 'priority') {
      const priority = result.priority ?? parsePriority(content)
      setEditForm(prev => ({ ...prev, priority }))
    }
  }

  const handleDelete = async () => {
    if (taskId <= 0 || groupId <= 0) {
      console.error('Invalid task id/group id for delete task API')
      return
    }

    try {
      await deleteTaskMutateAsync({ taskId })
      deleteCard(card._id)
      setShowDeleteDialog(false)
      onClose()
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className='w-[95vw] max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-y-auto p-0'>
          {/* Sticky header */}
          <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6 md:py-4'>
            <div className='flex items-center gap-3 flex-1'>
              <ListTodo className='h-5 w-5 text-slate-500' />
              {isEditingTitle ? (
                <Input
                  value={editForm.title}
                  onChange={e =>
                    setEditForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className='text-lg font-semibold border-2 border-blue-500 flex-1'
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className='text-lg font-semibold cursor-pointer hover:bg-slate-100 rounded px-2 py-1 -ml-2 transition-colors flex-1'
                >
                  {editForm.title || 'Untitled'}
                </h2>
              )}

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsHistoryOpen(true)}
                disabled={taskId <= 0}
                className='shrink-0'
              >
                <History className='mr-2 h-4 w-4' />
                Xem lịch sử
              </Button>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-8 w-8 p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='px-4 py-4 md:px-6 md:py-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              {/* Left: main content */}
              <div className='space-y-5 lg:col-span-2'>
                {/* Description */}
                <div>
                  <Label className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block'>
                    Mô tả
                  </Label>
                  <AIAssistant
                    taskTitle={editForm.title || taskDetail.title || ''}
                    taskDescription={editForm.description}
                    onResult={handleAIResult}
                  />
                  {isEditingDescription ? (
                    <Textarea
                      value={editForm.description}
                      onChange={e =>
                        setEditForm(prev => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                      onBlur={handleDescriptionBlur}
                      placeholder='Thêm mô tả chi tiết...'
                      autoFocus
                      rows={6}
                      className='resize-none border-2 border-blue-500'
                    />
                  ) : (
                    <div
                      onClick={() => setIsEditingDescription(true)}
                      className='min-h-20 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors text-sm whitespace-pre-wrap'
                    >
                      {editForm.description ? (
                        <ReactMarkdown className='text-sm text-slate-700 space-y-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_strong]:font-semibold [&_em]:italic'>
                          {editForm.description}
                        </ReactMarkdown>
                      ) : (
                        <span className='text-slate-400'>
                          Thêm mô tả chi tiết...
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {aiSubtasks.length > 0 && (
                  <SubtaskPreview
                    lines={aiSubtasks}
                    onApply={handleApplySubtasks}
                    onClose={() => setAiSubtasks([])}
                  />
                )}

                {/* Activity meta — compact */}
                <div className='flex items-center gap-4 text-xs text-slate-400 py-2 border-t border-slate-100'>
                  {taskDetail.createdAt && (
                    <span>Tạo: {formatDate(taskDetail.createdAt)}</span>
                  )}
                  {taskDetail.updatedAt && (
                    <span>Cập nhật: {formatDate(taskDetail.updatedAt)}</span>
                  )}
                  {/* <span className='flex items-center gap-1'>
                    <MessageSquare className='h-3 w-3' />
                    {card.comments?.length || 0}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Paperclip className='h-3 w-3' />
                    {card.attachments?.length || 0}
                  </span> */}
                </div>

                {/* Comments */}
                {taskId > 0 && <TaskCommentSection taskId={taskId} />}
              </div>

              {/* Right: sidebar */}
              <div className='space-y-5'>
                {/* Status */}
                <div>
                  <Label className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block'>
                    Trạng thái
                  </Label>
                  {column && (
                    <Badge variant='secondary' className='text-xs'>
                      {column.title}
                    </Badge>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <Label className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1'>
                    <Flag className='h-3 w-3' />
                    Ưu tiên
                  </Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className='w-full h-8 text-sm'>
                      <SelectValue>
                        <div className='flex items-center gap-2'>
                          {getPriorityConfig(editForm.priority).icon}
                          <span className='capitalize'>
                            {editForm.priority}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(option => {
                        const config = getPriorityConfig(option.value)
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className='flex items-center gap-2'>
                              {config.icon}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div>
                  <Label className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1'>
                    <User className='h-3 w-3' />
                    Người thực hiện
                  </Label>
                  <Select
                    value={editForm.assignee}
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className='w-full h-8 text-sm'>
                      <SelectValue placeholder='Chưa phân công' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='unassigned'>Chưa phân công</SelectItem>
                      {activeGroupMembers.map(member => (
                        <SelectItem key={member.id} value={String(member.id)}>
                          <div className='flex items-center gap-2 min-w-0'>
                            <span className='truncate'>{member.userName}</span>
                            <span className='text-xs text-slate-400 truncate'>
                              {member.userCode}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reporter */}
                {taskDetail.reporter && (
                  <div>
                    <Label className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1'>
                      <User className='h-3 w-3' />
                      Người báo cáo
                    </Label>
                    <div className='text-sm text-slate-700 px-3 py-2 bg-slate-50 rounded-md border border-slate-200'>
                      {taskDetail.reporter}
                    </div>
                  </div>
                )}

                <div>
                  <Label className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1'>
                    <Paperclip className='h-3 w-3' />
                    PR
                  </Label>
                  <div className='text-sm text-slate-700 px-3 py-2 bg-slate-50 rounded-md border border-slate-200'>
                    {taskDetail.pr?.html_url ? (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <a
                            href={taskDetail.pr?.html_url}
                            target='_blank'
                            rel='noreferrer'
                            className='text-blue-600 hover:text-blue-700 hover:underline break-all font-medium'
                          >
                            {`${taskDetail.pr?.title || 'Pull Request'} #${taskDetail.pr?.number ?? ''}`}
                          </a>
                          <Badge
                            variant='secondary'
                            className={
                              taskDetail.pr?.merged
                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : taskDetail.pr?.state === 'open'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-red-100 text-red-700 border-red-200'
                            }
                          >
                            {taskDetail.pr?.merged
                              ? 'Merged'
                              : taskDetail.pr?.state === 'open'
                                ? 'Open'
                                : 'Closed'}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      'Chưa có PR'
                    )}
                  </div>
                </div>

                {/* Due date */}
                <div>
                  <Label className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    Hạn hoàn thành
                  </Label>
                  <Input
                    type='date'
                    value={editForm.dueDate}
                    onChange={handleDueDateChange}
                    className='h-8 text-sm'
                  />
                </div>

                {/* Actions */}
                <div className='pt-4 border-t border-slate-100 space-y-2'>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={handleUpdateTask}
                    className='w-full h-8 text-sm bg-blue-600 hover:bg-blue-700'
                    disabled={isUpdatingTask}
                  >
                    {isUpdatingTask ? (
                      <>
                        <Loader2 className='h-3.5 w-3.5 mr-2 animate-spin' />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => setShowDeleteDialog(true)}
                    className='w-full h-8 text-sm'
                    disabled={isUpdatingTask}
                  >
                    <Trash2 className='h-3.5 w-3.5 mr-2' />
                    Xóa công việc
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <TaskHistoryModal
        taskId={taskId}
        taskTitle={taskDetail.title}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        groupId={groupId}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc muốn xóa công việc?</AlertDialogTitle>
            <AlertDialogDescription>
              Công việc "{taskDetail.title}" sẽ bị xóa vĩnh viễn và không thể
              khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEstimateOpen} onOpenChange={setIsEstimateOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Kết quả ước tính từ AI</DialogTitle>
            <DialogDescription>
              {estimateSummary
                ? `Tóm tắt: ${estimateSummary}`
                : 'Không trích xuất được thời gian cụ thể.'}
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700'>
            {estimateText}
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsEstimateOpen(false)}
            >
              Đóng
            </Button>
            <Button
              type='button'
              className='bg-purple-600 hover:bg-purple-700'
              onClick={() => {
                if (!estimateDays) return
                setEditForm(prev => ({
                  ...prev,
                  dueDate: addDaysToDate(estimateDays)
                }))
                setIsEstimateOpen(false)
              }}
              disabled={!estimateDays}
            >
              Áp dụng kết quả tóm tắt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
