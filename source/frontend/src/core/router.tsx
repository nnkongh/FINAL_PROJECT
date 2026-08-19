import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import ForgotPasswordPage from '~/modules/auth/pages/forgotPasswordPage'
import { LoginPage } from '~/modules/auth/pages/loginPage'
import BoardDetail from '~/modules/boards/pages/BoardDetail'
import GroupsPage from '~/modules/groups/pages/GroupsPage'
// import GroupDetailPage from '~/modules/groups/pages/GroupDetailPage' // Tạm thời ẩn cái này nếu BoardDetail chính là trang chi tiết nhóm
import AccountManagementPage from '~/modules/admin/pages/AccountManagementPage'
import ResetPasswordPage from '@/modules/auth/pages/resetPasswordPage'
import MyClassesPage from '~/modules/classes/pages/MyClassesPage'
import ClassDetailPage from '~/modules/classes/pages/ClassDetailPage'
import ProfilePage from '~/modules/user/pages/ProfilePage'
import ChangePasswordPage from '~/modules/user/pages/ChangePasswordPage'
import TaskHistoryPage from '~/modules/tasks/pages/TaskHistoryPage'
import ProtectedRoute from '@/core/ProtectedRoute'
import RoleRedirect from '@/core/RoleRedirect'

export const router = createBrowserRouter([
  // --- PUBLIC ROUTES (Không cần Layout) ---
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },

  // --- PROTECTED ROUTES (Có MainLayout) ---
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={['Student', 'Teacher', 'Admin']}>
        <MainLayout>
          <RoleRedirect />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/groups',
    element: (
      <ProtectedRoute allowedRoles={['Student', 'Teacher']}>
        <MainLayout>
          <GroupsPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/groups/:id',
    element: (
      <ProtectedRoute allowedRoles={['Student', 'Teacher']}>
        <MainLayout>
          {/* Đưa BoardDetail vào đây để nó nhận được cái :id trên thanh địa chỉ */}
          <BoardDetail />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/classes',
    element: (
      <ProtectedRoute allowedRoles={['Student', 'Teacher']}>
        <MainLayout>
          <MyClassesPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/classes/:id',
    element: (
      <ProtectedRoute allowedRoles={['Student', 'Teacher']}>
        <MainLayout>
          <ClassDetailPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/account-management',
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <MainLayout>
          <AccountManagementPage />
        </MainLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <MainLayout>
        <ProfilePage />
      </MainLayout>
    )
  },
  {
    path: '/change-password',
    element: (
      <MainLayout>
        <ChangePasswordPage />
      </MainLayout>
    )
  },
  {
    path: '/tasks/:groupId/:taskId/history',
    element: (
      <MainLayout>
        <TaskHistoryPage />
      </MainLayout>
    )
  }
])
