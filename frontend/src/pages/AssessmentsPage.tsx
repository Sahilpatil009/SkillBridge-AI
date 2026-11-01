import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Play, History, ArrowRight, Search } from 'lucide-react'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

interface Skill {
  id: number
  name: string
  category: string
}

interface AssessmentHistory {
  id: number
  skill_id: number
  skill_name: string
  score_percentage: number
  proficiency_level: string
  total_questions: number
  status: string
  started_at: string
  submitted_at: string | null
}

const proficiencyColor: Record<string, string> = {
  beginner: 'badge-red',
  intermediate: 'badge-yellow',
  advanced: 'badge-green',
}

export default function AssessmentsPage() {
  const navigate = useNavigate()
  const [skills, setSkills] = useState<Skill[]>([])
  const [history, setHistory] = useState<AssessmentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/skills'),
      api.get('/api/v1/assessments/history'),
    ])
      .then(([skillRes, histRes]) => {
        setSkills(skillRes.data?.skills || skillRes.data || [])
        setHistory(histRes.data || [])
      })
      .catch(() => setError('Failed to load skills or history.'))
      .finally(() => setLoading(false))
  }, [])

  const startAssessment = async (skillId: number) => {
    setStarting(skillId)
    setError('')
    try {
      const res = await api.post('/api/v1/assessments', { skill_id: skillId })
      navigate(`/app/assessments/${res.data.assessment_id}`, {
        state: {
          questions: res.data.questions,
          skill_id: res.data.skill_id,
          skillName: skills.find((s) => s.id === skillId)?.name || '',
        },
      })
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to start assessment.')
    } finally {
      setStarting(null)
    }
  }

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  if (loading) return <LoadingSpinner text="Loading skill tests..." />

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="neo-section-tag mb-1">
          <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
          <span>BENCHMARK SUITE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans">
          Production <span className="neo-highlight">Skill Assessments</span>
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Take 10-question standardized evaluations to calibrate your proficiency score for engineering roles.
        </p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Recent history */}
      {history.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-neutral-600" />
              <h2 className="font-black text-base text-neutral-900 font-sans">
                Recent Completed Analyses
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
              {history.length} EVALUATIONS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black font-mono text-xs text-neutral-500 uppercase">
                  <th className="pb-3 font-bold">Skill Target</th>
                  <th className="pb-3 font-bold">Calibrated Score</th>
                  <th className="pb-3 font-bold">Proficiency</th>
                  <th className="pb-3 font-bold">Timestamp</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 text-sm">
                {history.slice(0, 8).map((h) => (
                  <tr key={h.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 font-bold text-neutral-900 font-sans">
                      {h.skill_name}
                    </td>
                    <td className="py-3 font-mono text-xs font-bold text-neutral-800">
                      {h.status === 'submitted' ? (
                        `${Math.round(h.score_percentage)}%`
                      ) : (
                        <span className="badge-yellow">IN PROGRESS</span>
                      )}
                    </td>
                    <td className="py-3">
                      {h.proficiency_level ? (
                        <span className={proficiencyColor[h.proficiency_level] || 'badge-gray'}>
                          {h.proficiency_level}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 font-mono text-xs text-neutral-500">
                      {h.submitted_at
                        ? new Date(h.submitted_at).toLocaleDateString()
                        : new Date(h.started_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        className="btn-secondary text-[10px] py-1 px-3"
                        onClick={() => navigate(`/app/assessments/${h.id}/result`)}
                        disabled={h.status !== 'submitted'}
                      >
                        <span>VIEW REPORT</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Skill picker */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="neo-section-tag">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>AVAILABLE SKILLS ({skills.length})</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search skill topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-1.5 text-xs"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No skills found"
            description="Try modifying your query."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort()
              .map(([category, categorySkills]) => (
                <div key={category} className="space-y-3">
                  <div className="font-mono text-xs font-black text-neutral-600 tracking-wider uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-neutral-800"></span>
                    <span>{category}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categorySkills.map((skill) => {
                      const lastAttempt = history.find(
                        (h) => h.skill_id === skill.id && h.status === 'submitted'
                      )
                      return (
                        <div
                          key={skill.id}
                          className="card p-4 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-black text-neutral-900 text-sm font-sans truncate">
                              {skill.name}
                            </p>
                            {lastAttempt && (
                              <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
                                Prev: {Math.round(lastAttempt.score_percentage)}%{' '}
                                <span className={proficiencyColor[lastAttempt.proficiency_level] || 'badge-gray'}>
                                  {lastAttempt.proficiency_level}
                                </span>
                              </p>
                            )}
                          </div>

                          <button
                            className="btn-primary text-[10px] py-1.5 px-3 flex-shrink-0"
                            onClick={() => startAssessment(skill.id)}
                            disabled={starting === skill.id}
                          >
                            <Play className="w-3 h-3" />
                            <span>
                              {starting === skill.id
                                ? 'LOADING'
                                : lastAttempt
                                ? 'RETAKE'
                                : 'START'}
                            </span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
