import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, ChevronRight, ChevronLeft } from 'lucide-react'
import api from '../lib/api'
import ErrorAlert from '../components/ui/ErrorAlert'

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post-Graduate']
const LEARNING_FORMAT_OPTIONS = [
  { value: 'video', label: 'Video Courses' },
  { value: 'documentation', label: 'Documentation / Reading' },
  { value: 'guided_practice', label: 'Guided Practice' },
  { value: 'mixed', label: 'Mixed (all of the above)' },
]
const CAREER_GOAL_OPTIONS = [
  { value: 'target_role', label: 'Land a specific role' },
  { value: 'improve_skills', label: 'Improve existing skills' },
  { value: 'explore', label: 'Explore options' },
]

interface Step1Data {
  college: string
  degree: string
  branch: string
  year_of_study: string
  career_interests: string
}

interface Step2Data {
  learning_format: string
  study_hours_per_week: number | ''
  career_goal: string
  bio: string
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [step1, setStep1] = useState<Step1Data>({
    college: '',
    degree: '',
    branch: '',
    year_of_study: '',
    career_interests: '',
  })

  const [step2, setStep2] = useState<Step2Data>({
    learning_format: '',
    study_hours_per_week: '',
    career_goal: '',
    bio: '',
  })

  const handleStep1Change = (field: keyof Step1Data, value: string) => {
    setStep1((prev) => ({ ...prev, [field]: value }))
  }

  const handleStep2Change = (field: keyof Step2Data, value: string | number) => {
    setStep2((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        ...step1,
        ...step2,
        study_hours_per_week: step2.study_hours_per_week === '' ? null : Number(step2.study_hours_per_week),
      }
      await api.put('/api/v1/profile', payload)
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setError(e?.response?.data?.detail ?? 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
              <span className="font-mono font-black text-sm">[S]</span>
            </div>
            <div className="flex items-baseline font-black tracking-tight text-neutral-900 text-xl uppercase font-sans">
              <span>SKILLBRIDGE</span>
              <span className="text-pink-500 font-mono text-lg font-bold ml-1">.AI</span>
            </div>
          </div>
          <div className="neo-section-tag justify-center mt-2">
            <span className="w-2 h-2 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>PROFILE ONBOARDING</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight font-sans">
            Configure your engineering profile
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full border-2 border-black font-mono text-xs font-black flex items-center justify-center transition-all ${
                  step >= s
                    ? 'bg-black text-white shadow-[2px_2px_0px_#EC4899]'
                    : 'bg-white text-neutral-400'
                }`}
              >
                {s}
              </div>
              {s < 2 && (
                <div className={`w-16 h-1 rounded-full ${step > s ? 'bg-black' : 'bg-neutral-300'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card">
          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} onClose={() => setError(null)} />
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College / University</label>
                <input
                  type="text"
                  value={step1.college}
                  onChange={(e) => handleStep1Change('college', e.target.value)}
                  required
                  placeholder="e.g. IIT Bombay"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={step1.degree}
                    onChange={(e) => handleStep1Change('degree', e.target.value)}
                    required
                    placeholder="e.g. B.Tech"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Major</label>
                  <input
                    type="text"
                    value={step1.branch}
                    onChange={(e) => handleStep1Change('branch', e.target.value)}
                    required
                    placeholder="e.g. Computer Science"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                <select
                  value={step1.year_of_study}
                  onChange={(e) => handleStep1Change('year_of_study', e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Career Interests</label>
                <input
                  type="text"
                  value={step1.career_interests}
                  onChange={(e) => handleStep1Change('career_interests', e.target.value)}
                  required
                  placeholder="e.g. Full-Stack Developer, Data Scientist"
                  className="input-field"
                />
                <p className="mt-1 text-xs text-gray-400">Separate multiple interests with commas</p>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning preferences</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred learning format</label>
                <div className="space-y-2">
                  {LEARNING_FORMAT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="learning_format"
                        value={opt.value}
                        checked={step2.learning_format === opt.value}
                        onChange={() => handleStep2Change('learning_format', opt.value)}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Study hours per week</label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={step2.study_hours_per_week}
                  onChange={(e) => handleStep2Change('study_hours_per_week', e.target.value)}
                  required
                  placeholder="e.g. 10"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary career goal</label>
                <div className="space-y-2">
                  {CAREER_GOAL_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="career_goal"
                        value={opt.value}
                        checked={step2.career_goal === opt.value}
                        onChange={() => handleStep2Change('career_goal', opt.value)}
                        required
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short bio <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={step2.bio}
                  onChange={(e) => handleStep2Change('bio', e.target.value)}
                  rows={3}
                  placeholder="Tell us a bit about yourself..."
                  className="input-field resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Complete setup'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          You can update these details anytime from Settings.
        </p>
      </div>
    </div>
  )
}
