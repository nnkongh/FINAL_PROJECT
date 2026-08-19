import api from '@/lib/axios'

export interface TaskCommentDto {
  id: number
  taskId: number
  content: string
  userId: number
  parentCommentId?: number | null
  userName?: string
  userAvatarUrl?: string | null
  replies?: TaskCommentDto[]
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
}

interface ListEnvelope {
  value?: TaskCommentDto[]
  data?: TaskCommentDto[]
}

interface SingleEnvelope {
  value?: TaskCommentDto
  data?: TaskCommentDto
}

interface MutationStatusEnvelope {
  isSuccess?: boolean
  isFailure?: boolean
  error?: {
    code?: string
    message?: string
  }
}

const getMutationFailureMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }

  const envelope = payload as MutationStatusEnvelope
  const isExplicitFailure =
    envelope.isFailure === true || envelope.isSuccess === false

  if (!isExplicitFailure) {
    return null
  }

  return envelope.error?.message || 'Yêu cầu xử lý bình luận thất bại'
}

const normalizeList = (payload: unknown): TaskCommentDto[] => {
  if (Array.isArray(payload)) return payload as TaskCommentDto[]

  const envelope = payload as ListEnvelope | null | undefined
  if (Array.isArray(envelope?.value)) return envelope.value
  if (Array.isArray(envelope?.data)) return envelope.data

  return []
}

const normalizeSingle = (payload: unknown): TaskCommentDto | null => {
  if (!payload || Array.isArray(payload)) return null

  const envelope = payload as SingleEnvelope | TaskCommentDto
  if ('id' in envelope && typeof envelope.id === 'number') {
    return envelope as TaskCommentDto
  }

  if (
    'value' in envelope &&
    envelope.value &&
    typeof envelope.value.id === 'number'
  ) {
    return envelope.value
  }

  if (
    'data' in envelope &&
    envelope.data &&
    typeof envelope.data.id === 'number'
  ) {
    return envelope.data
  }

  return null
}

export interface CreateCommentPayload {
  taskId: number
  content: string
  parentCommentId?: number // Swagger yêu cầu gửi lên parentCommentId (mặc định là 0 nếu không reply)
}

export interface UpdateCommentPayload {
  content: string
}

export const getTaskCommentsAPI = async (
  taskId: number
): Promise<TaskCommentDto[]> => {
  // SỬA LỖI 404: Đổi thành /comments (có 's' ở cuối)
  const response = await api.get<TaskCommentDto[] | ListEnvelope>(
    `/task/${taskId}/comments`
  )
  return normalizeList(response.data)
}

export const createTaskCommentAPI = async (
  payload: CreateCommentPayload
): Promise<TaskCommentDto> => {
  const requestBody: {
    content: string
    parentCommentId?: number
  } = {
    content: payload.content
  }

  if (
    typeof payload.parentCommentId === 'number' &&
    payload.parentCommentId > 0
  ) {
    requestBody.parentCommentId = payload.parentCommentId
  }

  const response = await api.post<TaskCommentDto | SingleEnvelope>(
    `/task/${payload.taskId}/comment`,
    requestBody
  )

  const normalized = normalizeSingle(response.data)
  if (!normalized) {
    throw new Error('Không thể parse dữ liệu comment vừa tạo')
  }

  return normalized
}

export const updateTaskCommentAPI = async (
  commentId: number,
  payload: UpdateCommentPayload
): Promise<void> => {
  const response = await api.put<
    TaskCommentDto | SingleEnvelope | MutationStatusEnvelope
  >(`/comment/${commentId}`, payload)

  const failureMessage = getMutationFailureMessage(response.data)
  if (failureMessage) {
    throw new Error(failureMessage)
  }
}

export const deleteTaskCommentAPI = async (
  commentId: number
): Promise<void> => {
  const response = await api.delete<MutationStatusEnvelope>(
    `/comment/${commentId}`
  )

  const failureMessage = getMutationFailureMessage(response.data)
  if (failureMessage) {
    throw new Error(failureMessage)
  }
}

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('Không thể đọc file ảnh'))
    }

    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'))
    reader.readAsDataURL(file)
  })
}

export const uploadImageAPI = async (file: File): Promise<string> => {
  const dataUrl = await readFileAsDataUrl(file)

  await new Promise(resolve => {
    setTimeout(resolve, 900)
  })

  // TODO: Thay thế bằng API upload ảnh thật từ backend
  return dataUrl
}
