import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { setAvatarCacheMeta } from '@/lib/avatar'
import {
  changeAvatarAPI,
  changePasswordAPI,
  getUserProfileAPI,
  linkGithubAccountAPI,
  type ChangeAvatarPayload,
  type ChangePasswordPayload
} from '../api/user.api'

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfileAPI
  })
}

// export const useGetUsersByEmail = (
//   email: string,
//   startTime?: string,
//   endTime?: string
// ) => {
//   return useQuery({
//     queryKey: [
//       'users',
//       {
//         email,
//         startTime,
//         endTime
//       }
//     ],
//     queryFn: () => getUsersByEmail(email, startTime, endTime),
//     enabled: !!startTime && !!endTime,
//     staleTime: 0,
//     cacheTime: 0
//   })
// }

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePasswordAPI(payload),
    onSuccess: response => {
      toast.success('Đổi mật khẩu thành công', {
        description:
          response?.message || 'Mật khẩu của bạn đã được cập nhật thành công.'
      })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Đổi mật khẩu thất bại. Vui lòng thử lại.'

      toast.error('Đổi mật khẩu thất bại', {
        description: message
      })
    }
  })
}

export const useChangeAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ChangeAvatarPayload) => changeAvatarAPI(payload),
    onSuccess: response => {
      const uploadedAvatarUrl =
        response?.data?.avatarUrl || response?.data?.avatar

      setAvatarCacheMeta(uploadedAvatarUrl)

      toast.success('Cập nhật ảnh đại diện thành công', {
        description: response?.message || 'Ảnh đại diện đã được thay đổi.'
      })

      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.'

      toast.error('Cập nhật ảnh đại diện thất bại', {
        description: message
      })
    }
  })
}

export const useLinkGithubAccount = () => {
  return useMutation({
    mutationFn: (email: string) => linkGithubAccountAPI({ email })
  })
}
