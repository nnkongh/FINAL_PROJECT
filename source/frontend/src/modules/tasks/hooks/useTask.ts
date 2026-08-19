import { useQuery } from '@tanstack/react-query'
import { getOverdueTasks, getTaskHistory } from '../api/taskApi'
import type { OverdueTaskItem, TaskHistoryItem } from '../types/task'

export const taskKeys = {
  all: ['tasks'] as const,
  history: (taskId: number | string) =>
    [...taskKeys.all, 'history', String(taskId)] as const,
  overdue: (groupId: number | string) =>
    [...taskKeys.all, 'overdue', String(groupId)] as const
}

export const useGetTaskHistory = (taskId?: number | string) => {
  return useQuery<TaskHistoryItem[]>({
    queryKey: taskId
      ? taskKeys.history(taskId)
      : [...taskKeys.all, 'history', 'unknown'],
    queryFn: () => getTaskHistory(taskId as number | string),
    enabled:
      taskId !== undefined &&
      taskId !== null &&
      String(taskId).trim() !== '' &&
      Number(taskId) > 0
  })
}

export const useGetOverdueTasks = (groupId?: number | string) => {
  return useQuery<OverdueTaskItem[]>({
    queryKey: groupId
      ? taskKeys.overdue(groupId)
      : [...taskKeys.all, 'overdue', 'unknown'],
    queryFn: () => getOverdueTasks(groupId as number | string),
    enabled:
      groupId !== undefined &&
      groupId !== null &&
      String(groupId).trim() !== '' &&
      Number(groupId) > 0
  })
}
