import { Sparkles, List, Clock, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  parseAIResponse,
  useChatbot,
  type AIParsedResult,
  type ChatbotResult
} from '../hooks/useChatbot'
import type { AIActionType } from '../api/chatbotApi'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import AIRecommendation from './AIRecommendation'

interface AIAssistantProps {
  taskTitle: string
  taskDescription?: string
  onResult: (result: ChatbotResult) => void
}

const ACTIONS: Array<{
  key: AIActionType
  label: string
  icon: ReactNode
}> = [
  {
    key: 'description',
    label: 'Mô tả AI',
    icon: <Sparkles className='h-4 w-4' />
  },
  {
    key: 'subtasks',
    label: 'Phân rã việc',
    icon: <List className='h-4 w-4' />
  },
  { key: 'estimate', label: 'Ước tính', icon: <Clock className='h-4 w-4' /> },
  { key: 'priority', label: 'Ưu tiên', icon: <Shield className='h-4 w-4' /> }
]

export default function AIAssistant({
  taskTitle,
  taskDescription,
  onResult
}: AIAssistantProps) {
  const { isLoading, activeAction, runAction } = useChatbot()
  const [recommendation, setRecommendation] = useState<AIParsedResult | null>(
    null
  )
  const [pendingResult, setPendingResult] = useState<ChatbotResult | null>(null)
  const [recommendationType, setRecommendationType] = useState<
    'priority' | 'estimate'
  >('priority')

  const handleAction = async (action: AIActionType) => {
    const result = await runAction({
      actionType: action,
      taskTitle,
      taskDescription: taskDescription || undefined
    })

    if (!result?.rawText) {
      toast.error('Không nhận được nội dung từ AI')
      return
    }

    if (action === 'priority' || action === 'estimate') {
      const parsed = parseAIResponse(result.rawText, action)

      if (!parsed) {
        toast.error('Không thể tách kết quả từ nội dung AI')
        return
      }

      setRecommendation(parsed)
      setPendingResult(result)
      setRecommendationType(action)
      return
    }

    setRecommendation(null)
    setPendingResult(null)
    onResult(result)
  }

  const handleApplyRecommendation = () => {
    if (!pendingResult) return
    onResult(pendingResult)
    setRecommendation(null)
    setPendingResult(null)
  }

  const handleCloseRecommendation = () => {
    setRecommendation(null)
    setPendingResult(null)
  }

  return (
    <div>
      <div className='flex flex-wrap gap-2 rounded-md border border-purple-100 bg-purple-50/40 p-2'>
        {ACTIONS.map(action => (
          <Button
            key={action.key}
            type='button'
            variant='outline'
            size='sm'
            className='h-8 gap-2 border-purple-200 bg-white text-purple-700 hover:border-purple-300 hover:bg-purple-50'
            onClick={() => handleAction(action.key)}
            disabled={isLoading}
          >
            {activeAction === action.key ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              action.icon
            )}
            {action.label}
          </Button>
        ))}
      </div>

      {recommendation && (
        <AIRecommendation
          value={recommendation.value}
          reasoning={recommendation.reasoning}
          onApply={handleApplyRecommendation}
          onClose={handleCloseRecommendation}
          type={recommendationType}
        />
      )}
    </div>
  )
}
