import { useQuery } from '@tanstack/react-query'
import { getTaskHistory } from '../api/taskApi'
import type { TaskHistoryItem } from '../types/task'

export const taskHistoryKeys = {
  all: ['task-history'] as const,
  detail: (taskId: number | string) =>
    [...taskHistoryKeys.all, String(taskId)] as const
}

export const useTaskHistory = (taskId?: number | string) => {
  return useQuery<TaskHistoryItem[]>({
    queryKey: taskId
      ? taskHistoryKeys.detail(taskId)
      : [...taskHistoryKeys.all, 'unknown'],
    queryFn: () => getTaskHistory(taskId as number | string),
    enabled:
      taskId !== undefined &&
      taskId !== null &&
      String(taskId).trim() !== '' &&
      Number(taskId) > 0
  })
}

export const useGetTaskHistory = useTaskHistory
