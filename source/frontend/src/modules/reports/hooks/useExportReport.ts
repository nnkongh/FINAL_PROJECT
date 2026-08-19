import { useState } from 'react'
import {
  downloadReportAPI,
  generateReportAPI,
  type ReportId
} from '../api/reportApi'

const isPdfBase64 = (value: string): boolean => {
  const normalized = value.trim()
  return (
    normalized.startsWith('data:application/pdf;base64,') ||
    normalized.startsWith('JVBERi')
  )
}

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

const downloadBase64Pdf = (rawBase64: string, fileName: string) => {
  const normalized = rawBase64
    .replace('data:application/pdf;base64,', '')
    .replace(/\s/g, '')

  const binary = window.atob(normalized)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  const blob = new Blob([bytes], { type: 'application/pdf' })
  downloadBlob(blob, fileName)
}

const normalizeReportId = (value: unknown): ReportId | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }

  if (value && typeof value === 'object') {
    const idValue = (value as { id?: unknown }).id
    return normalizeReportId(idValue)
  }

  return null
}

const resolveReportId = (payload: unknown): ReportId | null => {
  if (!payload || typeof payload !== 'object') return null

  const response = payload as {
    value?: unknown
    id?: unknown
  }

  const candidates = [response?.value, response?.id]

  for (const candidate of candidates) {
    const normalized = normalizeReportId(candidate)
    if (normalized !== null) {
      return normalized
    }
  }

  return null
}

const resolveRawValue = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') return undefined

  const response = payload as {
    value?: unknown
    data?: { value?: unknown }
  }

  return response?.value ?? response?.data?.value
}

export const useExportReport = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportAndDownload = async (groupId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const generateResponse = await generateReportAPI(groupId)
      const generatedValue = resolveRawValue(generateResponse?.data)

      if (typeof generatedValue === 'string' && isPdfBase64(generatedValue)) {
        downloadBase64Pdf(generatedValue, `Report_Group_${groupId}.pdf`)
        return
      }

      const reportId = resolveReportId(generateResponse?.data)

      if (!reportId) {
        throw new Error('Không lấy được reportId từ phản hồi tạo báo cáo')
      }

      const downloadResponse = await downloadReportAPI(reportId)
      const blob = downloadResponse.data as Blob
      downloadBlob(blob, `Report_Group_${groupId}.pdf`)
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
