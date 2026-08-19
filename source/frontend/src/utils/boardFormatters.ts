import type { Card } from '@/modules/boards/types/board'

export type BoardColumnId = 'todo' | 'inprogress' | 'test' | 'complete'

const TASK_STATUS_COLUMN_MAP: Record<string, BoardColumnId> = {
  TODO: 'todo',
  INPROGRESS: 'inprogress',
  TEST: 'test',
  COMPLETE: 'complete',
  DONE: 'complete'
}

export const mapTaskStatusToColumnId = (status?: string): BoardColumnId => {
  const normalizedStatus = String(status || '')
    .replace(/[\s_-]+/g, '')
    .toUpperCase()

  return TASK_STATUS_COLUMN_MAP[normalizedStatus] || 'todo'
}

const PRIORITY_MAP: Record<string, Card['priority']> = {
  high: 'high',
  medium: 'medium',
  low: 'low'
}

export const mapPriorityToCard = (priority?: string): Card['priority'] => {
  const normalizedPriority = String(priority || '')
    .trim()
    .toLowerCase()
  return PRIORITY_MAP[normalizedPriority] || 'medium'
}

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const parseDateInputToLocalDate = (value: string) => {
  const matched = value.match(DATE_INPUT_PATTERN)
  if (!matched) return null

  const year = Number(matched[1])
  const month = Number(matched[2])
  const day = Number(matched[3])

  if (!year || !month || !day) return null

  const parsedDate = new Date(year, month - 1, day)
  if (Number.isNaN(parsedDate.getTime())) return null

  return parsedDate
}

export const formatDueDateForSubmit = (
  date?: string | Date | null
): string | undefined => {
  if (!date) return undefined

  const parsedDate =
    typeof date === 'string'
      ? parseDateInputToLocalDate(date)
      : new Date(date.getTime())

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return undefined
  }

  parsedDate.setHours(23, 59, 59, 0)
  return parsedDate.toISOString()
}

export const formatDueDateForCard = (date?: string) => {
  if (!date) return null

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return null

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit'
  }).format(parsedDate)
}
