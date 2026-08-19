import api from '@/lib/axios'

export interface NotificationDto {
  id: number
  content: string
  title?: string
  body?: string | null
  isRead: boolean
  createdAt: string
  groupId?: number | string | null
  // Thêm 2 trường này theo đúng chuẩn API của bạn:
  relatedEntityId?: number | string | null
  relatedEntityType?: 'Task' | 'Group' | string
}

interface NotificationListResponse {
  value?: NotificationDto[]
  data?: NotificationDto[]
}

type RawNotification = Partial<NotificationDto> & {
  id?: number | string
  title?: string
  body?: string | null
  content?: string
  isRead?: boolean
  createdAt?: string
  groupId?: number | string | null
  relatedEntityId?: number | string | null
  relatedEntityType?: string
}

const normalizeNotificationItem = (
  item: RawNotification
): NotificationDto | null => {
  const id = Number(item?.id)
  if (!Number.isFinite(id) || id <= 0) return null

  const title = item?.title?.trim() || ''
  const body = typeof item?.body === 'string' ? item.body : (item?.body ?? null)
  const content =
    item?.content?.trim() ||
    title ||
    (typeof body === 'string' ? body : '') ||
    'Thông báo mới'

  return {
    id,
    content,
    title,
    body,
    isRead: Boolean(item?.isRead),
    createdAt: item?.createdAt || '',
    groupId: item?.groupId,
    relatedEntityId: item?.relatedEntityId,
    relatedEntityType: item?.relatedEntityType
  }
}

const normalizeNotifications = (payload: unknown): NotificationDto[] => {
  if (Array.isArray(payload)) {
    return payload
      .map(item => normalizeNotificationItem(item as RawNotification))
      .filter((item): item is NotificationDto => item !== null)
  }

  const response = payload as NotificationListResponse | null | undefined

  if (Array.isArray(response?.value)) {
    return response.value
      .map(item => normalizeNotificationItem(item as RawNotification))
      .filter((item): item is NotificationDto => item !== null)
  }

  if (Array.isArray(response?.data)) {
    return response.data
      .map(item => normalizeNotificationItem(item as RawNotification))
      .filter((item): item is NotificationDto => item !== null)
  }

  return []
}

export const getNotificationsAPI = async (): Promise<NotificationDto[]> => {
  const response = await api.get<NotificationDto[] | NotificationListResponse>(
    '/notification'
  )

  return normalizeNotifications(response.data)
}

export const markAsReadAPI = async (id: number) => {
  const response = await api.put(`/notification/${id}/read`)
  return response.data
}

export const markAllAsReadAPI = async () => {
  const response = await api.put('/notification/read-all')
  return response.data
}
