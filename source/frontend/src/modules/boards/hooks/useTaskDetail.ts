import { useEffect, useState } from 'react'
import { getTaskDetailAPI } from '../api/task.api'
import type { Card, GitHubPRObject } from '../types/board'

export interface TaskDetailState extends Card {
  pr?: GitHubPRObject | null
}

interface UseTaskDetailParams {
  card: Card | null
  isOpen: boolean
  taskId: number
}

export const useTaskDetail = ({
  card,
  isOpen,
  taskId
}: UseTaskDetailParams) => {
  const [taskDetail, setTaskDetail] = useState<TaskDetailState | null>(card)

  useEffect(() => {
    setTaskDetail(card)
  }, [card])

  useEffect(() => {
    if (!isOpen || taskId <= 0) return

    let isCancelled = false

    const fetchTaskDetail = async () => {
      try {
        const detail = await getTaskDetailAPI(taskId)
        if (isCancelled || !detail) return

        setTaskDetail(prev => {
          if (!prev) return prev

          return {
            ...prev,
            title: detail.title ?? prev.title,
            description: detail.description ?? prev.description,
            assignedTo:
              detail.assignedTo === undefined
                ? prev.assignedTo
                : detail.assignedTo,
            dueDate: detail.dueDate ?? prev.dueDate,
            createdAt: detail.createdAt ?? prev.createdAt,
            updatedAt: detail.updatedAt ?? prev.updatedAt,
            pr: detail.pr ?? prev.pr
          }
        })
      } catch (error) {
        console.error('Failed to fetch task detail:', error)
      }
    }

    void fetchTaskDetail()

    return () => {
      isCancelled = true
    }
  }, [isOpen, taskId])

  return {
    taskDetail,
    setTaskDetail
  }
}
