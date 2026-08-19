import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/vi'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('vi')

export const APP_TIMEZONE = 'Asia/Ho_Chi_Minh'

const TIMEZONE_SUFFIX_REGEX = /(Z|[+-]\d{2}:?\d{2})$/i

export const formatDateTimeVi = (value?: string | null): string => {
  if (!value) return ''

  const raw = value.trim()
  if (!raw) return ''

  const normalizedInput = raw.includes(' ') ? raw.replace(' ', 'T') : raw
  const hasTimezoneSuffix = TIMEZONE_SUFFIX_REGEX.test(normalizedInput)

  const parsed = hasTimezoneSuffix
    ? dayjs(normalizedInput)
    : dayjs.utc(normalizedInput)

  if (!parsed.isValid()) return ''

  return parsed.tz(APP_TIMEZONE).format('DD/MM/YYYY HH:mm')
}

export default dayjs
