import api from '@/lib/axios'

export type AIActionType = 'description' | 'subtasks' | 'estimate' | 'priority'

export type PriorityLevel = 'low' | 'medium' | 'high'

export interface AIRequest {
  actionType: AIActionType
  taskTitle: string
  taskDescription?: string | null
}

// Recursively search for a string value in nested objects
const deepExtractText = (payload: unknown, depth = 0): string => {
  if (depth > 4) return ''
  if (typeof payload === 'string' && payload.trim()) return payload.trim()
  if (!payload || typeof payload !== 'object') return ''

  const knownKeys = [
    'data',
    'value',
    'result',
    'message',
    'content',
    'text',
    'response',
    'output'
  ]

  for (const key of knownKeys) {
    const val = (payload as Record<string, unknown>)[key]
    const found = deepExtractText(val, depth + 1)
    if (found) return found
  }

  // Fallback: try all string values of the object
  for (const val of Object.values(payload as Record<string, unknown>)) {
    if (typeof val === 'string' && val.trim()) return val.trim()
  }

  return ''
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generous timeouts — AI responses can take 20-40s. Add buffer above Postman baseline.
const TIMEOUT_MS: Record<AIActionType, number> = {
  description: 60_000,
  subtasks: 90_000,
  estimate: 60_000,
  priority: 60_000
}

const MAX_RETRIES = 2
const RETRYABLE_STATUSES = [503, 502, 504]

export const requestAI = async (body: AIRequest): Promise<string> => {
  const cleanBody: AIRequest = {
    ...body,
    // Never send null — omit the field entirely so backend doesn't choke
    taskDescription: body.taskDescription?.trim() || undefined
  }

  const timeoutMs = TIMEOUT_MS[body.actionType]

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Use axios timeout option (cleaner than AbortController for simple cases)
      const response = await api.post('/ai/support', cleanBody, {
        timeout: timeoutMs
      })

      return deepExtractText(response.data)
    } catch (err: unknown) {
      const isLast = attempt === MAX_RETRIES

      const axiosErr = err as {
        response?: { status?: number }
        code?: string
        message?: string
      }

      const status = axiosErr?.response?.status
      // ECONNABORTED = axios timeout; ERR_CANCELED = AbortController
      const isTimeout =
        axiosErr?.code === 'ECONNABORTED' || axiosErr?.code === 'ERR_CANCELED'

      if (isTimeout) {
        if (isLast)
          throw new Error(`Yêu cầu AI mất quá nhiều thời gian. Hãy thử lại.`)
        await sleep(2_000)
        continue
      }

      if (status && RETRYABLE_STATUSES.includes(status)) {
        if (isLast)
          throw new Error(
            `Dịch vụ AI tạm thời không khả dụng (${status}). Thử lại sau.`
          )
        await sleep(2_000 * (attempt + 1))
        continue
      }

      throw err
    }
  }

  return ''
}

// Map Vietnamese/English priority text → PriorityLevel enum
export const parsePriorityLevel = (text: string): PriorityLevel | null => {
  const lower = text.toLowerCase()

  if (/\b(cao|high|urgent|khẩn)\b/.test(lower)) return 'high'
  if (/\b(trung.?bình|medium|normal|vừa)\b/.test(lower)) return 'medium'
  if (/\b(thấp|low|minor|nhỏ)\b/.test(lower)) return 'low'

  // Fallback: first word match
  if (/cao|high/.test(lower)) return 'high'
  if (/thấp|low/.test(lower)) return 'low'
  if (/trung|medium/.test(lower)) return 'medium'

  return null
}
