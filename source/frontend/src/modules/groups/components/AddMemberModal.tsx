import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, UserPlus, Check, Search, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc
} from '@/lib/avatar'
import { toast } from 'sonner'
import {
  searchUsersAPI,
  type SearchUserResponse
} from '@/modules/user/api/user.api'

export type User = SearchUserResponse

type MemberRole = 'Member' | 'Leader'

interface AddMemberPayload {
  userId: number
  role: MemberRole
}

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: number
  groupName?: string
  currentUserId?: number
  existingMemberIds?: number[]
  onConfirm?: (payload: AddMemberPayload) => Promise<void> | void
}

export default function AddMemberModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  currentUserId,
  existingMemberIds,
  onConfirm
}: AddMemberModalProps) {
  const [openCombobox, setOpenCombobox] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [selectedRole, setSelectedRole] = useState<MemberRole>('Member')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const debouncedSearch = useDebounce(searchValue, 450)

  useEffect(() => {
    if (!isOpen) {
      setOpenCombobox(false)
      setSearchValue('')
      setSelectedUsers([])
      setSelectedRole('Member')
      setUsers([])
      setIsSearching(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (searchValue.trim().length === 0) {
      setOpenCombobox(false)
    }
  }, [searchValue])

  useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      const keyword = debouncedSearch.trim()
      if (!keyword) {
        if (isMounted) {
          setUsers([])
          setIsSearching(false)
        }
        return
      }

      setIsSearching(true)
      try {
        const result = await searchUsersAPI(keyword)
        if (isMounted) setUsers(result)
      } catch (error: any) {
        if (isMounted) setUsers([])
        toast.error('Không tìm được người dùng', {
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Vui lòng thử lại sau.'
        })
      } finally {
        if (isMounted) setIsSearching(false)
      }
    }
    fetchUsers()
    return () => {
      isMounted = false
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (selectedUsers.length > 1 && selectedRole === 'Leader') {
      setSelectedRole('Member')
    }
  }, [selectedUsers, selectedRole])

  const excludedUserIds = useMemo(() => {
    const excluded = new Set<number>()

    if (Number.isFinite(currentUserId)) {
      excluded.add(Number(currentUserId))
    }

    if (Array.isArray(existingMemberIds)) {
      existingMemberIds
        .map(id => Number(id))
        .filter(id => Number.isFinite(id) && id > 0)
        .forEach(id => excluded.add(id))
    }

    selectedUsers
      .map(user => Number(user.id))
      .filter(id => Number.isFinite(id) && id > 0)
      .forEach(id => excluded.add(id))

    return excluded
  }, [currentUserId, existingMemberIds, selectedUsers])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const userId = Number(user.id)
      if (!Number.isFinite(userId) || userId <= 0) return false
      return !excludedUserIds.has(userId)
    })
  }, [excludedUserIds, users])

  const hasNoResult = useMemo(() => {
    return (
      debouncedSearch.trim().length > 0 &&
      !isSearching &&
      filteredUsers.length === 0
    )
  }, [debouncedSearch, filteredUsers.length, isSearching])

  const toggleSelectUser = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id)
      if (isSelected) {
        return prev
      }
      return [...prev, user]
    })
    setOpenCombobox(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const removeSelectedUser = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedUsers(prev => prev.filter(u => u.id !== id))
    if (searchValue.trim().length > 0) {
      setOpenCombobox(true)
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const handleClose = () => {
    if (isSubmitting) return
    setOpenCombobox(false)
    setSearchValue('')
    setSelectedUsers([])
    setSelectedRole('Member')
    setUsers([])
    onClose()
  }

  const handleConfirm = async () => {
    if (selectedUsers.length === 0) return

    setIsSubmitting(true)
    try {
      if (onConfirm) {
        for (const user of selectedUsers) {
          const payload: AddMemberPayload = {
            userId: user.id,
            role: selectedRole
          }
          await onConfirm(payload)
        }
      }
      handleClose()
      toast.success('Thêm thành viên thành công', {
        description: `Đã thêm ${selectedUsers.length} thành viên vào nhóm.`
      })
    } catch (error: any) {
      toast.error('Thêm thành viên thất bại', {
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className='w-[95vw] max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserPlus className='h-5 w-5 text-blue-600' />
            Thêm thành viên mới
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm theo tên hoặc email để thêm thành viên vào nhóm{' '}
            <span className='font-semibold text-foreground'>{groupName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='member-search'>Thành viên </Label>

            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <div
                  ref={triggerRef}
                  className={cn(
                    'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !isSubmitting && setOpenCombobox(true)}
                >
                  {selectedUsers.map(user => (
                    <span
                      key={user.id}
                      className='flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground'
                    >
                      {user.fullName}
                      <button
                        type='button'
                        onClick={e => removeSelectedUser(user.id, e)}
                        className='ml-1 rounded-full outline-none hover:bg-muted-foreground/20 focus:bg-muted-foreground/20'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </span>
                  ))}

                  <div className='flex flex-1 items-center gap-2 min-w-37.5'>
                    {selectedUsers.length === 0 && (
                      <Search className='h-4 w-4 shrink-0 opacity-50' />
                    )}
                    <input
                      id='member-search'
                      ref={inputRef}
                      className='flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed'
                      placeholder={
                        selectedUsers.length === 0
                          ? 'Nhập tên, mssv hoặc email...'
                          : 'Thêm người khác...'
                      }
                      value={searchValue}
                      disabled={isSubmitting}
                      autoComplete='off'
                      onChange={e => {
                        setSearchValue(e.target.value)
                        setOpenCombobox(true)
                      }}
                      onFocus={() => {
                        if (!isSubmitting) setOpenCombobox(true)
                      }}
                      onBlur={() => {
                        requestAnimationFrame(() => {
                          const activeElement =
                            document.activeElement as Node | null

                          const inTrigger =
                            !!activeElement &&
                            triggerRef.current?.contains(activeElement)
                          const inDropdown =
                            !!activeElement &&
                            dropdownRef.current?.contains(activeElement)

                          if (!inTrigger && !inDropdown) {
                            setSearchValue('')
                            setOpenCombobox(false)
                          }
                        })
                      }}
                    />
                  </div>
                </div>
              </PopoverTrigger>

              <PopoverContent
                ref={dropdownRef}
                className='w-(--radix-popover-trigger-width) p-0'
                align='start'
                onOpenAutoFocus={e => e.preventDefault()}
                onInteractOutside={event => {
                  const target = event.target as Node | null
                  if (target && triggerRef.current?.contains(target)) {
                    event.preventDefault()
                    return
                  }
                  setSearchValue('')
                  setOpenCombobox(false)
                }}
              >
                <Command>
                  <CommandList>
                    {isSearching && (
                      <div className='px-3 py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Đang tìm kiếm...
                      </div>
                    )}

                    {hasNoResult && (
                      <div className='px-3 py-4 text-center text-sm text-muted-foreground'>
                        Không tìm thấy thành viên phù hợp.
                      </div>
                    )}

                    {!isSearching && filteredUsers.length > 0 && (
                      <CommandGroup>
                        <div className='px-2 py-1.5 text-xs font-medium text-muted-foreground'>
                          Kết quả tìm kiếm
                        </div>

                        {filteredUsers.map(user => {
                          const isSelected = selectedUsers.some(
                            u => u.id === user.id
                          )
                          return (
                            <CommandItem
                              key={user.id}
                              value={`${user.fullName}-${user.email}-${user.userCode || ''}`}
                              onSelect={() => toggleSelectUser(user)}
                              className='flex items-center gap-3 py-2 cursor-pointer'
                            >
                              <Avatar className='h-9 w-9'>
                                <AvatarImage
                                  src={getAvatarSrc(user.avatarUrl)}
                                  alt={user.fullName}
                                />
                                <AvatarFallback
                                  className={`${getAvatarColorClass(user.fullName)} text-xs text-white font-medium`}
                                >
                                  {getAvatarFallback(user.fullName)}
                                </AvatarFallback>
                              </Avatar>

                              <div className='flex-1 min-w-0'>
                                <p className='truncate text-sm font-semibold text-foreground'>
                                  {user.fullName}
                                </p>
                                <p className='truncate text-xs text-muted-foreground'>
                                  {user.email}
                                </p>
                                <p className='truncate text-xs text-slate-500'>
                                  MSSV: {user.userCode || '-'}
                                </p>
                              </div>

                              <Check
                                className={cn(
                                  'h-4 w-4 text-blue-600 transition-opacity',
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='member-role'>Vai trò </Label>
            <Select
              value={selectedRole}
              onValueChange={value => setSelectedRole(value as MemberRole)}
              disabled={isSubmitting}
            >
              <SelectTrigger id='member-role'>
                <SelectValue placeholder='Chọn vai trò' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Member'>Thành viên</SelectItem>
                <SelectItem value='Leader' disabled={selectedUsers.length > 1}>
                  Trưởng nhóm
                </SelectItem>
              </SelectContent>
            </Select>
            {selectedUsers.length > 1 && (
              <p className='text-[13px] text-muted-foreground'>
                Chỉ có thể chọn 1 người làm Trưởng nhóm. Đã chuyển quyền về
                Thành viên.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-row'>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            Hủy
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={selectedUsers.length === 0 || isSubmitting}
            className='w-full sm:w-auto'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang thêm...
              </>
            ) : (
              `Thêm ${selectedUsers.length > 0 ? selectedUsers.length : ''} thành viên`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
