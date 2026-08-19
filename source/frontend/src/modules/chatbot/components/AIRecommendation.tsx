import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Info, X } from 'lucide-react'

interface AIRecommendationProps {
  value: string
  reasoning: string
  onApply: () => void
  onClose: () => void
  type: 'priority' | 'estimate'
}

const getBadgeStyles = (type: AIRecommendationProps['type'], value: string) => {
  if (type === 'estimate') {
    return 'bg-purple-100 text-purple-700 border-purple-200'
  }

  const normalized = value.toLowerCase()

  if (normalized.includes('cao') || normalized.includes('high')) {
    return 'bg-red-100 text-red-700 border-red-200'
  }
  if (normalized.includes('trung')) {
    return 'bg-amber-100 text-amber-700 border-amber-200'
  }

  return 'bg-emerald-100 text-emerald-700 border-emerald-200'
}

export default function AIRecommendation({
  value,
  reasoning,
  onApply,
  onClose,
  type
}: AIRecommendationProps) {
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 20)
    return () => window.clearTimeout(id)
  }, [])

  const isLong = reasoning.length > 160
  const badgeClass = useMemo(() => getBadgeStyles(type, value), [type, value])

  return (
    <div
      className={`mt-3 rounded-md border border-dashed border-purple-200 bg-purple-50/40 p-3 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Info className='h-4 w-4 text-purple-600' />
          <Badge className={`border ${badgeClass}`}>{value}</Badge>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            size='sm'
            className='h-8 gap-1 bg-purple-600 text-white hover:bg-purple-700'
            onClick={onApply}
          >
            <CheckCircle className='h-4 w-4' />
            Áp dụng
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-slate-500 hover:text-slate-700'
            onClick={onClose}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <p
        className={`mt-2 text-sm italic text-slate-600 ${
          expanded ? '' : 'line-clamp-2'
        }`}
      >
        {reasoning}
      </p>
      {isLong && (
        <button
          type='button'
          className='mt-1 text-xs font-semibold text-purple-600 hover:text-purple-700'
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  )
}
