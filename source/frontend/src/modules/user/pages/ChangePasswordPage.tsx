import ChangePasswordForm from '../components/ChangePasswordForm'

export default function ChangePasswordPage() {
  return (
    <div className='flex-1 p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-slate-900'>Đổi mật khẩu</h1>
        <p className='text-sm text-slate-600 mt-1'>
          Cập nhật mật khẩu để bảo mật tài khoản của bạn.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  )
}
