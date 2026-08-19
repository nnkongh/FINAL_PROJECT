import type { MouseEvent } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  getPriorityConfig,
  PRIORITY_OPTIONS,
  type PriorityLevel
} from '~/utils/priority'

interface CardPriorityDropdownProps {
  priority?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPriorityChange: (priority: PriorityLevel, event: MouseEvent) => void
}

export default function CardPriorityDropdown({
  priority,
  open,
  onOpenChange,
  onPriorityChange
}: CardPriorityDropdownProps) {
  const priorityConfig = getPriorityConfig(priority)

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border transition-colors hover:shadow-sm ${priorityConfig.bgColor} ${priorityConfig.textColor} ${priorityConfig.borderColor}`}
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
        >
          <span className={priorityConfig.color}>{priorityConfig.icon}</span>
          {priorityConfig.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        onClick={event => event.stopPropagation()}
        onPointerDown={event => event.stopPropagation()}
      >
        {PRIORITY_OPTIONS.map(option => {
          const config = getPriorityConfig(option.value)
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={event => onPriorityChange(option.value, event)}
              onPointerDown={event => event.stopPropagation()}
            >
              <span className={`mr-2 ${config.color}`}>{config.icon}</span>
              <span className={`${config.color} font-medium`}>
                {config.label}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
