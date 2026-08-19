import { useMemo, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  useDeleteGroupMember,
  useGetGroupMembers,
  useUpdateGroupMemberRole
} from '@/modules/groups/hooks/useGroups'
import { useToast } from '@/hooks/use-toast'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc
} from '@/lib/avatar'

type IdValue = string | number

interface ManageMembersModalProps {
  groupId: IdValue
  currentUserId: IdValue
  currentUserRole: string
  isOpen?: boolean
  onClose?: () => void
  trigger?: ReactNode
  onRoleUpdated?: () => void | Promise<void>
}

interface Member {
  id: number
  userId?: number
  userName?: string
  fullName?: string
  userCode?: string
  role?: string
  avatarUrl?: string | null
  isActive?: boolean
}

interface GroupMembersResponse {
  value?: Member[]
}

const getNumericId = (value?: IdValue | null) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const resolveMemberId = (member: Member) => {
  return getNumericId(member.userId ?? member.id)
}

const resolveMemberName = (member: Member) => {
  return (
    member.userName?.trim() ||
    member.fullName?.trim() ||
    (member.userCode ? `User ${member.userCode}` : '') ||
    'User'
  )
}

export default function ManageMembersModal({
  groupId,
  currentUserId,
  currentUserRole,
  isOpen,
  onClose,
  trigger,
  onRoleUpdated
}: ManageMembersModalProps) {
  const { success, error } = useToast()

  const normalizedGroupId = getNumericId(groupId)
  const normalizedCurrentUserId = getNumericId(currentUserId)
  const normalizedCurrentUserRole = (currentUserRole || '').trim().toLowerCase()
  const isLeader = normalizedCurrentUserRole === 'leader'
  const canManageRole =
    normalizedCurrentUserRole === 'leader' ||
    normalizedCurrentUserRole === 'giangvien'

  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<number | null>(
    null
  )

  const { data: membersResponse, isLoading } =
    useGetGroupMembers(normalizedGroupId)
  const deleteMemberMutation = useDeleteGroupMember(normalizedGroupId)
  const updateMemberRoleMutation = useUpdateGroupMemberRole(normalizedGroupId)

  const members = useMemo(() => {
    const payload = membersResponse as
      | GroupMembersResponse
      | Member[]
      | undefined
    const rawMembers = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.value)
        ? payload.value
        : []

    return rawMembers.filter(member => member.isActive !== false)
  }, [membersResponse])

  const closeConfirm = () => {
    setIsConfirmOpen(false)
    setMemberToDelete(null)
  }

  const handleAskDelete = (member: Member) => {
    setMemberToDelete(member)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return

    const memberUserId = resolveMemberId(memberToDelete)
    if (memberUserId <= 0 || normalizedGroupId <= 0) return

    try {
      await deleteMemberMutation.mutateAsync(memberUserId)
      success({
        title: 'Xóa thành viên thành công',
        description: 'Thành viên đã được xóa khỏi nhóm.'
      })
      closeConfirm()
    } catch (err: any) {
      error({
        title: 'Xóa thành viên thất bại',
        description:
          err?.response?.data?.message ||
          err?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  }

  const canShowRemoveButton = (member: Member) => {
    const memberUserId = resolveMemberId(member)
    const isCurrentUser = memberUserId === normalizedCurrentUserId
    return isLeader && !isCurrentUser
  }

  const handleChangeMemberRole = async (
    member: Member,
    newRole: 'Leader' | 'Member'
  ) => {
    const memberUserId = resolveMemberId(member)
    if (memberUserId <= 0 || normalizedGroupId <= 0) return

    try {
      setUpdatingRoleUserId(memberUserId)
      await updateMemberRoleMutation.mutateAsync({
        userId: memberUserId,
        body: { newRole }
      })

      success({
        title: 'Cập nhật vai trò thành công',
        description: 'Vai trò thành viên đã được cập nhật.'
      })

      await onRoleUpdated?.()
    } catch (err: any) {
      error({
        title: 'Cập nhật vai trò thất bại',
        description:
          err?.response?.data?.message ||
          err?.message ||
          'Vui lòng thử lại sau.'
      })
    } finally {
      setUpdatingRoleUserId(null)
    }
  }

  const isControlled = typeof isOpen === 'boolean'

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      closeConfirm()
      onClose?.()
    }
  }

  return (
    <>
      <Dialog
        {...(isControlled
          ? { open: isOpen, onOpenChange: handleDialogOpenChange }
          : { onOpenChange: handleDialogOpenChange })}
      >
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className='w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-hidden'>
          <DialogHeader>
            <DialogTitle>Quản lý thành viên nhóm</DialogTitle>
            <DialogDescription>
              Danh sách thành viên hiện tại trong nhóm.
            </DialogDescription>
          </DialogHeader>

          <div className='max-h-[60vh] overflow-y-auto pr-1'>
            <div className='space-y-2'>
              {isLoading && (
                <div className='rounded-md border border-slate-200 px-4 py-3 text-sm text-slate-500'>
                  Đang tải danh sách thành viên...
                </div>
              )}

              {!isLoading && members.length === 0 && (
                <div className='rounded-md border border-slate-200 px-4 py-3 text-sm text-slate-500'>
                  Nhóm chưa có thành viên.
                </div>
              )}

              {!isLoading &&
                members.map(member => {
                  const displayName = resolveMemberName(member)
                  const memberRole =
                    member.role === 'Leader' ? 'Leader' : 'Member'
                  const memberUserId = resolveMemberId(member)
                  const isSelf = memberUserId === normalizedCurrentUserId
                  const isUpdatingRole = updatingRoleUserId === memberUserId

                  return (
                    <div
                      key={`${member.id}-${member.userId ?? member.id}`}
                      className='flex flex-col items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between'
                    >
                      <div className='flex min-w-0 items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                          <AvatarImage
                            src={getAvatarSrc(member.avatarUrl)}
                            alt={displayName}
                          />
                          <AvatarFallback
                            className={`${getAvatarColorClass(displayName)} text-white text-xs font-medium`}
                          >
                            {getAvatarFallback(displayName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold text-slate-900'>
                            {displayName}
                          </p>
                          <p className='truncate text-xs text-slate-500'>
                            {member.userCode
                              ? `MSSV: ${member.userCode}`
                              : 'Không có MSSV'}
                          </p>
                        </div>
                      </div>

                      <div className='flex w-full items-center gap-2 sm:w-auto'>
                        {canManageRole ? (
                          <Select
                            value={memberRole}
                            onValueChange={value =>
                              handleChangeMemberRole(
                                member,
                                value as 'Leader' | 'Member'
                              )
                            }
                            disabled={
                              isSelf ||
                              isUpdatingRole ||
                              updateMemberRoleMutation.isPending
                            }
                          >
                            <SelectTrigger className='h-8 w-full text-xs sm:w-30'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Leader'>
                                Trưởng nhóm
                              </SelectItem>
                              <SelectItem value='Member'>Thành viên</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'>
                            {memberRole}
                          </span>
                        )}

                        {canShowRemoveButton(member) && (
                          <Button
                            type='button'
                            size='icon'
                            variant='destructive'
                            onClick={() => handleAskDelete(member)}
                            className='h-8 w-8'
                            aria-label='Xóa thành viên'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeConfirm}
              disabled={deleteMemberMutation.isPending}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={event => {
                event.preventDefault()
                void handleConfirmDelete()
              }}
              disabled={deleteMemberMutation.isPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleteMemberMutation.isPending ? 'Đang xóa...' : 'Tiếp tục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
