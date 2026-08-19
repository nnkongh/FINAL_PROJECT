import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Upload, Plus } from 'lucide-react'
import AccountsTable from '../components/AccountsTable'
import ImportFileDialog from '../components/ImportFileDialog'
import { getAccountsAPI } from '../api/account.api'

export default function AccountManagementPage() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const {
    data: accounts = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: () => getAccountsAPI()
  })

  const handleImportClick = () => {
    setIsImportDialogOpen(true)
  }

  const handleImportSuccess = () => {
    console.log('Import account file successfully')
    void refetch()
  }

  const handleAddAccount = () => {
    // TODO: Open dialog to add new account
    console.log('Add account clicked')
    alert('Chức năng thêm tài khoản sẽ được triển khai sau')
  }

  return (
    <div className='flex-1 min-h-0 overflow-y-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-slate-900'>
          Account Management
        </h1>

        <div className='flex items-center gap-3'>
          {/* Add Account Button */}
          <Button onClick={handleAddAccount} className='gap-2'>
            <Plus className='h-4 w-4' />
            Thêm tài khoản
          </Button>

          <Button
            variant='outline'
            onClick={handleImportClick}
            className='gap-2'
          >
            <Upload className='h-4 w-4' />
            Import Excel
          </Button>

          <ImportFileDialog
            isOpen={isImportDialogOpen}
            onClose={() => setIsImportDialogOpen(false)}
            onSuccess={handleImportSuccess}
          />
        </div>
      </div>

      {/* Info Text */}
      <p className='text-sm text-slate-600'>
        Quản lý danh sách tài khoản người dùng trong hệ thống. Bạn có thể thêm
        tài khoản thủ công hoặc import từ file Excel.
      </p>

      {/* Accounts Table */}
      {isLoading && (
        <div className='rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500'>
          Đang tải danh sách tài khoản...
        </div>
      )}

      {isError && (
        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          Không thể tải dữ liệu tài khoản. Vui lòng thử lại.
        </div>
      )}

      <AccountsTable accounts={accounts} />

      {/* Stats */}
      <div className='flex items-center gap-6 text-sm text-slate-600'>
        <span>
          Tổng số tài khoản: <strong>{accounts.length}</strong>
        </span>
      </div>
    </div>
  )
}
