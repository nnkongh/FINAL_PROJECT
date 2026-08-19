import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-slate-950',
      className
    )}
    {...props}
  />
))
Command.displayName = 'Command'

interface CommandInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  onValueChange?: (value: string) => void
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onValueChange, ...props }, ref) => (
    <div className='flex items-center border-b px-3'>
      <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onChange={e => onValueChange?.(e.target.value)}
        {...props}
      />
    </div>
  )
)
CommandInput.displayName = 'CommandInput'

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('max-h-75 overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))
CommandList.displayName = 'CommandList'

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('py-6 text-center text-sm text-slate-500', className)}
    {...props}
  />
))
CommandEmpty.displayName = 'CommandEmpty'

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('overflow-hidden p-1', className)} {...props} />
))
CommandGroup.displayName = 'CommandGroup'

interface CommandItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> {
  value?: string
  onSelect?: (value: string) => void
}

const CommandItem = React.forwardRef<HTMLButtonElement, CommandItemProps>(
  ({ className, value = '', onSelect, onClick, ...props }, ref) => (
    <button
      ref={ref}
      type='button'
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        className
      )}
      onClick={event => {
        onSelect?.(value)
        onClick?.(event)
      }}
      {...props}
    />
  )
)
CommandItem.displayName = 'CommandItem'

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 h-px bg-slate-200', className)}
    {...props}
  />
))
CommandSeparator.displayName = 'CommandSeparator'

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator
}
