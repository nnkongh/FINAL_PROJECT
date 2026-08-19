import * as yup from 'yup'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const FORGOT_PASS_ERRORS = {
  invalidEmail: 'Email không hợp lệ.',
  requiredEmail: 'Vui lòng nhập Email của bạn.'
}

export const ForgotPassSchema = yup.object().shape({
  email: yup
    .string()
    .required(FORGOT_PASS_ERRORS.requiredEmail)
    .matches(EMAIL_REGEX, FORGOT_PASS_ERRORS.invalidEmail)
})

export type ForgotPasswordType = yup.InferType<typeof ForgotPassSchema>
