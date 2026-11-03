import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, CheckCircle, ShieldCheck } from 'lucide-react'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'

interface Req {
  skill_id: number
  skill: { id: number; name: string; slug: string }
  target_proficiency: string
  importance: string
  weight: number
}

interface CareerDetail {
  id: number
  title: string
  description: string
  responsibilities?: string
  skill_requirements: Req[]
}

const impBadge: Record<string, string> = {
  critical: 'badge-red',
  important: 'badge-yellow',
  nice_to_have: 'badge-gray',
}

const profBadge: Record<string, string> = {
  advanced: 'badge-blue',
  intermediate: 'badge-green',
  beginner: 'badge-gray',
}

export default function CareerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [career, setCareer] = useState<CareerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [targetCareerId, setTargetCareerId] = useState<number | null>(null)
  const [settingTarget, setSettingTarget] = useState(false)

  useEffect(() => {
    api.get('/api/v1/careers/target')
      .then((res) => setTargetCareerId(res.data.target?.career_id ?? null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/api/v1/careers/${id}`)
      .then((res) => setCareer(res.data))
      .catch(() => setError('Failed to load career details.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSetTarget = async () => {
    if (!career) return
    setSettingTarget(true)
    try {
      await api.put('/api/v1/careers/target', { career_id: career.id })
      await api.post('/api/v1/skill-gap/recalculate')
      setTargetCareerId(career.id)
    } catch {
      setError('Failed to set target career.')
    } finally {
      setSettingTarget(false)
    }
  }

  const responsibilities: string[] = career?.responsibilities
    ? (() => {
        try {
          const parsed = JSON.parse(career.responsibilities)
          if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
        } catch {
          /* stored as a semicolon-separated paragraph from seed */
        }
        return career.responsibilities.split(/;|\n/).map((item) => item.trim()).filter(Boolean)
      })()
    : []

  if (loading) return <LoadingSpinner text="Loading career specification..." />
  if (error) return <div className="max-w-4xl mx-auto"><ErrorAlert message={error} /></div>
  if (!career) return null

  const isTarget = targetCareerId === career.id

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <Link
        to="/app/careers"
        className="btn-secondary text-[11px] py-1.5 px-3.5 inline-flex"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO CATALOGUE</span>
      </Link>

      {/* Main Career Header Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="neo-section-tag mb-1">
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
              <span>ROLE SPECIFICATION</span>
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight font-sans">
              {career.title}
            </h1>
          </div>

          {isTarget ? (
            <span className="badge-green self-start sm:self-auto py-1 px-3">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> ACTIVE TARGET
            </span>
          ) : (
            <button
              className="btn-primary self-start sm:self-auto text-xs"
              onClick={handleSetTarget}
              disabled={settingTarget}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{settingTarget ? 'CONNECTING...' : 'SET AS TARGET'}</span>
            </button>
          )}
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed">{career.description}</p>
      </div>

      {responsibilities.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-neutral-700" />
            <h2 className="font-black text-base text-neutral-900 font-sans">
              Production Responsibilities
            </h2>
          </div>
          <ul className="space-y-2">
            {responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg text-neutral-900 font-sans">
            Calibrated Competency Requirements ({career.skill_requirements.length})
          </h2>
          <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
            TARGET CRITERIA
          </span>
        </div>

        {career.skill_requirements.length === 0 ? (
          <p className="font-mono text-xs text-neutral-500">No skill requirements specified.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black font-mono text-xs text-neutral-500 uppercase">
                  <th className="pb-3 font-bold">Skill Competency</th>
                  <th className="pb-3 font-bold">Target Proficiency</th>
                  <th className="pb-3 font-bold">Importance Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 text-sm">
                {career.skill_requirements.map((req) => (
                  <tr key={req.skill_id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 font-bold text-neutral-900 font-sans">
                      {req.skill.name}
                    </td>
                    <td className="py-3">
                      <span className={profBadge[req.target_proficiency] || 'badge-gray'}>
                        {req.target_proficiency}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={impBadge[req.importance] || 'badge-gray'}>
                        {req.importance.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
