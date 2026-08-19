import { useState } from 'react'
import {
  requestAI,
  parsePriorityLevel,
  type AIActionType,
  type AIRequest,
  type PriorityLevel
} from '../api/chatbotApi'

export interface EstimateResult {
  value: number
  unit: string
  label: string
  days: number
}

const unitToDays = (value: number, unit: string): number => {
  const normalized = unit.toLowerCase()
  if (['ngày', 'day', 'days'].includes(normalized)) return value
  if (['tuần', 'week', 'weeks'].includes(normalized)) return value * 7
  if (['tháng', 'month', 'months'].includes(normalized)) return value * 30
  if (['giờ', 'hour', 'hours'].includes(normalized))
    return Math.ceil(value / 24)
  return value
}

export const parseSubtasks = (text: string): string[] => {
  if (!text) return []

  return text
    .split(/\r?\n|•|\*\s+|\d+\.|-\s+/g)
    .map(item => item.replace(/^[-\s]+/, '').trim())
    .filter(Boolean)
}

export const extractEstimate = (text: string): EstimateResult | null => {
  if (!text) return null

  const unitPattern = 'ngày|tuần|tháng|giờ|day|week|month|hour'
  const numPattern = '\\d+(?:[.,]\\d+)?'

  // Match ranges: "60 - 90 giờ", "2 đến 4 tuần", "3–5 ngày"
  const rangeMatch = text.match(
    new RegExp(
      `(${numPattern})\\s*(?:-|–|đến|to)\\s*(${numPattern})\\s*(${unitPattern})s?`,
      'i'
    )
  )

  if (rangeMatch) {
    const lo = Number(rangeMatch[1].replace(',', '.'))
    const hi = Number(rangeMatch[2].replace(',', '.'))
    const unit = rangeMatch[3]
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null
    const avg = (lo + hi) / 2
    const days = unitToDays(avg, unit)
    return {
      value: avg,
      unit,
      label: `${lo}–${hi} ${unit}`,
      days: Math.ceil(days)
    }
  }

  // Match single value: "2 tuần", "3 ngày"
  const singleMatch = text.match(
    new RegExp(`(${numPattern})\\s*(${unitPattern})s?`, 'i')
  )

  if (!singleMatch) return null

  const rawValue = Number(singleMatch[1].replace(',', '.'))
  if (!Number.isFinite(rawValue) || rawValue <= 0) return null

  const unit = singleMatch[2]
  const days = unitToDays(rawValue, unit)

  return {
    value: rawValue,
    unit,
    label: `${rawValue} ${unit}`,
    days: Math.ceil(days)
  }
}

export interface ChatbotResult {
  actionType: AIActionType
  rawText: string
  // Parsed convenience fields
  subtasks?: string[]
  estimate?: EstimateResult | null
  priority?: PriorityLevel | null
}

export interface AIParsedResult {
  value: string
  reasoning: string
}

const cleanReasoning = (text: string): string => {
  return text
    .replace(/^[\s\-–—:]+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export const parseAIResponse = (
  text: string,
  actionType: AIActionType
): AIParsedResult | null => {
  if (!text) return null

  if (actionType === 'priority') {
    const normalized = text.toLowerCase()

    const priorityMatch =
      /(cao|high|khẩn|urgent)|((trung\s*bình|medium|normal|vừa))|(thấp|low|minor|nhỏ)/i.exec(
        normalized
      )

    if (!priorityMatch) return null

    let value = 'Trung bình'
    if (priorityMatch[1]) value = 'Cao'
    if (priorityMatch[4]) value = 'Trung bình'
    if (priorityMatch[6]) value = 'Thấp'

    const reasoning = cleanReasoning(text.replace(priorityMatch[0], '').trim())

    return {
      value,
      reasoning: reasoning || text
    }
  }

  if (actionType === 'estimate') {
    const estimate = extractEstimate(text)
    if (!estimate) return null

    const unitPattern = 'ngày|tuần|tháng|giờ|day|week|month|hour'
    const numPattern = '\\d+(?:[.,]\\d+)?'
    const rangeRegex = new RegExp(
      `(${numPattern})\\s*(?:-|–|đến|to)\\s*(${numPattern})\\s*(${unitPattern})s?`,
      'i'
    )
    const singleRegex = new RegExp(`(${numPattern})\\s*(${unitPattern})s?`, 'i')

    const match = text.match(rangeRegex) || text.match(singleRegex)
    const reasoning = cleanReasoning(match ? text.replace(match[0], '') : text)

    return {
      value: estimate.label,
      reasoning: reasoning || text
    }
  }

  return null
}

export const useChatbot = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<AIActionType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAction = async (
    payload: AIRequest
  ): Promise<ChatbotResult | null> => {
    setIsLoading(true)
    setActiveAction(payload.actionType)
    setError(null)

    try {
      const rawText = await requestAI(payload)

      if (!rawText) return null

      const result: ChatbotResult = { actionType: payload.actionType, rawText }

      // Parse structured data per action type
      if (payload.actionType === 'subtasks') {
        result.subtasks = parseSubtasks(rawText)
      } else if (payload.actionType === 'estimate') {
        result.estimate = extractEstimate(rawText)
      } else if (payload.actionType === 'priority') {
        result.priority = parsePriorityLevel(rawText)
      }

      return result
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi khi gọi AI. Thử lại sau.'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  return {
    isLoading,
    activeAction,
    error,
    runAction
  }
}
