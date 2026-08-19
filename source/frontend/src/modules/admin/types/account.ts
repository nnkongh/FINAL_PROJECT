/**
 * Account Type Definition
 */
export interface Account {
  id: string
  email: string
  fullName: string
  mssv: string
  role: 'Admin' | 'Teacher' | 'Student'
  status: 'Active' | 'Inactive'
}
