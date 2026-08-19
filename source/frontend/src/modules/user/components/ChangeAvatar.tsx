import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Camera, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useChangeAvatar } from '../hook/user.hook'
import {
  getAvatarColorClass,
  getAvatarFallback,
  getAvatarSrc
} from '@/lib/avatar'

interface ChangeAvatarProps {
  currentAvatarUrl?: string
  fallbackName?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export default function ChangeAvatar({
  currentAvatarUrl,
  fallbackName = 'User'
}: ChangeAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const changeAvatarMutation = useChangeAvatar()

  const initials = useMemo(
    () => getAvatarFallback(fallbackName),
    [fallbackName]
  )

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('File không hợp lệ', {
        description: 'Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.'
      })
      event.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Kích thước quá lớn', {
        description: 'Ảnh đại diện không được vượt quá 5MB.'
      })
      event.target.value = ''
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const objectUrl = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreviewUrl(objectUrl)
  }

  const handleSaveAvatar = async () => {
    if (!selectedFile) return

    await changeAvatarMutation.mutateAsync({ file: selectedFile })

    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayAvatar = getAvatarSrc(previewUrl || currentAvatarUrl)

  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      <Avatar className='h-28 w-28 border-4 border-blue-100'>
        <AvatarImage src={displayAvatar} />
        <AvatarFallback
          className={`${getAvatarColorClass(fallbackName)} text-white text-3xl font-semibold`}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className='w-full flex flex-col items-center gap-2'>
        <Label htmlFor='avatar-file-input' className='sr-only'>
          Chọn ảnh đại diện
        </Label>
        <input
          id='avatar-file-input'
          ref={fileInputRef}
          type='file'
          accept='image/png,image/jpeg,image/jpg,image/webp'
          className='hidden'
          onChange={handleFileChange}
          disabled={changeAvatarMutation.isPending}
        />

        <Button
          type='button'
          variant='outline'
          className='gap-2'
          onClick={handleOpenFilePicker}
          disabled={changeAvatarMutation.isPending}
        >
          <Camera className='h-4 w-4' />
          Thay đổi ảnh đại diện
        </Button>

        <Button
          type='button'
          className='gap-2 w-full'
          onClick={handleSaveAvatar}
          disabled={!selectedFile || changeAvatarMutation.isPending}
        >
          {changeAvatarMutation.isPending ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              Đang tải lên...
            </>
          ) : (
            <>
              <Upload className='h-4 w-4' />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
