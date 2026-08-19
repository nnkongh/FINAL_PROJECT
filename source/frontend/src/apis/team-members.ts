// Mock team members data
export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'user-01',
    name: 'Minh Tri',
    email: 'minhtri@example.com'
  },
  {
    id: 'user-02',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com'
  },
  {
    id: 'user-03',
    name: 'Alex Chen',
    email: 'alex.chen@example.com'
  },
  {
    id: 'user-04',
    name: 'Maria Garcia',
    email: 'maria.g@example.com'
  },
  {
    id: 'user-05',
    name: 'David Kim',
    email: 'david.kim@example.com'
  },
  {
    id: 'user-06',
    name: 'Emma Wilson',
    email: 'emma.w@example.com'
  }
]

export const getCurrentUserId = () => 'user-01' // Mock current user
