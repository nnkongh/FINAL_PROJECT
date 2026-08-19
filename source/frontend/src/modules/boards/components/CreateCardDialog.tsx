import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  useCreateGroupTask,
  useGetGroupMemberOptions
} from '../hooks/useBoardHooks'
import { toast } from 'sonner'
import { formatDueDateForSubmit } from '@/utils/boardFormatters'

interface CreateCardDialogProps {
  trigger?: React.ReactNode
  groupId: number
}

const mapPriorityToApi = (
  value: 'low' | 'medium' | 'high'
): 'Low' | 'Medium' | 'High' => {
  if (value === 'high') return 'High'
  if (value === 'low') return 'Low'
  return 'Medium'
}

export default function CreateCardDialog({
  trigger,
  groupId
}: CreateCardDialogProps) {
  const [open, setOpen] = useState(false)
  const { mutateAsync: createTaskMutateAsync, isPending } =
    useCreateGroupTask(groupId)
  const { data: members = [] } = useGetGroupMemberOptions(groupId)
  const activeMembers = members.filter(member => member.isActive !== false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>('0')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || groupId <= 0 || isPending) return

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: mapPriorityToApi(priority),
        taskStatus: 'ToDo' as const,
        dueDate: formatDueDateForSubmit(dueDate) ?? null,
        assignedTo:
          assignedTo === '' ||
          assignedTo === '0' ||
          assignedTo === undefined ||
          assignedTo === null
            ? null
            : Number(assignedTo)
      }

      await createTaskMutateAsync(payload)

      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setAssignedTo('0')
      setOpen(false)
    } catch (error) {
      toast.error('Không thể tạo task', {
        description: 'Vui lòng thử lại sau.'
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setAssignedTo('0')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            Create Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Card</DialogTitle>
            <DialogDescription>
              Add a new card to your board and fill in the details.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            {/* Title Input */}
            <div className='grid gap-2'>
              <Label htmlFor='title'>Title *</Label>
              <Input
                id='title'
                placeholder='Enter card title...'
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            {/* Description Textarea */}
            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Add a more detailed description...'
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isPending}
                rows={4}
              />
            </div>

            {/* Priority Select */}
            <div className='grid gap-2'>
              <Label htmlFor='priority'>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value: string) =>
                  setPriority(value as 'low' | 'medium' | 'high')
                }
                disabled={isPending}
              >
                <SelectTrigger id='priority'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>🔽 Low</SelectItem>
                  <SelectItem value='medium'>➖ Medium</SelectItem>
                  <SelectItem value='high'>🔼 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='dueDate'>Due date</Label>
                <Input
                  id='dueDate'
                  type='date'
                  value={dueDate}
                  onChange={event => setDueDate(event.target.value)}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='assignedTo'>Assignee</Label>
              <Select
                value={assignedTo}
                onValueChange={setAssignedTo}
                disabled={isPending}
              >
                <SelectTrigger id='assignedTo'>
                  <SelectValue placeholder='Select assignee' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Unassigned</SelectItem>
                  {activeMembers.map(member => (
                    <SelectItem
                      key={member.userId}
                      value={String(member.userId)}
                    >
                      {member.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='flex-col gap-2 sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isPending}
              className='w-full sm:w-auto'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!title.trim() || isPending}
              className='w-full sm:w-auto'
            >
              {isPending ? 'Creating...' : 'Create Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
