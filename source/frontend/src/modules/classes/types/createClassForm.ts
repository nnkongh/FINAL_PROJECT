export interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export interface CreateClassFormData {
  className: string
  subjectName: string
  majorType: 'IT' | 'General'
  maxMembersPerGroup: number
}

export interface CreateClassFormErrors {
  className: string
  subjectName: string
  majorType: string
  maxMembersPerGroup: string
}

export interface MajorTypeOption {
  value: string
  label: string
}

export const MAJOR_TYPE_OPTIONS: MajorTypeOption[] = [
  {
    value: 'IT',
    label: 'Công nghệ thông tin (Hỗ trợ GitHub)'
  },
  {
    value: 'General',
    label: 'Ngành khác'
  }
]

export const INITIAL_CREATE_CLASS_FORM_DATA: CreateClassFormData = {
  className: '',
  subjectName: '',
  majorType: 'IT',
  maxMembersPerGroup: 5
}

export const INITIAL_CREATE_CLASS_FORM_ERRORS: CreateClassFormErrors = {
  className: '',
  subjectName: '',
  majorType: '',
  maxMembersPerGroup: ''
}
