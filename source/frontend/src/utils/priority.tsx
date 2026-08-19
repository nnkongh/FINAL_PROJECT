import { ChevronUp, ChevronDown, Equal } from 'lucide-react'

export type PriorityLevel = 'high' | 'medium' | 'low'

interface PriorityConfig {
  icon: React.ReactNode
  label: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}

/**
 * Get priority configuration with icon, colors, and label (JIRA style)
 */
export const getPriorityConfig = (priority?: string): PriorityConfig => {
  switch (priority) {
    case 'high':
      return {
        icon: (
          <ChevronUp className='h-3.5 w-3.5 text-orange-500' strokeWidth={3} />
        ),
        label: 'High',
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      }
    case 'medium':
      return {
        icon: <Equal className='h-3.5 w-3.5 text-yellow-500' strokeWidth={3} />,
        label: 'Medium',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700'
      }
    case 'low':
      return {
        icon: (
          <ChevronDown className='h-3.5 w-3.5 text-blue-500' strokeWidth={3} />
        ),
        label: 'Low',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      }
    default:
      return {
        icon: <Equal className='h-3.5 w-3.5 text-slate-400' strokeWidth={2} />,
        label: 'None',
        color: 'text-slate-400',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200',
        textColor: 'text-slate-700'
      }
  }
}

/**
 * Priority options for dropdown menu
 */
export const PRIORITY_OPTIONS: { value: PriorityLevel; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
]
