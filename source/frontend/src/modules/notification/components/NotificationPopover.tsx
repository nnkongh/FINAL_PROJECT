import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { formatDateTimeVi } from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import {
  useGetNotifications,
  useNotificationClick,
  useMarkAllAsRead
} from '../hooks/useNotifications'
import type { NotificationDto } from '../api/notification.api'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
}

const ScrollArea = ({ children, className }: ScrollAreaProps) => {
  return <div className={cn('overflow-y-auto', className)}>{children}</div>
}

const formatNotificationTime = (createdAt?: string) => {
  return formatDateTimeVi(createdAt)
}

interface NotificationItemProps {
  notification: NotificationDto
  onClick: (notification: NotificationDto) => void
  disabled?: boolean
}

const NotificationItem = ({
  notification,
  onClick,
  disabled
}: NotificationItemProps) => {
  const displayTitle = notification.title || notification.content
  const displayBody = notification.body || ''

  return (
    <button
      type='button'
      onClick={() => onClick(notification)}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 disabled:opacity-60',
        notification.isRead ? 'bg-white' : 'bg-blue-50/70'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <p className='text-sm font-medium text-slate-800 wrap-break-words'>
          {displayTitle}
        </p>
        {!notification.isRead && (
          <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600' />
        )}
      </div>
      {displayBody && (
        <p className='mt-1 text-xs text-slate-600 wrap-break-word'>
          {displayBody}
        </p>
      )}
      <p className='mt-1 text-xs text-slate-500'>
        {formatNotificationTime(notification.createdAt)}
      </p>
    </button>
  )
}

interface NotificationPopoverProps {
  extraUnreadCount?: number
}

export default function NotificationPopover({
  extraUnreadCount = 0
}: NotificationPopoverProps) {
  const { data = [], isLoading } = useGetNotifications()
  const { handleNotificationClick, isPending: isMarkingSingle } =
    useNotificationClick()
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()

  const sortedNotifications = [...data].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return timeB - timeA
  })

  const unreadNotifications = sortedNotifications.filter(
    item => item.isRead === false
  )
  const unreadCount = unreadNotifications.length
  const displayUnreadCount = Math.max(0, unreadCount + extraUnreadCount)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='relative rounded-full text-slate-500 hover:text-slate-700'
          aria-label='Thông báo'
        >
          <Bell className='h-5 w-5' />
          {displayUnreadCount > 0 && (
            <Badge className='absolute justify-center items-center -right-1 -top-1 h-5 min-w-5 rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white hover:bg-red-500'>
              {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-96 p-0'>
        <div className='border-b border-slate-200 px-4 py-3'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='text-sm font-semibold text-slate-900'>Thông báo</h3>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 text-xs text-blue-600 hover:text-blue-700'
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll || displayUnreadCount === 0}
            >
              {isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
            </Button>
          </div>
        </div>

        <ScrollArea className='max-h-87.5'>
          {isLoading ? (
            <div className='px-4 py-6 text-center text-sm text-slate-500'>
              Đang tải thông báo...
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className='px-4 py-8 text-center text-sm text-slate-500'>
              Hiện chưa có thông báo nào.
            </div>
          ) : (
            <div className='divide-y divide-slate-100'>
              {sortedNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  disabled={isMarkingSingle}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
