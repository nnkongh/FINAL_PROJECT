import { useState } from 'react'
import { exportAllGroupsAPI } from '../api/reportApi'

const downloadBlob = (blob: Blob, fileName: string) => {
  const blobUrl = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}

const normalizeFileName = (className?: string) => {
  const safeName = (className || 'Classroom')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')

  return safeName || 'Classroom'
}

export const useExportAllGroups = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportAndDownload = async (classroomId: number, className?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await exportAllGroupsAPI(classroomId)
      const blob = response.data as Blob
      const fileName = `Report_${normalizeFileName(className)}.zip`
      downloadBlob(blob, fileName)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Xuất báo cáo thất bại. Vui lòng thử lại.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    exportAndDownload
  }
}
