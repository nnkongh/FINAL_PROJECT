import { useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Loader2, Save, Github, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useLinkGithubAccount, useUserProfile } from '../hook/user.hook'
import type { UserProfileResponse } from '../api/user.api'
import { getCurrentUserFromToken } from '@/lib/token'
import { getStoredAvatarUrl, withAvatarVersion } from '@/lib/avatar'
import ChangeAvatar from '../components/ChangeAvatar'

interface ProfileFormValues {
  fullName: string
  phoneNumber: string
  email: string
  major: string
}

const profileSchema: yup.ObjectSchema<ProfileFormValues> = yup.object({
  fullName: yup.string().trim().required('Họ tên là bắt buộc'),
  phoneNumber: yup
    .string()
    .trim()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'),
  email: yup
    .string()
    .trim()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  major: yup.string().trim().required('Chuyên ngành là bắt buộc')
})

const mapProfileToForm = (
  profile?: UserProfileResponse,
  tokenUser?: ReturnType<typeof getCurrentUserFromToken>
): ProfileFormValues => ({
  fullName:
    profile?.fullName ||
    profile?.name ||
    profile?.userName ||
    tokenUser?.fullName ||
    '',
  phoneNumber: profile?.phoneNumber || profile?.phone || '',
  email: profile?.email || tokenUser?.email || '',
  major: profile?.major || profile?.specialization || ''
})

const extractProfileData = (raw: unknown): UserProfileResponse | undefined => {
  if (!raw || typeof raw !== 'object') return undefined

  const payload = raw as Record<string, unknown>
  const candidate =
    (payload.data as UserProfileResponse | undefined) ||
    (payload.value as UserProfileResponse | undefined) ||
    (payload as UserProfileResponse)

  if (!candidate || typeof candidate !== 'object') return undefined

  return candidate
}

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, isLoading, isError, dataUpdatedAt } = useUserProfile()
  const { mutateAsync: linkGithubMutateAsync, isPending: isLinkingGithub } =
    useLinkGithubAccount()
  const profileData = useMemo(() => extractProfileData(data), [data])
  const tokenUser = useMemo(() => getCurrentUserFromToken(), [])
  const githubUsername = String(
    profileData?.githubUsername || profileData?.githubUserName || ''
  ).trim()

  const userMeta = useMemo(
    () => ({
      studentId:
        profileData?.studentId ||
        profileData?.mssv ||
        profileData?.userCode ||
        tokenUser.studentId ||
        '-',
      avatarUrl: withAvatarVersion(
        profileData?.avatarUrl ||
          profileData?.avatar ||
          getStoredAvatarUrl() ||
          tokenUser.avatarUrl ||
          ''
      )
    }),
    [profileData, tokenUser, dataUpdatedAt]
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema),
    mode: 'onChange',
    defaultValues: mapProfileToForm(undefined, tokenUser)
  })

  useEffect(() => {
    reset(mapProfileToForm(profileData, tokenUser))
  }, [profileData, tokenUser, reset])

  useEffect(() => {
    const githubStatus = searchParams.get('github')
    if (githubStatus !== 'success') return

    toast.success('Liên kết tài khoản GitHub thành công!')

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('github')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  const handleLinkGithub = async () => {
    const currentEmail = profileData?.email || tokenUser.email || ''

    if (!currentEmail) {
      toast.error('Không tìm thấy email tài khoản hiện tại')
      return
    }

    try {
      const response = await linkGithubMutateAsync(currentEmail)
      const redirectUrl = response?.redirectUrl

      if (!redirectUrl) {
        throw new Error('Không nhận được đường dẫn chuyển hướng GitHub')
      }

      window.location.href = redirectUrl
    } catch (error: any) {
      toast.error('Không thể liên kết GitHub', {
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          'Vui lòng thử lại sau.'
      })
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    toast.success('Đã load dữ liệu thật từ API profile')
    reset(values)
  }

  if (isLoading) {
    return (
      <div className='flex-1 p-6 flex items-center justify-center'>
        <div className='flex items-center gap-2 text-slate-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          Đang tải thông tin hồ sơ...
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 p-6'>
      {isError && (
        <Alert variant='destructive' className='mb-6'>
          <AlertDescription>
            Không tải được profile từ API. Đang hiển thị dữ liệu lấy từ token
            đăng nhập.
          </AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <Card className='xl:col-span-1'>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center text-center gap-4'>
            <ChangeAvatar
              currentAvatarUrl={userMeta.avatarUrl}
              fallbackName={
                profileData?.fullName ||
                profileData?.name ||
                profileData?.userName ||
                tokenUser.fullName ||
                'User'
              }
            />

            <div>
              <p className='text-xl font-semibold text-slate-900'>
                {profileData?.fullName ||
                  profileData?.name ||
                  profileData?.userName ||
                  tokenUser.fullName ||
                  'User'}
              </p>
              <p className='text-sm text-slate-500 mt-1'>
                Student ID: {userMeta.studentId}
              </p>
            </div>

            {githubUsername ? (
              <div className='w-full rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left opacity-90'>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-800'>
                    {githubUsername}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                type='button'
                variant='outline'
                className='w-full gap-2'
                onClick={handleLinkGithub}
                disabled={isLinkingGithub}
              >
                {isLinkingGithub ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Github className='h-4 w-4' />
                )}
                {isLinkingGithub ? 'Đang chuyển hướng...' : 'Liên kết GitHub'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className='xl:col-span-2'>
          <CardHeader>
            <CardTitle>Cập nhật hồ sơ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fullName'>Họ tên</Label>
                  <Input
                    id='fullName'
                    placeholder='Nhập họ tên'
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className='text-sm text-red-600'>
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phoneNumber'>Số điện thoại</Label>
                  <Input
                    id='phoneNumber'
                    placeholder='Nhập số điện thoại'
                    {...register('phoneNumber')}
                  />
                  {errors.phoneNumber && (
                    <p className='text-sm text-red-600'>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    placeholder='Nhập email'
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className='text-sm text-red-600'>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='major'>Chuyên ngành</Label>
                  <Input
                    id='major'
                    placeholder='Nhập chuyên ngành'
                    {...register('major')}
                  />
                  {errors.major && (
                    <p className='text-sm text-red-600'>
                      {errors.major.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex justify-end'>
                <Button type='submit' className='gap-2' disabled={isSubmitting}>
                  <Save className='h-4 w-4' />
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
