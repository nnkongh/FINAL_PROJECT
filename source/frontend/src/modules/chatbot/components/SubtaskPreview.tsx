import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubtaskPreviewProps {
  lines: string[]
  onApply: (markdown: string) => void
  onClose?: () => void
}

interface SubtaskItem {
  id: string
  title: string
  selected: boolean
}

export default function SubtaskPreview({
  lines,
  onApply,
  onClose
}: SubtaskPreviewProps) {
  const initialItems = useMemo<SubtaskItem[]>(
    () =>
      lines.map((line, index) => ({
        id: `${Date.now()}-${index}`,
        title: line.trim(),
        selected: true
      })),
    [lines]
  )

  const [items, setItems] = useState<SubtaskItem[]>(initialItems)

  const handleApply = () => {
    const selected = items.filter(item => item.selected)

    if (selected.length === 0) return

    const markdown = selected.map(item => `- ${item.title}`).join('\n')

    onApply(markdown)
  }

  return (
    <div className='mt-3 rounded-md border border-dashed border-purple-200 bg-purple-50/40 p-3 animate-in fade-in-0 duration-200'>
      <div className='flex items-center justify-between gap-2 mb-2'>
        <div className='text-xs font-semibold text-purple-700 uppercase tracking-wide'>
          Xem trước & chọn công việc con
        </div>
        {onClose && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-7 w-7 p-0 text-slate-500 hover:text-slate-700'
            onClick={onClose}
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      <div className='space-y-2'>
        {items.map(item => (
          <div
            key={item.id}
            className='rounded-md px-2 py-2 transition-colors hover:bg-purple-50'
          >
            <label className='flex items-start gap-2 text-sm text-slate-700'>
              <input
                type='checkbox'
                checked={item.selected}
                onChange={() =>
                  setItems(prev =>
                    prev.map(entry =>
                      entry.id === item.id
                        ? { ...entry, selected: !entry.selected }
                        : entry
                    )
                  )
                }
                className='mt-1'
              />
              <div className='flex-1'>
                <input
                  value={item.title}
                  onChange={event =>
                    setItems(prev =>
                      prev.map(entry =>
                        entry.id === item.id
                          ? { ...entry, title: event.target.value }
                          : entry
                      )
                    )
                  }
                  className='w-full rounded border border-transparent bg-transparent text-sm focus:border-purple-200 focus:bg-white focus:outline-none'
                />
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className='mt-3 flex justify-end'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          className='border-purple-200 text-purple-700 hover:bg-purple-50 gap-2'
          onClick={handleApply}
        >
          <Check className='h-4 w-4' />
          Áp dụng
        </Button>
      </div>
    </div>
  )
}
