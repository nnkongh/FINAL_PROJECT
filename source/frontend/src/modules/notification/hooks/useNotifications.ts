import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  getNotificationsAPI,
  markAllAsReadAPI,
  markAsReadAPI,
  type NotificationDto
} from '../api/notification.api'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const
}

const TASK_NOTIFICATION_TYPES = new Set(['TASK_ASSIGN', 'COMMENT'])

// export const getNotificationRedirectUrl = (notification: NotificationDto) => {
//   const groupId = Number(notification.groupId)
//   if (!Number.isFinite(groupId) || groupId <= 0) {
//     return '/groups'
//   }

//   const baseGroupPath = `/groups/${groupId}`

//   const taskId = Number(notification.taskId)
//   const isTaskNotification =
//     TASK_NOTIFICATION_TYPES.has(String(notification.type || '')) &&
//     Number.isFinite(taskId) &&
//     taskId > 0

//   if (isTaskNotification) {
//     return `${baseGroupPath}?taskId=${taskId}`
//   }

//   return baseGroupPath
// }

export const getNotificationRedirectUrl = (notification: NotificationDto) => {
  const groupId = Number(notification.groupId)

  // Nếu không có groupId hợp lệ thì back về trang danh sách group
  if (!Number.isFinite(groupId) || groupId <= 0) {
    return '/groups'
  }

  const baseGroupPath = `/groups/${groupId}`

  // Check xem thông báo này có phải của Task hay không (Dựa vào relatedEntityType)
  const isTaskNotification = notification.relatedEntityType === 'Task'

  // Lấy ID của Task từ relatedEntityId
  const taskId = Number(notification.relatedEntityId)

  // Nếu là thông báo Task và ID hợp lệ -> Nối thêm ?taskId=...
  if (isTaskNotification && Number.isFinite(taskId) && taskId > 0) {
    return `${baseGroupPath}?taskId=${taskId}`
  }

  // Nếu là thông báo Group thì chỉ trả về base path
  return baseGroupPath
}

export const useGetNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: getNotificationsAPI
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => markAsReadAPI(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        notificationKeys.lists(),
        (oldData: NotificationDto[] | undefined) => {
          if (!Array.isArray(oldData)) return oldData

          return oldData.map(item =>
            item.id === id ? { ...item, isRead: true } : item
          )
        }
      )
    }
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllAsReadAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    }
  })
}

export const useNotificationClick = () => {
  const navigate = useNavigate()
  const { mutateAsync: markAsReadMutateAsync, isPending } = useMarkAsRead()

  const handleNotificationClick = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      await markAsReadMutateAsync(notification.id)
    }

    navigate(getNotificationRedirectUrl(notification))
  }

  return { handleNotificationClick, isPending }
}
