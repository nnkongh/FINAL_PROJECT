import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Board, Column, Card, GroupMember } from '../types/board'
import { mockData } from '~/apis/mock-data'

interface BoardState {
  board: Board | null
  isLoading: boolean
  error: string | null
  currentGroupMembers: GroupMember[]
  currentUser: GroupMember | null

  // Actions
  initializeBoard: (board: Board) => void
  updateBoard: (updates: Partial<Board>) => void
  setCurrentGroupMembers: (members: GroupMember[]) => void
  setCurrentUser: (user: GroupMember | null) => void

  // Column actions
  addColumn: (column: Column) => void
  updateColumn: (columnId: string, updates: Partial<Column>) => void
  deleteColumn: (columnId: string) => void
  reorderColumns: (columnOrderIds: string[]) => void

  // Card actions
  addCard: (columnId: string, card: Card) => void
  updateCard: (cardId: string, updates: Partial<Card>) => void
  deleteCard: (cardId: string) => void
  moveCard: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) => void
  reorderCardsInColumn: (columnId: string, cardOrderIds: string[]) => void
}

export const useBoardStore = create<BoardState>()(
  immer(set => ({
    board: mockData.board,
    isLoading: false,
    error: null,
    currentGroupMembers: [],
    currentUser: null,

    initializeBoard: board =>
      set(state => {
        state.board = board
        state.isLoading = false
        state.error = null
      }),

    updateBoard: updates =>
      set(state => {
        if (state.board) {
          Object.assign(state.board, updates)
        }
      }),

    setCurrentGroupMembers: members =>
      set(state => {
        state.currentGroupMembers = members
      }),

    setCurrentUser: user =>
      set(state => {
        state.currentUser = user
      }),

    // Column actions
    addColumn: column =>
      set(state => {
        if (state.board) {
          state.board.columns.push(column)
          state.board.columnOrderIds.push(column._id)
        }
      }),

    updateColumn: (columnId, updates) =>
      set(state => {
        if (state.board) {
          const column = state.board.columns.find(col => col._id === columnId)
          if (column) {
            Object.assign(column, updates)
          }
        }
      }),

    deleteColumn: columnId =>
      set(state => {
        if (state.board) {
          state.board.columns = state.board.columns.filter(
            col => col._id !== columnId
          )
          state.board.columnOrderIds = state.board.columnOrderIds.filter(
            id => id !== columnId
          )
        }
      }),

    reorderColumns: columnOrderIds =>
      set(state => {
        if (state.board) {
          state.board.columnOrderIds = columnOrderIds
        }
      }),

    // Card actions
    addCard: (columnId, card) =>
      set(state => {
        if (state.board) {
          const column = state.board.columns.find(col => col._id === columnId)
          if (column) {
            column.cards.push(card)
            column.cardOrderIds.push(card._id)
          }
        }
      }),

    updateCard: (cardId, updates) =>
      set(state => {
        if (state.board) {
          for (const column of state.board.columns) {
            const card = column.cards.find(c => c._id === cardId)
            if (card) {
              Object.assign(card, updates)
              break
            }
          }
        }
      }),

    deleteCard: cardId =>
      set(state => {
        if (state.board) {
          for (const column of state.board.columns) {
            const cardIndex = column.cards.findIndex(c => c._id === cardId)
            if (cardIndex !== -1) {
              column.cards.splice(cardIndex, 1)
              column.cardOrderIds = column.cardOrderIds.filter(
                id => id !== cardId
              )
              break
            }
          }
        }
      }),

    moveCard: (cardId, fromColumnId, toColumnId, newIndex) =>
      set(state => {
        if (state.board) {
          const fromColumn = state.board.columns.find(
            col => col._id === fromColumnId
          )
          const toColumn = state.board.columns.find(
            col => col._id === toColumnId
          )

          if (fromColumn && toColumn) {
            const cardIndex = fromColumn.cards.findIndex(c => c._id === cardId)
            if (cardIndex !== -1) {
              const [card] = fromColumn.cards.splice(cardIndex, 1)
              fromColumn.cardOrderIds = fromColumn.cardOrderIds.filter(
                id => id !== cardId
              )

              card.columnId = toColumnId
              toColumn.cards.splice(newIndex, 0, card)
              toColumn.cardOrderIds.splice(newIndex, 0, cardId)
            }
          }
        }
      }),

    reorderCardsInColumn: (columnId, cardOrderIds) =>
      set(state => {
        if (state.board) {
          const column = state.board.columns.find(col => col._id === columnId)
          if (column) {
            column.cardOrderIds = cardOrderIds
          }
        }
      })
  }))
)
