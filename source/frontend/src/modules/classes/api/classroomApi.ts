import api from '@/lib/axios'

export const deleteClassroomApi = async (
  classroomId: number | string
): Promise<void> => {
  await api.delete(`/classroom/${classroomId}`)
}

export const removeStudentFromClassroomApi = async (
  classroomId: number | string,
  studentId: number
): Promise<void> => {
  await api.put(
    `/classroom/${classroomId}/enrollment/remove-student`,
    studentId
  )
}
