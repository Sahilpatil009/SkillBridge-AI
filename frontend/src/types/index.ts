// Shared TypeScript types for SkillBridge AI

export interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'admin'
  is_active: boolean
  created_at: string
}

export interface StudentProfile {
  id: number
  user_id: number
  college?: string
  degree?: string
  branch?: string
  year_of_study?: string
  career_interests?: string
  learning_format?: string
  study_hours_per_week?: number
  career_goal?: string
  bio?: string
  github_url?: string
  linkedin_url?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface ApiError {
  detail: string
  code?: string
}
