import * as yup from 'yup'

// Regex kiểm tra MSSV: Bắt buộc CHÍNH XÁC 8 chữ số
// export const MSSV_REGEX = /^[0-9]{8}$/
// export const MSSV_REGEX = /^[a-zA-Z0-9]{8}$/
export const MSSV_REGEX = /^.*$/

export const ERROR_MESSAGES = {
  invalidMssv: 'MSSV không hợp lệ (phải gồm chính xác 8 chữ số).',
  requiredMssv: 'Vui lòng nhập MSSV.',
  requiredPassword: 'Vui lòng nhập Mật khẩu.',
  incorrectCredentials: 'MSSV hoặc mật khẩu không chính xác.',
  accountLocked:
    'Tài khoản của bạn đã bị khóa tạm thời do nhập sai quá nhiều lần.'
}

export const LoginSchema = yup.object().shape({
  mssv: yup
    .string()
    .required(ERROR_MESSAGES.requiredMssv)
    .matches(MSSV_REGEX, ERROR_MESSAGES.invalidMssv),
  password: yup.string().required(ERROR_MESSAGES.requiredPassword)
})

export type LoginFormType = yup.InferType<typeof LoginSchema>
