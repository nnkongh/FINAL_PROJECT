import * as yup from 'yup'

export interface CreateGroupFormData {
  name: string
  subjectOrProjectName: string
}

export const createGroupSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tên nhóm là bắt buộc')
    .min(3, 'Tên nhóm phải có ít nhất 3 ký tự')
    .max(50, 'Tên nhóm không được quá 50 ký tự'),
  subjectOrProjectName: yup.string().required('Danh mục là bắt buộc')
})

/**
 * Join Group Form Schema
 */
export const joinGroupSchema = yup.object().shape({
  inviteCode: yup
    .string()
    .required('Mã tham gia là bắt buộc')
    .min(3, 'Mã tham gia không hợp lệ')
    .matches(/^[A-Z0-9]+$/, 'Mã tham gia chỉ chứa chữ in hoa và số')
})

export type JoinGroupFormData = yup.InferType<typeof joinGroupSchema>
