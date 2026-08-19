import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // 👇 Thêm useNavigate
import { Users } from 'lucide-react'
import { toast } from 'sonner'

// Import UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import GroupCard from '../components/GroupCard'
import CreateGroupModal from '@/modules/groups/components/CreateGroupModal'

// Import Types
import type { CreateGroupRequest } from '@/modules/groups/types/group.request'

// Import Custom Hooks & Utils
import { useStudentGroupLogic } from '../hooks/useClassroomGroups'
import { getGroupMemberCount } from '@/utils/groupUtils'

export interface StudentGroupTabProps {
  subjectName: string
  maxMembersPerGroup?: number
}

export default function StudentGroupTab({
  subjectName,
  maxMembersPerGroup = 10
}: StudentGroupTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const navigate = useNavigate()

  // Lấy toàn bộ data và logic từ Custom Hook
  const {
    groups,
    enrollments,
    myGroup,
    isLoading,
    hasLoadIssue,
    handleCreateGroup,
    isCreating,
    handleJoinGroup,
    isJoiningGroup
  } = useStudentGroupLogic(subjectName)

  // Xử lý tạo nhóm mới
  const onSubmitCreate = async (payload: CreateGroupRequest) => {
    try {
      await handleCreateGroup(payload)
      toast.success('Tạo nhóm thành công')
      setIsCreateModalOpen(false)
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error?.message ||
        (error instanceof Error
          ? error.message
          : 'Không thể tạo nhóm, vui lòng thử lại.')
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='py-8 text-sm text-slate-600'>
          Đang tải dữ liệu nhóm...
        </CardContent>
      </Card>
    )
  }

  if (myGroup) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-slate-900'>Nhóm của bạn</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          <Link to={`/groups/${myGroup.id}`} className='block'>
            <GroupCard
              group={{
                ...myGroup,
                totalMemberCount: getGroupMemberCount(myGroup),
                limitedUser: myGroup.limitedUser ?? 0
              }}
              maxMembersPerGroup={maxMembersPerGroup}
              isMyGroup={true} // Chỗ này myGroup nên chắc chắn là true
            />
          </Link>
        </div>
      </div>
    )
  }

  // TRƯỜNG HỢP 3: Sinh viên CHƯA CÓ nhóm (hoặc hiển thị toàn bộ danh sách nhóm)
  return (
    <div className='space-y-6'>
      {/* Cảnh báo lỗi tải (nếu có) */}
      {hasLoadIssue && (
        <Card>
          <CardContent className='py-4 text-sm text-amber-700'>
            Không thể tải đầy đủ dữ liệu nhóm. Bạn vẫn có thể tạo nhóm mới.
          </CardContent>
        </Card>
      )}

      {/* Header & Nút tạo nhóm */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-slate-900'>
          Nhóm hiện có trong lớp
        </h3>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Users className='mr-2 h-4 w-4' />
          Tạo nhóm mới
        </Button>
      </div>

      {/* Danh sách các nhóm */}
      {groups.length === 0 ? (
        <Card className='border-dashed border-2'>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='rounded-full bg-slate-100 p-6 mb-4'>
              <Users className='h-12 w-12 text-slate-400' />
            </div>
            <h3 className='text-xl font-semibold text-slate-900 mb-2'>
              Chưa có nhóm nào
            </h3>
            <p className='text-slate-600 max-w-md'>
              Hiện chưa có nhóm nào trong lớp. Bạn có thể là người đầu tiên tạo
              nhóm mới.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {groups.map(group => {
            // Kiểm tra sĩ số nhóm
            const memberLimit =
              maxMembersPerGroup > 0
                ? maxMembersPerGroup
                : (group.limitedUser ?? 10)
            const isGroupFull = getGroupMemberCount(group) >= memberLimit

            return (
              <div key={group.id} className='flex flex-col h-full'>
                <GroupCard
                  group={{
                    ...group,
                    totalMemberCount: getGroupMemberCount(group),
                    limitedUser: group.limitedUser ?? 0
                  }}
                  maxMembersPerGroup={maxMembersPerGroup}
                  isMyGroup={group.isMyGroup}
                  onClick={
                    group.isMyGroup
                      ? () => navigate(`/groups/${group.id}`)
                      : undefined
                  }
                  isJoinDisabled={isGroupFull || isJoiningGroup}
                  onJoin={async () => {
                    try {
                      await handleJoinGroup(group.id)
                      toast.success('Đã gửi yêu cầu tham gia nhóm thành công!')
                    } catch (error: unknown) {
                      const message =
                        error instanceof Error
                          ? error.message
                          : 'Lỗi khi gửi yêu cầu'
                      toast.error(message)
                    }
                  }}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Modal xử lý form tạo nhóm */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxMembersPerGroup={maxMembersPerGroup}
        onCreateGroup={onSubmitCreate}
        isSubmitting={isCreating}
        fixedSubjectName={subjectName}
      />
    </div>
  )
}
