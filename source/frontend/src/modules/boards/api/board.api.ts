import type { Card, Column } from '../types/board'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============ CARD API ============

/**
 * Create a new card in a column
 */
export const createCardAPI = async (
  columnId: string,
  title: string,
  boardId: string
): Promise<Card> => {
  await delay(300)

  const newCard: Card = {
    _id: crypto.randomUUID(),
    boardId,
    columnId,
    title,
    description: null,
    priority: 'medium',
    memberIds: [],
    comments: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return newCard
}

/**
 * Create a detailed card with all fields
 */
export const createDetailedCardAPI = async (
  boardId: string,
  columnId: string,
  data: Partial<Card>
): Promise<Card> => {
  await delay(300)

  const newCard: Card = {
    _id: crypto.randomUUID(),
    boardId,
    columnId,
    title: data.title || 'Untitled',
    description: data.description || null,
    priority: data.priority || 'medium',
    assignee: data.assignee,
    dueDate: data.dueDate,
    memberIds: data.memberIds || [],
    comments: data.comments || [],
    attachments: data.attachments || [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  }

  return newCard
}

/**
 * Update an existing card
 */
export const updateCardAPI = async (
  cardId: string,
  updates: Partial<Card>
): Promise<Card> => {
  await delay(200)

  // In real API, this would return the updated card from server
  // For mock, we just return the updates
  return { _id: cardId, ...updates } as Card
}

/**
 * Delete a card
 */
export const deleteCardAPI = async (
  cardId: string
): Promise<{ success: boolean; cardId: string }> => {
  await delay(200)

  return { success: true, cardId }
}

/**
 * Move card to different column
 */
export const moveCardAPI = async (
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  newIndex: number
): Promise<{ success: boolean }> => {
  await delay(300)

  return { success: true }
}

// ============ COLUMN API ============

/**
 * Create a new column
 */
export const createColumnAPI = async (
  boardId: string,
  title: string
): Promise<Column> => {
  await delay(300)

  const newColumn: Column = {
    _id: crypto.randomUUID(),
    boardId,
    title,
    cardOrderIds: [],
    cards: []
  }

  return newColumn
}

/**
 * Update column
 */
export const updateColumnAPI = async (
  columnId: string,
  updates: Partial<Column>
): Promise<Column> => {
  await delay(200)

  return { _id: columnId, ...updates } as Column
}

/**
 * Delete column
 */
export const deleteColumnAPI = async (
  columnId: string
): Promise<{ success: boolean; columnId: string }> => {
  await delay(200)

  return { success: true, columnId }
}
