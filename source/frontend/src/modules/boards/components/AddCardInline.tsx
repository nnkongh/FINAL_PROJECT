import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import InlineCreateCardForm from './InlineCreateCardForm'

interface AddCardInlineProps {
  columnId: string
  boardId: string
}

export default function AddCardInline({
  columnId,
  boardId
}: AddCardInlineProps) {
  const [isAdding, setIsAdding] = useState(false)

  if (isAdding) {
    return (
      <InlineCreateCardForm
        columnId={columnId}
        boardId={boardId}
        onCancel={() => setIsAdding(false)}
      />
    )
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      className='w-full justify-start text-slate-600 hover:bg-slate-100'
      onClick={() => setIsAdding(true)}
    >
      <Plus className='h-4 w-4 mr-2' />
      Thêm công việc
    </Button>
  )
}
