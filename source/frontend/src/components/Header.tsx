import { Search, Moon, HelpCircle, User, KeyRound, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc,
  getStoredAvatarUrl
} from '@/lib/avatar'
import { getCurrentUserFromToken } from '@/lib/token'
import NotificationPopover from '@/modules/notification/components/NotificationPopover'
import { useUserProfile } from '@/modules/user/hook/user.hook'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface HeaderProps {
  userName?: string
  studentId?: string
  avatarUrl?: string
  mobileSidebarTrigger?: ReactNode
}

export default function Header({
  userName,
  studentId,
  avatarUrl,
  mobileSidebarTrigger
}: HeaderProps) {
  const navigate = useNavigate()
  const { data } = useUserProfile()
  const profileData = data?.data
  const tokenUser = getCurrentUserFromToken()
  const [extraUnreadCount, setExtraUnreadCount] = useState(0)

  // 1. Xác định Tên
  const displayName =
    userName ||
    profileData?.fullName ||
    profileData?.name ||
    profileData?.userName ||
    tokenUser.fullName ||
    'User'

  // 2. Xác định ID (UserCode / MSSV)
  const displayStudentId =
    studentId ||
    profileData?.studentId ||
    profileData?.mssv ||
    profileData?.userCode ||
    tokenUser.studentId ||
    '-'

  // 3. Xác định Role (Thêm mới để xử lý hiển thị chữ Teacher/Student)
  const currentRole = profileData?.userRole || tokenUser.systemRole || 'Student'
  // 4. Xác định Avatar
  const displayAvatar =
    avatarUrl ||
    profileData?.avatarUrl ||
    profileData?.avatar ||
    getStoredAvatarUrl() ||
    tokenUser.avatarUrl ||
    ''

  const initials = getAvatarFallback(displayName)

  const Maps = (path: string) => {
    navigate(path)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  useEffect(() => {
    const handleNewNotification = () => {
      setExtraUnreadCount(count => count + 1)
    }

    window.addEventListener('new_notification', handleNewNotification)

    return () => {
      window.removeEventListener('new_notification', handleNewNotification)
    }
  }, [])

  return (
    <header className='h-16 border-b border-slate-200 flex items-center justify-between gap-2 px-3 md:px-6 shrink-0'>
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <div className='lg:hidden'>{mobileSidebarTrigger}</div>

        {/* <div className='relative w-full max-w-none md:max-w-sm lg:max-w-md'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400' />
          <Input
            type='text'
            placeholder='Search tasks, groups, or files...'
            className='h-9 pl-9 bg-slate-50 border-none'
          />
        </div> */}
      </div>

      <div className='flex shrink-0 items-center gap-1 md:gap-3'>
        {/* <Button
          variant='ghost'
          size='icon'
          className='hidden md:inline-flex text-slate-500 rounded-full'
        >
          <Moon className='h-5 w-5' />
        </Button> */}
        <NotificationPopover extraUnreadCount={extraUnreadCount} />
        {/* <Button
          variant='ghost'
          size='icon'
          className='hidden md:inline-flex text-slate-500 rounded-full'
        >
          <HelpCircle className='h-5 w-5' />
        </Button> */}

        <div className='hidden sm:block h-8 w-px bg-slate-200 mx-1 md:mx-2'></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='flex items-center gap-2 md:gap-3 text-right rounded-md px-1.5 md:px-2 py-1 hover:bg-slate-100 transition-colors'
            >
              <div className='hidden min-w-0 sm:block max-w-40 md:max-w-44 lg:max-w-none'>
                <p className='truncate text-sm font-semibold leading-none'>
                  {displayName}
                </p>
                <p className='text-sm text-gray-500'>
                  {currentRole?.toLowerCase() === 'teacher'
                    ? 'Teacher ID'
                    : 'Student ID'}
                  : {displayStudentId}
                </p>
              </div>
              <Avatar className='shrink-0'>
                <AvatarImage src={getAvatarSrc(displayAvatar)} />
                <AvatarFallback
                  className={`${getAvatarColorClass(displayName)} text-white font-medium`}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className='w-52'>
            <DropdownMenuItem onClick={() => Maps('/profile')}>
              <User className='h-4 w-4' />
              Trang cá nhân
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/change-password')}>
              <KeyRound className='h-4 w-4' />
              Đổi mật khẩu
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className='text-red-600 focus:text-red-600 focus:bg-red-50'
            >
              <LogOut className='h-4 w-4' />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
