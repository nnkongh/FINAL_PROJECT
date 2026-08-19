import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react'
import {
  importFileAPI,
  validateImportFile,
  formatFileSize
} from '../api/import.api'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { toast } from 'sonner' // Thêm import sonner tại đây

interface ImportFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportFileDialog({
  isOpen,
  onClose,
  onSuccess
}: ImportFileDialogProps) {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle file selection from input
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!validateImportFile(file)) {
      setError('Vui lòng chọn file có định dạng .xlsx, .csv hoặc .xls')
      setSelectedFile(null)
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('Kích thước file không được vượt quá 10MB')
      setSelectedFile(null)
      return
    }

    // File is valid
    setSelectedFile(file)
    setError('')
  }

  /**
   * Handle upload file to server
   */
  const handleUpload = async () => {
    // Validate file is selected
    if (!selectedFile) {
      setError('Vui lòng chọn file để tải lên')
      return
    }

    setIsUploading(true)
    setError('')

    // 1. Hiển thị thông báo loading đang xử lý
    const toastId = toast.loading('Đang xử lý file Excel...')

    try {
      // Call API to upload file
      const res = await importFileAPI(selectedFile)

      // Success: Reset state and close dialog
      setSelectedFile(null)
      setError('')

      // Close dialog
      onClose()

      // Notify parent component to reload data
      onSuccess()

      // 2. Cập nhật thông báo thành công từ kết quả API trả về
      const successMsg =
        res?.message || res?.Message || 'Đã import dữ liệu thành công.'
      toast.success('Thành công', {
        id: toastId,
        description: successMsg,
        duration: 5000
      })
    } catch (err: any) {
      // Handle error
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        'Có lỗi xảy ra khi tải file lên. Vui lòng thử lại.'

      setError(errorMessage)

      // 3. Cập nhật thông báo thất bại
      toast.error('Import thất bại', {
        id: toastId,
        description: errorMessage,
        duration: 5000
      })
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    // Reset state
    setSelectedFile(null)
    setError('')

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Close dialog
    onClose()
  }

  /**
   * Remove selected file
   */
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Trigger file input click
   */
  const handleBrowseFile = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-125'>
        {/* Header */}
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5 text-blue-600' />
            Import Dữ Liệu
          </DialogTitle>
          <DialogDescription>
            Vui lòng chọn file (.xlsx, .csv) để tải lên hệ thống.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className='space-y-4 py-4'>
          {/* File Input */}
          <div className='space-y-2'>
            <Label htmlFor='file-upload'>Chọn file</Label>

            {/* Hidden file input */}
            <Input
              ref={fileInputRef}
              id='file-upload'
              type='file'
              accept='.xlsx,.csv,.xls'
              onChange={handleFileChange}
              className='hidden'
              disabled={isUploading}
            />

            {/* Custom file input button */}
            {!selectedFile ? (
              <Button
                type='button'
                variant='outline'
                className='w-full h-32 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50 transition-colors'
                onClick={handleBrowseFile}
                disabled={isUploading}
              >
                <div className='flex flex-col items-center gap-2'>
                  <FileSpreadsheet className='h-10 w-10 text-slate-400' />
                  <span className='text-sm text-slate-600'>
                    Click để chọn file
                  </span>
                  <span className='text-xs text-slate-400'>
                    Hỗ trợ: .xlsx, .csv (Tối đa 10MB)
                  </span>
                </div>
              </Button>
            ) : (
              /* Selected file display */
              <div className='border-2 border-green-200 bg-green-50 rounded-lg p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-start gap-3 flex-1'>
                    <FileSpreadsheet className='h-10 w-10 text-green-600 shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-slate-900 truncate'>
                        {selectedFile.name}
                      </p>
                      <p className='text-xs text-slate-500 mt-1'>
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>

                  {/* Remove file button */}
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 hover:bg-red-100'
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    <X className='h-4 w-4 text-red-600' />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Help text */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
            <p className='text-xs text-blue-800'>
              <strong>Lưu ý:</strong> File tải lên phải đúng định dạng mẫu. Vui
              lòng tải file mẫu trước khi import dữ liệu.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={handleCancel}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            type='button'
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Tải lên
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
