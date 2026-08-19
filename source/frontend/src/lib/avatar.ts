export const AVATAR_UPDATED_AT_KEY = 'avatarUpdatedAt'
const AVATAR_URL_KEY = 'avatarUrl'

export const setAvatarCacheMeta = (avatarUrl?: string) => {
  localStorage.setItem(AVATAR_UPDATED_AT_KEY, Date.now().toString())
  if (avatarUrl) {
    localStorage.setItem(AVATAR_URL_KEY, avatarUrl)
  }
}

export const getStoredAvatarUrl = () => {
  return localStorage.getItem(AVATAR_URL_KEY) || ''
}

export const withAvatarVersion = (avatarUrl?: string) => {
  if (!avatarUrl) return ''

  const version = localStorage.getItem(AVATAR_UPDATED_AT_KEY)
  if (!version) return avatarUrl

  const separator = avatarUrl.includes('?') ? '&' : '?'
  return `${avatarUrl}${separator}v=${version}`
}

export const getAvatarSrc = (avatarUrl?: string | null) => {
  const normalizedAvatarUrl = (avatarUrl || '').trim()
  if (!normalizedAvatarUrl) return undefined

  return withAvatarVersion(normalizedAvatarUrl)
}

export const getAvatarFallback = (name?: string) => {
  const normalized = (name || '').trim()
  if (!normalized) return 'U'

  const parts = normalized.split(/\s+/)
  const lastPart = parts[parts.length - 1]
  return (lastPart?.[0] || normalized[0] || 'U').toUpperCase()
}

const AVATAR_COLOR_CLASSES = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500'
]

export const getAvatarColorClass = (value?: string | number | null) => {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!normalized) return 'bg-slate-500'

  let hash = 0
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0
  }

  return AVATAR_COLOR_CLASSES[hash % AVATAR_COLOR_CLASSES.length]
}
