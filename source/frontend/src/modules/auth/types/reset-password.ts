import * as yup from 'yup'

/**
 * Reset Password Form Type
 */
export interface ResetPasswordFormType {
  newPassword: string
  passwordConfirm: string
}

/**
 * Reset Password Validation Schema
 */
export const ResetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('Mật khẩu mới là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  passwordConfirm: yup.string().required('Xác nhận mật khẩu là bắt buộc')
  // .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
})
