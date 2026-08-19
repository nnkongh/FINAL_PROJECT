import { Column, Card } from '~/modules/boards/types/board'

export const capitalizeFirstLetter = (val: string): string => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

export const generatePlaceholderCard = (column: Column): Card => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}

/**
 * Format card ID to JIRA-style issue key
 * Example: "card-id-01" -> "TASK-1"
 */
export const formatIssueKey = (cardId: string, issueKey?: string): string => {
  if (issueKey) return issueKey

  // Extract number from card ID (e.g., "card-id-01" -> "01")
  const match = cardId.match(/\d+/)
  const number = match ? parseInt(match[0], 10) : 1

  return `TASK-${number}`
}

/**
 * Check if date is overdue
 */
export const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < today
}

/**
 * Format date for display
 */
export const formatDueDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Not set'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
