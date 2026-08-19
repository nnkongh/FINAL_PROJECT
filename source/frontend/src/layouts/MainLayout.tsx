import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '@/components/Header'
import { Menu } from 'lucide-react'
import LogoImage from '@/assets/logo-DHNT-300x300.png'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { useMemo, useState } from 'react'
import { useGetMe, type UserRole } from '@/hooks/useGetMe'

const ROLE_NAVIGATION: Record<
  Exclude<UserRole, ''>,
  Array<{ label: string; path: string }>
> = {
  Student: [
    { label: 'Danh sách nhóm', path: '/groups' },
    { label: 'Danh sách lớp', path: '/classes' }
  ],
  Teacher: [{ label: 'Danh sách lớp', path: '/classes' }],
  Admin: [{ label: 'Quản lý tài khoản', path: '/account-management' }]
}

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const { data } = useGetMe()
  const role = (data?.data?.role || '') as UserRole
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const navItems = useMemo(() => {
    if (!role || !(role in ROLE_NAVIGATION)) return []
    return ROLE_NAVIGATION[role as Exclude<UserRole, ''>]
  }, [role])

  const renderNavigation = (onItemClick?: () => void) => (
    <nav className='space-y-1'>
      {navItems.map(item => {
        const isActive =
          item.path === '/'
            ? pathname === '/'
            : pathname === item.path || pathname.startsWith(`${item.path}/`)

        return (
          <Button
            key={item.path}
            variant={isActive ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${
              isActive
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            onClick={() => {
              navigate(item.path)
              onItemClick?.()
            }}
          >
            {item.label}
          </Button>
        )
      })}
    </nav>
  )

  return (
    <div className='flex h-dvh w-full overflow-hidden bg-white text-slate-900'>
      {/* 1. SIDEBAR (Bên trái) */}
      <aside className='hidden lg:flex lg:sticky lg:top-0 lg:h-dvh w-72 border-r border-slate-200 flex-col justify-between p-4 shrink-0'>
        <div>
          {/* Logo */}
          <div className='flex items-center gap-3 px-2 mb-8'>
            <div className='w-8 h-8 rounded-md'>
              <img
                src={LogoImage}
                alt='NTU Group Logo'
                className='w-full h-full object-cover rounded-md'
              />
            </div>
            <div>
              <h2 className='font-bold text-base'>NTU Group</h2>
              <p className='text-xs text-slate-500'>Project Management</p>
            </div>
          </div>
          {renderNavigation()}
        </div>
      </aside>

      {/* 2. MAIN CONTENT (Bên phải) */}
      <main className='flex min-w-0 flex-1 flex-col overflow-x-hidden'>
        <Header
          mobileSidebarTrigger={
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-9 w-9 lg:hidden'
                onClick={() => setIsSidebarOpen(true)}
                aria-label='Mở menu điều hướng'
              >
                <Menu className='h-5 w-5' />
              </Button>
              <SheetContent side='left' className='w-[85vw] max-w-xs p-4'>
                <SheetHeader>
                  <SheetTitle>NTU Group</SheetTitle>
                </SheetHeader>
                <div className='mt-6'>
                  {renderNavigation(() => setIsSidebarOpen(false))}
                </div>
              </SheetContent>
            </Sheet>
          }
        />

        {/* 3. BOARD AREA (Nơi chứa Bảng kéo thả) */}
        <div className='flex-1 min-h-0 overflow-hidden'>{children}</div>
      </main>
    </div>
  )
}
