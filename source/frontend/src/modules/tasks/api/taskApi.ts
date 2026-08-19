import api from '@/lib/axios'
import type { OverdueTaskItem, TaskHistoryItem } from '../types/task'

interface ApiErrorPayload {
  code?: string
  message?: string
}

interface ApiEnvelope<T> {
  value?: T
  data?: T
  isSuccess?: boolean
  isFailure?: boolean
  error?: ApiErrorPayload
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

const throwIfFailure = (payload: {
  isSuccess?: boolean
  isFailure?: boolean
  error?: { message?: string }
}) => {
  if (payload?.isFailure || payload?.isSuccess === false) {
    throw new Error(payload?.error?.message || 'Request failed')
  }
}

const parseNumericId = (value: unknown): number | string => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : String(value ?? '')
}

const unwrapEnvelope = <T>(payload: ApiEnvelope<T> | T): T => {
  if (!isObject(payload)) return payload as T

  if ('isFailure' in payload || 'isSuccess' in payload || 'value' in payload) {
    const envelope = payload as ApiEnvelope<T>

    if (envelope.isFailure || envelope.isSuccess === false) {
      throw new Error(envelope.error?.message || 'Request failed')
    }

    if (envelope.value !== undefined) return envelope.value
    if (envelope.data !== undefined) return envelope.data
  }

  return payload as T
}

const extractArrayFromObject = <T>(payload: unknown): T[] => {
  if (!isObject(payload)) return []

  const keys = ['value', 'data', 'items', 'result', 'history', 'tasks', 'list']
  for (const key of keys) {
    const candidate = (payload as Record<string, unknown>)[key]
    if (Array.isArray(candidate)) {
      return candidate as T[]
    }
    if (isObject(candidate)) {
      const nested = extractArrayFromObject<T>(candidate)
      if (nested.length > 0) return nested
    }
  }

  return []
}

const extractTaskHistory = (item: unknown): TaskHistoryItem | null => {
  if (!isObject(item)) return null

  const changedAt = item.changedAt ? String(item.changedAt) : ''

  return {
    id: parseNumericId(item.id),
    taskId: parseNumericId(item.taskId),
    changedBy: parseNumericId(item.changedBy),
    oldStatus: String(item.oldStatus ?? ''),
    newStatus: String(item.newStatus ?? ''),
    changedAt
  }
}

const extractOverdueTask = (item: unknown): OverdueTaskItem | null => {
  if (!isObject(item)) return null

  return {
    id: (item.id as number | string) ?? `${Date.now()}`,
    title: String(item.title ?? item.name ?? 'Untitled'),
    assigneeName: item.assigneeName ? String(item.assigneeName) : null,
    dueDate: item.dueDate ? String(item.dueDate) : null,
    status: item.status ? String(item.status) : undefined,
    priority: item.priority ? String(item.priority) : undefined,
    groupId: item.groupId as number | string | undefined,
    groupName: item.groupName ? String(item.groupName) : undefined,
    description:
      item.description === undefined ? null : String(item.description ?? ''),
    overdueDays:
      typeof item.overdueDays === 'number'
        ? item.overdueDays
        : Number.isFinite(Number(item.overdueDays))
          ? Number(item.overdueDays)
          : undefined,
    isOverdue: item.isOverdue === undefined ? true : Boolean(item.isOverdue)
  }
}

export const getTaskHistory = async (
  taskId: number | string
): Promise<TaskHistoryItem[]> => {
  const response = await api.get<ApiEnvelope<unknown> | unknown>(
    `/task/${taskId}/history`
  )

  const payload = unwrapEnvelope<unknown>(response.data as ApiEnvelope<unknown>)
  if (Array.isArray(payload)) {
    return payload.map(extractTaskHistory).filter(Boolean) as TaskHistoryItem[]
  }

  if (isObject(payload)) {
    throwIfFailure(payload as ApiEnvelope<unknown>)

    const items = extractArrayFromObject<unknown>(payload)
    if (items.length > 0) {
      return items.map(extractTaskHistory).filter(Boolean) as TaskHistoryItem[]
    }
  }

  return []
}

export const getOverdueTasks = async (
  groupId: number | string
): Promise<OverdueTaskItem[]> => {
  const response = await api.get<ApiEnvelope<unknown> | unknown>(
    `/group/${groupId}/tasks/overdue`
  )

  const payload = unwrapEnvelope<unknown>(response.data as ApiEnvelope<unknown>)
  if (Array.isArray(payload)) {
    return payload.map(extractOverdueTask).filter(Boolean) as OverdueTaskItem[]
  }

  if (isObject(payload)) {
    throwIfFailure(payload as ApiEnvelope<unknown>)

    const items = extractArrayFromObject<unknown>(payload)
    if (items.length > 0) {
      return items.map(extractOverdueTask).filter(Boolean) as OverdueTaskItem[]
    }
  }

  return []
}
