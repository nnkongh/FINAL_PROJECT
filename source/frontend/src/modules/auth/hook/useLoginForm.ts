import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { LoginSchema, type LoginFormType } from '../types/login'
// Import hook useLogin mà bạn vừa gửi (nhớ trỏ đúng đường dẫn file)
import { useLogin } from './auth.hook'
interface UseLoginFormProps {
  onLoginSuccess: () => void // Hàm để navigate sang trang khác sau khi login thành công
}

export const useLoginForm = ({ onLoginSuccess }: UseLoginFormProps) => {
  // 1. Gọi hook useLogin để lấy hàm mutate (gọi API) và trạng thái isPending (loading)
  const { mutate: loginMutate, isPending } = useLogin()

  // 2. Setup React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors,
    setError
  } = useForm<LoginFormType>({
    resolver: yupResolver(LoginSchema),
    mode: 'onChange' // Validate ngay khi người dùng gõ
  })

  // 3. Hàm xử lý khi ấn nút Sign In
  const onSubmit = (data: LoginFormType) => {
    // Gọi hàm mutate và truyền data vào
    loginMutate(data, {
      onSuccess: response => {
        // Lấy token từ response theo cấu trúc API trả về
        // Swagger trả về: { success: true, data: { accessToken, refreshToken } }
        const accessToken = response?.data?.accessToken
        const refreshToken = response?.data?.refreshToken

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken)
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        // Chuyển hướng sang trang /groups
        onLoginSuccess()
      },
      onError: (error: any) => {
        // Backend trả về: { code: "", message: "Tài khoản không tồn tại" }
        // Lấy message từ response body
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'MSSV hoặc mật khẩu không chính xác.'

        console.log('Login error:', error.response?.data) // Debug

        setError('password', {
          type: 'manual',
          message: errorMessage
        })
      }
    })
  }

  // 4. Các hàm hỗ trợ phím Enter cho UX mượt hơn
  const handleMssvKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.getElementById('password')?.focus()
    }
  }

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(onSubmit)()
    }
  }

  // 5. Trả về các biến để file giao diện (LoginForm.tsx) lấy xài
  return {
    register,
    handleSubmit,
    errors,
    clearErrors,
    loading: isPending, // Truyền isPending của React Query vào biến loading của UI
    canSubmit: isValid && !isPending, // Chỉ cho bấm khi form hợp lệ và không đang loading
    onSubmit,
    handleMssvKeyDown,
    handlePasswordKeyDown
  }
}
