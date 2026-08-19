import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'sonner'
import { useCreateGroup } from './useGroups'
import {
  createGroupSchema,
  type CreateGroupFormData
} from '../types/validation'
import type { CreateGroupRequest } from '../types/group.request'

interface UseCreateGroupFormParams {
  fixedSubjectName?: string
  maxMembersPerGroup: number
  onCreateGroup?: (payload: CreateGroupRequest) => Promise<unknown> | unknown
  onSuccess?: () => void
  onClose: () => void
}

const getSafeMaxMembersPerGroup = (value: number) => {
  if (!Number.isFinite(value)) return 10
  if (value < 2) return 2
  return Math.floor(value)
}

export const useCreateGroupForm = ({
  fixedSubjectName,
  maxMembersPerGroup,
  onCreateGroup,
  onSuccess,
  onClose
}: UseCreateGroupFormParams) => {
  const safeMaxMembersPerGroup = getSafeMaxMembersPerGroup(maxMembersPerGroup)
  const { mutateAsync: createGroupMutateAsync, isPending } = useCreateGroup()

  const form = useForm<CreateGroupFormData>({
    resolver: yupResolver(createGroupSchema),
    defaultValues: {
      name: '',
      subjectOrProjectName: fixedSubjectName || ''
    }
  })

  const { reset, setValue, handleSubmit } = form

  useEffect(() => {
    if (!fixedSubjectName) return
    setValue('subjectOrProjectName', fixedSubjectName, { shouldValidate: true })
  }, [fixedSubjectName, setValue])

  const handleClose = () => {
    reset({
      name: '',
      subjectOrProjectName: fixedSubjectName || ''
    })
    onClose()
  }

  const onSubmit = handleSubmit(async data => {
    const payload: CreateGroupRequest = {
      name: data.name,
      subjectOrProjectName: fixedSubjectName || data.subjectOrProjectName,
      // Gán cứng limitedUser bằng số thành viên tối đa của lớp
      limitedUser: safeMaxMembersPerGroup
    }

    try {
      if (onCreateGroup) {
        await Promise.resolve(onCreateGroup(payload))
      } else {
        await createGroupMutateAsync(payload)
      }

      handleClose()
      onSuccess?.()
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error?.message ||
        (error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra khi tạo nhóm. Vui lòng thử lại.')
      toast.error(message)
    }
  })

  return {
    form,
    onSubmit,
    handleClose,
    isSubmitting: isPending,
    safeMaxMembersPerGroup
  }
}
