import { useState } from 'react'
import { toast } from 'sonner'
import * as yup from 'yup'
import { useCreateClass } from './useClass'
import {
  INITIAL_CREATE_CLASS_FORM_DATA,
  INITIAL_CREATE_CLASS_FORM_ERRORS,
  type CreateClassFormData,
  type CreateClassFormErrors
} from '../types/createClassForm'

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: unknown } }).response?.data &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response
      ?.data?.message === 'string'
  ) {
    return (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message as string
  }

  if (error instanceof Error) return error.message
  return 'Vui lòng thử lại.'
}

const createClassFormSchema: yup.ObjectSchema<CreateClassFormData> = yup
  .object({
    className: yup
      .string()
      .trim()
      .required('Tên lớp học là bắt buộc')
      .min(3, 'Tên lớp học phải có ít nhất 3 ký tự'),
    subjectName: yup.string().required('Vui lòng chọn môn học'),
    majorType: yup
      .mixed<'IT' | 'General'>()
      .oneOf(['IT', 'General'], 'Phân loại chuyên ngành không hợp lệ')
      .required('Vui lòng chọn phân loại chuyên ngành'),
    maxMembersPerGroup: yup
      .number()
      .typeError('Số lượng sinh viên tối đa mỗi nhóm phải là số')
      .required('Số lượng sinh viên tối đa mỗi nhóm là bắt buộc')
      .min(2, 'Số lượng sinh viên tối đa mỗi nhóm phải từ 2 đến 10')
      .max(10, 'Số lượng sinh viên tối đa mỗi nhóm phải từ 2 đến 10')
  })
  .required()

const validateCreateClassForm = async (
  formData: CreateClassFormData
): Promise<CreateClassFormErrors> => {
  const nextErrors: CreateClassFormErrors = {
    ...INITIAL_CREATE_CLASS_FORM_ERRORS
  }

  try {
    await createClassFormSchema.validate(formData, { abortEarly: false })
    return nextErrors
  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      error.inner.forEach(issue => {
        if (!issue.path || !issue.message) return

        if (issue.path in nextErrors) {
          const key = issue.path as keyof CreateClassFormErrors
          if (!nextErrors[key]) {
            nextErrors[key] = issue.message
          }
        }
      })
    }

    return nextErrors
  }
}

const hasCreateClassFormErrors = (errors: CreateClassFormErrors) => {
  return Boolean(
    errors.className ||
    errors.subjectName ||
    errors.majorType ||
    errors.maxMembersPerGroup
  )
}

export const useCreateClassForm = () => {
  const [formData, setFormData] = useState<CreateClassFormData>(
    INITIAL_CREATE_CLASS_FORM_DATA
  )
  const [errors, setErrors] = useState<CreateClassFormErrors>(
    INITIAL_CREATE_CLASS_FORM_ERRORS
  )

  const { mutateAsync: createClassMutateAsync, isPending: isSubmitting } =
    useCreateClass()

  const resetForm = () => {
    setFormData(INITIAL_CREATE_CLASS_FORM_DATA)
    setErrors(INITIAL_CREATE_CLASS_FORM_ERRORS)
  }

  const submitForm = async (): Promise<boolean> => {
    const validationErrors = await validateCreateClassForm(formData)
    setErrors(validationErrors)

    if (hasCreateClassFormErrors(validationErrors)) {
      return false
    }

    try {
      const createdClass = await createClassMutateAsync({
        className: formData.className.trim(),
        subjectName: formData.subjectName,
        majorType: formData.majorType,
        maxMembersPerGroup: formData.maxMembersPerGroup
      })

      toast.success('Tạo lớp học thành công', {
        description: createdClass.inviteCode
          ? `Mã tham gia: ${createdClass.inviteCode}`
          : 'Lớp học đã được tạo.'
      })

      return true
    } catch (error: unknown) {
      toast.error('Không thể tạo lớp học', {
        description: getErrorMessage(error)
      })

      return false
    }
  }

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    resetForm,
    submitForm
  }
}
