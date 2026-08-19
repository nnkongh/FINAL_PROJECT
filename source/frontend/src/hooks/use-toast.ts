import { toast as sonnerToast } from 'sonner'

type ToastPayload = {
  title: string
  description?: string
}

export const useToast = () => {
  return {
    toast: ({ title, description }: ToastPayload) => {
      sonnerToast(title, {
        description
      })
    },
    success: ({ title, description }: ToastPayload) => {
      sonnerToast.success(title, {
        description
      })
    },
    error: ({ title, description }: ToastPayload) => {
      sonnerToast.error(title, {
        description
      })
    }
  }
}
