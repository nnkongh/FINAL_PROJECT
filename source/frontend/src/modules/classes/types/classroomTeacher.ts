export type ClassroomId = number | string

export interface UpdateClassroomRequest {
  className: string
  subjectName: string
}

export interface ClassroomTeacherResponse {
  id?: number
  className?: string
  subjectName?: string
  isActive?: boolean
}

export interface ClassroomInitialData {
  className: string
  subjectName: string
}

export interface EditClassroomModalProps {
  classroomId: ClassroomId
  initialData: ClassroomInitialData
  isOpen: boolean
  onClose: () => void
}

export interface ClassroomTeacherActionsProps {
  classroomId: ClassroomId
  isActive: boolean
  initialData: ClassroomInitialData
}

export interface EditClassroomFormState {
  className: string
  subjectName: string
}

export interface EditClassroomFormErrors {
  className: string
  subjectName: string
}
