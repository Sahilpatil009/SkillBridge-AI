import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import ErrorAlert from '../components/ui/ErrorAlert'
import { StudentProfile } from '../types'

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post-Graduate']
const LEARNING_FORMAT_OPTIONS = [
  { value: 'video', label: 'Video Courses' },
  { value: 'documentation', label: 'Documentation / Reading' },
  { value: 'guided_practice', label: 'Guided Practice' },
  { value: 'mixed', label: 'Mixed' },
]
const CAREER_GOAL_OPTIONS = [
  { value: 'target_role', label: 'Land a specific role' },
  { value: 'improve_skills', label: 'Improve existing skills' },
  { value: 'explore', label: 'Explore options' },
]

type FeedbackState = { type: 'success' | 'error'; message: string } | null

export default function SettingsPage() {
  const { user } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [profile, setProfile] = useState<Partial<StudentProfile>>({})
  const [profileLoading, setProfileLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null)
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackState>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    api.get<{ profile?: StudentProfile } & StudentProfile>('/api/v1/profile')
      .then((res) => setProfile(res.data.profile ?? res.data))
      .catch(() => setProfile({}))
      .finally(() => setProfileLoading(false))
  }, [])

  const handleProfileChange = (field: keyof StudentProfile, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileFeedback(null)
    setSavingProfile(true)
    try {
      await api.patch('/api/v1/profile/user', { name })
      await api.put('/api/v1/profile', profile)
      setProfileFeedback({ type: 'success', message: 'Profile updated successfully.' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setProfileFeedback({
        type: 'error',
        message: e?.response?.data?.detail ?? 'Failed to update profile.',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback(null)
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'New password must be at least 8 characters.' })
      return
    }
    setSavingPassword(true)
    try {
      await api.post('/api/v1/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordFeedback({ type: 'success', message: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setPasswordFeedback({
        type: 'error',
        message: e?.response?.data?.detail ?? 'Failed to change password.',
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and profile information.</p>
      </div>

      {/* Profile section */}
      <form onSubmit={handleSaveProfile} className="card space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Profile</h2>

        {profileFeedback && (
          profileFeedback.type === 'error' ? (
            <ErrorAlert message={profileFeedback.message} onClose={() => setProfileFeedback(null)} />
          ) : (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              {profileFeedback.message}
            </div>
          )
        )}

        {profileLoading ? (
          <p className="text-sm text-gray-400">Loading profile...</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College / University</label>
              <input
                type="text"
                value={profile.college ?? ''}
                onChange={(e) => handleProfileChange('college', e.target.value)}
                placeholder="e.g. IIT Bombay"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={profile.degree ?? ''}
                  onChange={(e) => handleProfileChange('degree', e.target.value)}
                  placeholder="e.g. B.Tech"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Major</label>
                <input
                  type="text"
                  value={profile.branch ?? ''}
                  onChange={(e) => handleProfileChange('branch', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
              <select
                value={profile.year_of_study ?? ''}
                onChange={(e) => handleProfileChange('year_of_study', e.target.value)}
                className="input-field"
              >
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Career Interests</label>
              <input
                type="text"
                value={profile.career_interests ?? ''}
                onChange={(e) => handleProfileChange('career_interests', e.target.value)}
                placeholder="e.g. Full-Stack Developer, Data Scientist"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={profile.github_url ?? ''}
                  onChange={(e) => handleProfileChange('github_url', e.target.value)}
                  placeholder="https://github.com/username"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={profile.linkedin_url ?? ''}
                  onChange={(e) => handleProfileChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred learning format</label>
              <select
                value={profile.learning_format ?? ''}
                onChange={(e) => handleProfileChange('learning_format', e.target.value)}
                className="input-field"
              >
                <option value="">Select format</option>
                {LEARNING_FORMAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary career goal</label>
              <select
                value={profile.career_goal ?? ''}
                onChange={(e) => handleProfileChange('career_goal', e.target.value)}
                className="input-field"
              >
                <option value="">Select goal</option>
                {CAREER_GOAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={profile.bio ?? ''}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                rows={3}
                placeholder="Tell us about yourself..."
                className="input-field resize-none"
              />
            </div>
          </>
        )}

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={savingProfile || profileLoading} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Change password section */}
      <form onSubmit={handleChangePassword} className="card space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Change password</h2>

        {passwordFeedback && (
          passwordFeedback.type === 'error' ? (
            <ErrorAlert message={passwordFeedback.message} onClose={() => setPasswordFeedback(null)} />
          ) : (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              {passwordFeedback.message}
            </div>
          )
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="input-field"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Saving...' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  )
}
