import api from '~/lib/axios'

/**
 * Upload file to import data into the system
 * @param file - File to upload (.xlsx, .csv)
 * @returns Promise with API response
 */
export const importFileAPI = async (file: File) => {
  try {
    // Create FormData to send file as multipart/form-data
    const formData = new FormData()
    formData.append('file', file)

    // Make POST request with multipart/form-data content type
    const response = await api.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    console.error('Import file error:', error)
    throw error
  }
}

/**
 * Validate file type for import
 * @param file - File to validate
 * @returns boolean
 */
export const validateImportFile = (file: File): boolean => {
  const allowedExtensions = ['.xlsx', '.csv', '.xls']
  const fileName = file.name.toLowerCase()

  return allowedExtensions.some(ext => fileName.endsWith(ext))
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
