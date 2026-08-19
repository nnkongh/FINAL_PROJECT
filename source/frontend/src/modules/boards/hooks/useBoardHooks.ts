import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mockData } from '~/apis/mock-data'
import { generatePlaceholderCard } from '~/utils/formatters'
import {
  mapPriorityToCard,
  mapTaskStatusToColumnId
} from '~/utils/boardFormatters'
import { getCurrentUserFromToken, type TokenUserInfo } from '@/lib/token'
import { getGroupMembersAPI } from '@/modules/groups/api/group.api'
import {
  assignTaskAPI,
  createGroupTaskAPI,
  getMyGroupTasksAPI,
  deleteTaskAPI,
  getGroupTasksAPI,
  transitionTaskStatusAPI,
  updateTaskAPI,
  updateTaskDueDateAPI,
  type CreateGroupTaskPayload,
  type TaskTransitionAction,
  type TaskDto
} from '../api/task.api'
import { useBoardStore } from '../stores/useBoardStore'
import type {
  Board as BoardType,
  Card,
  Column,
  GroupMember,
  Card as CardType
} from '../types/board'

interface GroupMembersResponse {
  value?: GroupMemberOption[]
}

export interface GroupMemberOption {
  userId: number
  userName: string
  avatarUrl?: string
  role?: string
  email?: string
  isActive?: boolean
}

type GroupMemberOptionLike = Partial<GroupMemberOption> & {
  id?: number | string
  fullName?: string
  name?: string
  avatar?: string
  isActive?: boolean
}

const normalizeMemberOption = (
  member: GroupMemberOptionLike
): GroupMemberOption | null => {
  const rawUserId = member.userId ?? member.id
  const userId = Number(rawUserId)

  if (!Number.isFinite(userId) || userId <= 0) {
    return null
  }

  const userName =
    member.userName?.trim() ||
    member.fullName?.trim() ||
    member.name?.trim() ||
    member.email?.trim() ||
    `User #${userId}`

  return {
    userId,
    userName,
    avatarUrl: member.avatarUrl || member.avatar,
    role: member.role,
    email: member.email,
    isActive: member.isActive ?? true
  }
}

export const boardTaskKeys = {
  all: ['board-tasks'] as const,
  list: (groupId: number) => [...boardTaskKeys.all, groupId, 'all'] as const,
  myList: (groupId: number) => [...boardTaskKeys.all, groupId, 'my'] as const,
  byFilter: (groupId: number, isMyTasksOnly: boolean) =>
    isMyTasksOnly ? boardTaskKeys.myList(groupId) : boardTaskKeys.list(groupId)
}

export const useGetGroupTasks = (groupId: number) => {
  return useQuery({
    queryKey: boardTaskKeys.list(groupId),
    queryFn: () => getGroupTasksAPI(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0
  })
}

export const useGetBoardTasks = (groupId: number, isMyTasksOnly: boolean) => {
  return useQuery({
    queryKey: boardTaskKeys.byFilter(groupId, isMyTasksOnly),
    queryFn: () =>
      isMyTasksOnly ? getMyGroupTasksAPI(groupId) : getGroupTasksAPI(groupId),
    enabled: Number.isFinite(groupId) && groupId > 0
  })
}

export const useGetGroupMemberOptions = (groupId: number) => {
  return useQuery({
    queryKey: [...boardTaskKeys.list(groupId), 'members'],
    queryFn: async () => {
      const response = (await getGroupMembersAPI(groupId)) as
        | GroupMembersResponse
        | GroupMemberOptionLike[]

      const rawMembers = Array.isArray(response)
        ? response
        : (response?.value ?? [])

      return rawMembers
        .map(member => normalizeMemberOption(member))
        .filter((member): member is GroupMemberOption => member !== null)
    },
    enabled: Number.isFinite(groupId) && groupId > 0
  })
}

export const useCreateGroupTask = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateGroupTaskPayload) =>
      createGroupTaskAPI(groupId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.list(groupId) })
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.myList(groupId) })
      toast.success('Tạo task thành công')
    },
    onError: (error: any) => {
      toast.error('Tạo task thất bại', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  })
}

export const useAssignTask = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      assignedTo
    }: {
      taskId: number
      assignedTo: number | null
    }) => assignTaskAPI(taskId, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.list(groupId) })
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.myList(groupId) })
    },
    onError: (error: any) => {
      toast.error('Cập nhật người phụ trách thất bại', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  })
}

export const useUpdateTaskDueDate = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      dateTime
    }: {
      taskId: number
      dateTime: string | null
    }) => updateTaskDueDateAPI(taskId, dateTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.list(groupId) })
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.myList(groupId) })
    },
    onError: (error: any) => {
      toast.error('Cập nhật hạn hoàn thành thất bại', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  })
}

export const useDeleteTask = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => deleteTaskAPI(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.list(groupId) })
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.myList(groupId) })
      toast.success('Xóa task thành công')
    },
    onError: (error: any) => {
      toast.error('Xóa task thất bại', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  })
}

export const useUpdateTask = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      body
    }: {
      taskId: number
      body: {
        title: string
        description: string
        priority: 'Low' | 'Medium' | 'High'
        taskStatus: 'ToDo' | 'InProgress' | 'Test' | 'Done'
        assignedTo: number | null
        dueDate: string | null
      }
    }) => updateTaskAPI(taskId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.list(groupId) })
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.myList(groupId) })
    },
    onError: (error: any) => {
      toast.error('Cập nhật task thất bại', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  })
}

export const useTransitionTaskStatus = (groupId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      action
    }: {
      taskId: number
      action: TaskTransitionAction
    }) => transitionTaskStatusAPI(taskId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.list(groupId) })
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.myList(groupId) })
    },
    onError: (error: any) => {
      toast.error('Cập nhật trạng thái task thất bại', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  })
}

interface UseBoardRoleParams {
  tokenUser: TokenUserInfo
  currentGroupMembers: GroupMember[]
}

const toValidUserId = (value: unknown): number | null => {
  const normalized = Number(value)
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null
  }

  return normalized
}

export const useBoardRole = ({
  tokenUser,
  currentGroupMembers
}: UseBoardRoleParams): string => {
  return useMemo(() => {
    const currentUserId = toValidUserId(tokenUser.id)
    if (!currentUserId) return 'Member'

    const matchedMember = currentGroupMembers.find(member => {
      const memberUserId = toValidUserId(member.userId ?? member.id)
      return memberUserId === currentUserId
    })

    return matchedMember?.role || 'Member'
  }, [currentGroupMembers, tokenUser.id])
}

const boardData = mockData.board as BoardType

interface UseBoardDataMapperParams {
  groupId: number
  groupName?: string
  groupDescription?: string
  tasks: TaskDto[]
}

export const useBoardDataMapper = ({
  groupId,
  groupName,
  groupDescription,
  tasks
}: UseBoardDataMapperParams): BoardType => {
  return useMemo(() => {
    const safeGroupId = Number.isFinite(groupId) && groupId > 0 ? groupId : 0
    const boardId = `group-${safeGroupId || 'unknown'}`

    const columnSeed: Record<string, Column> = {
      todo: {
        _id: 'todo',
        boardId,
        title: 'To Do',
        cardOrderIds: [],
        cards: []
      },
      inprogress: {
        _id: 'inprogress',
        boardId,
        title: 'In Progress',
        cardOrderIds: [],
        cards: []
      },
      test: {
        _id: 'test',
        boardId,
        title: 'Test',
        cardOrderIds: [],
        cards: []
      },
      complete: {
        _id: 'complete',
        boardId,
        title: 'Complete',
        cardOrderIds: [],
        cards: []
      }
    }

    tasks.forEach(task => {
      const columnId = mapTaskStatusToColumnId(task.status)
      const targetColumn = columnSeed[columnId]
      const cardId = `task-${task.id}`

      const card: Card = {
        _id: cardId,
        boardId,
        columnId,
        title: task.title,
        description: task.description ?? null,
        priority: mapPriorityToCard(task.priority),
        assignedTo:
          typeof task.assignedTo === 'number' ? task.assignedTo : null,
        dueDate: task.dueDate ?? undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }

      targetColumn.cards.push(card)
      targetColumn.cardOrderIds.push(cardId)
    })

    const columns: Column[] = ['todo', 'inprogress', 'test', 'complete'].map(
      key => {
        const column = columnSeed[key]
        if (column.cards.length > 0) {
          return column
        }

        const placeholderCard = generatePlaceholderCard(column)
        return {
          ...column,
          cards: [placeholderCard],
          cardOrderIds: [placeholderCard._id]
        }
      }
    )

    return {
      _id: boardId,
      title: groupName || boardData.title,
      description: groupDescription || boardData.description,
      type: 'private',
      ownerIds: [],
      memberIds: [],
      columnOrderIds: columns.map(column => column._id),
      columns
    }
  }, [groupDescription, groupId, groupName, tasks])
}

export const useCardDnD = (card: CardType) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card._id,
    data: { ...card }
  })

  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '2px solid #10b981' : undefined
  }

  return {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    dndKitCardStyles
  }
}

export const useCardSyncURL = (taskId: number) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const urlTaskId = searchParams.get('taskId')

  useEffect(() => {
    if (urlTaskId && Number(urlTaskId) === taskId) {
      setIsDetailOpen(true)
    }
  }, [urlTaskId, taskId])

  const openDetail = () => {
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setIsDetailOpen(false)

    if (searchParams.has('taskId')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('taskId')
      setSearchParams(nextParams, { replace: true })
    }
  }

  return {
    isDetailOpen,
    openDetail,
    closeDetail
  }
}

interface UseCardAssigneeParams {
  card: Card
  taskId: number
  groupId: number
}

export const useCardAssignee = ({
  card,
  taskId,
  groupId
}: UseCardAssigneeParams) => {
  const { updateCard, currentGroupMembers, currentUser } = useBoardStore()
  const { mutateAsync: assignTaskMutateAsync } = useAssignTask(groupId)

  const activeGroupMembers = useMemo(
    () => currentGroupMembers.filter(member => member.isActive !== false),
    [currentGroupMembers]
  )

  const assignedUser = activeGroupMembers?.find(
    member => member.id === card.assignedTo || member.userId === card.assignedTo
  )

  const currentUserMember = useMemo(() => {
    if (!activeGroupMembers?.length) return null

    if (currentUser) {
      const matchedByStore = activeGroupMembers.find(
        member =>
          member.id === currentUser.id ||
          member.userId === currentUser.id ||
          (typeof currentUser.userId === 'number' &&
            (member.id === currentUser.userId ||
              member.userId === currentUser.userId))
      )

      if (matchedByStore) return matchedByStore
    }

    const tokenUser = getCurrentUserFromToken()
    const normalizedName = (tokenUser.fullName || '').trim().toLowerCase()
    const normalizedCode = (tokenUser.studentId || '').trim().toLowerCase()

    return (
      activeGroupMembers.find(member => {
        const memberName = (member.userName || '').trim().toLowerCase()
        const memberCode = (member.userCode || '').trim().toLowerCase()

        return (
          (!!normalizedCode && memberCode === normalizedCode) ||
          (!!normalizedName && memberName === normalizedName)
        )
      }) || null
    )
  }, [activeGroupMembers, currentUser])

  const handleAssignToMe = async (
    event: MouseEvent,
    onCompleted?: () => void
  ) => {
    event.stopPropagation()

    if (currentUserMember) {
      const assignTarget = currentUserMember.userId ?? currentUserMember.id
      const assignedToForUi = currentUserMember.userId ?? currentUserMember.id

      if (taskId > 0 && groupId > 0) {
        await assignTaskMutateAsync({ taskId, assignedTo: assignTarget })
      }

      updateCard(card._id, { assignedTo: assignedToForUi })
    }

    onCompleted?.()
  }

  const handleAssignToUser = async (
    assignedUserId: number,
    event: MouseEvent,
    onCompleted?: () => void
  ) => {
    event.stopPropagation()

    if (taskId > 0 && groupId > 0) {
      await assignTaskMutateAsync({ taskId, assignedTo: assignedUserId })
    }

    updateCard(card._id, { assignedTo: assignedUserId })
    onCompleted?.()
  }

  const handleUnassign = async (
    event: MouseEvent,
    onCompleted?: () => void
  ) => {
    event.stopPropagation()

    if (taskId > 0 && groupId > 0) {
      await assignTaskMutateAsync({ taskId, assignedTo: null })
    }

    updateCard(card._id, { assignedTo: null })
    onCompleted?.()
  }

  return {
    assignedUser,
    currentGroupMembers: activeGroupMembers,
    handleAssignToMe,
    handleAssignToUser,
    handleUnassign
  }
}
