import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RefreshCw, Target, Play, ShieldCheck, ArrowRight, Compass } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../contexts/AuthContext'

interface SkillGap {
  skill_id: number
  skill_name: string
  current_proficiency: string | null
  target_proficiency: string
  importance: string
  gap_status: string
  priority_score: number
  recommended_action: string
}

interface GapReport {
  has_target_career: boolean
  career: { id: number; title: string } | null
  summary: {
    total_required: number
    target_met: number
    needs_improvement: number
    critical_gaps: number
    not_assessed: number
  }
  skill_gaps: SkillGap[]
}

const profNum: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }

const statusBadgeClass: Record<string, string> = {
  target_met: 'badge-green',
  needs_improvement: 'badge-yellow',
  critical_gap: 'badge-red',
  not_assessed: 'badge-gray',
}

const importanceBadgeClass: Record<string, string> = {
  critical: 'badge-red',
  important: 'badge-yellow',
  nice_to_have: 'badge-gray',
}

export default function SkillGapPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [report, setReport] = useState<GapReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError] = useState('')
  const [startingSkillId, setStartingSkillId] = useState<number | null>(null)

  const fetchReport = () => {
    setLoading(true)
    setError('')
    api.get('/api/v1/skill-gap')
      .then((res) => setReport(res.data))
      .catch(() => setError('Failed to load skill gap report.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      const res = await api.post('/api/v1/skill-gap/recalculate')
      setReport(res.data)
    } catch {
      setError('Recalculation failed.')
    } finally {
      setRecalculating(false)
    }
  }

  const handleStartAssessment = async (skillId: number, skillName: string) => {
    setStartingSkillId(skillId)
    setError('')
    try {
      const res = await api.post('/api/v1/assessments', { skill_id: skillId })
      navigate(`/app/assessments/${res.data.assessment_id}`, {
        state: {
          questions: res.data.questions,
          skill_id: res.data.skill_id,
          skillName,
          returnTo: '/app/skill-gap',
        },
      })
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to start assessment.')
    } finally {
      setStartingSkillId(null)
    }
  }

  const chartData =
    report?.skill_gaps.slice(0, 8).map((g) => ({
      name: g.skill_name,
      current: profNum[g.current_proficiency || ''] || 0,
      target: profNum[g.target_proficiency] || 0,
    })) || []

  // Donut chart data matching Screenshot 3
  const pieData = [
    { name: 'Critical Gaps', value: report?.summary?.critical_gaps || 0, color: '#F472B6' },
    { name: 'Needs Work', value: report?.summary?.needs_improvement || 0, color: '#FB923C' },
    { name: 'Target Met', value: report?.summary?.target_met || 0, color: '#FBBF24' },
    { name: 'Not Assessed', value: report?.summary?.not_assessed || 0, color: '#E4E4E7' },
  ]

  const totalRequired = report?.summary?.total_required || 1
  const targetMet = report?.summary?.target_met || 0
  const completionRate = Math.round((targetMet / totalRequired) * 100)

  if (loading) return <LoadingSpinner text="Computing calibrated skill gap matrix..." />

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header strictly matching Screenshot 3 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          {/* Breadcrumb indicator */}
          <div className="neo-section-tag mb-1">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>{user?.name?.toUpperCase() || 'USER'} / {report?.career?.title?.toUpperCase() || 'MAIN TRACK'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans">
            {report?.career?.title || 'Target Career'} Skill Gap Analysis
          </h1>
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-500 mt-1">
            <span>○</span>
            <span>calibrated-profile-v2</span>
          </div>
        </div>

        {/* Action buttons matching Screenshot 3 top right pills */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="btn-secondary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'CALCULATING' : 'RECALCULATE'}</span>
          </button>

          <Link
            to="/app/careers"
            className="btn-primary"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>CHANGE CAREER</span>
          </Link>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {!report?.has_target_career ? (
        <EmptyState
          icon={Target}
          title="No target career connected"
          description="Select a target engineering discipline to initialize automated skill gap benchmarking."
          action={
            <Link to="/app/careers" className="btn-primary mt-4">
              Browse Career Tracks
            </Link>
          }
        />
      ) : (
        <>
          {/* 4 Stat Cards Row matching Screenshot 3 top grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  COMPLETION RATE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {completionRate}%
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">Target Met Ratio</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  ASSESSED SKILLS
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {totalRequired - report.summary.not_assessed}
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">Of {totalRequired} Required</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  CRITICAL GAPS
                </span>
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {report.summary.critical_gaps}
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">Immediate Priority</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  NEEDS WORK
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {report.summary.needs_improvement}
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">Sub-Target Levels</p>
            </div>
          </div>

          {/* Calibrated Risk & Donut Row matching Screenshot 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Card: Calibrated Change Risk with Pink Progress Bar */}
            <div className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-widest">
                    CALIBRATED BENCHMARK SCORE
                  </span>
                  <div className="w-7 h-7 rounded-lg border border-black bg-neutral-50 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-neutral-800" />
                  </div>
                </div>

                <div className="flex items-baseline gap-3 my-3">
                  <span className="text-5xl font-black text-neutral-900 font-sans tracking-tight">
                    {completionRate}%
                  </span>
                  <span className={report.summary.critical_gaps > 0 ? 'badge-red' : 'badge-green'}>
                    {report.summary.critical_gaps > 0 ? 'CRITICAL GAP' : 'OPTIMAL'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  This is the model's estimate for the analyzed target requirements. File scores rank
                  review priority and guide high-leverage skill acquisition.
                </p>
              </div>

              {/* Neo Pink Progress Bar matching Screenshot 3 */}
              <div className="mt-6">
                <div className="neo-progress-track">
                  <div
                    className="neo-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(6, completionRate))}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-neutral-500 mt-1 uppercase font-bold">
                  <span>Current Baseline</span>
                  <span>Target Threshold</span>
                </div>
              </div>
            </div>

            {/* Right Card: Donut Chart with Black Stroke and Legend */}
            <div className="card">
              <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-widest block mb-1">
                COMPETENCY COMPOSITION
              </span>

              <div className="h-44 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#18181B"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 4 Metric Legend */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-black/10">
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {report.summary.critical_gaps}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                    CRITICAL
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {report.summary.needs_improvement}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                    HIGH
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {report.summary.target_met}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                    MEDIUM
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {report.summary.not_assessed}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                    LOW
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart comparing Current vs Target */}
          {chartData.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-black text-base text-neutral-900 font-sans">
                  Current vs. Target Proficiency Matrix
                </h2>
                <span className="font-mono text-[11px] text-neutral-500 uppercase">
                  Top 8 Priority Skills
                </span>
              </div>
              <p className="font-mono text-xs text-neutral-500 mb-4">
                1 = Beginner, 2 = Intermediate, 3 = Advanced
              </p>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip
                    formatter={(val) => {
                      const n = Number(val ?? 0)
                      return ['beginner', 'intermediate', 'advanced'][n - 1] || 'not assessed'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" name="Current" fill="#F472B6" radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={1.5} />
                  <Bar dataKey="target" name="Target" fill="#18181B" radius={[4, 4, 0, 0]} stroke="#000" strokeWidth={1.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Skill Gaps Breakdown Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg text-neutral-900 font-sans">
                Ranked Review Priority ({report.skill_gaps.length} Skills)
              </h2>
              <span className="font-mono text-xs text-neutral-500 font-bold uppercase">
                CALIBRATED BREAKDOWN
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black font-mono text-xs text-neutral-500 uppercase">
                    <th className="pb-3 font-bold">Skill</th>
                    <th className="pb-3 font-bold">Current</th>
                    <th className="pb-3 font-bold">Target</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold">Importance</th>
                    <th className="pb-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 text-sm">
                  {report.skill_gaps.map((gap) => (
                    <tr key={gap.skill_id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 font-bold text-neutral-900 font-sans">
                        {gap.skill_name}
                      </td>
                      <td className="py-3.5 font-mono text-xs text-neutral-600 uppercase">
                        {gap.current_proficiency || 'Not tested'}
                      </td>
                      <td className="py-3.5 font-mono text-xs font-bold text-neutral-900 uppercase">
                        {gap.target_proficiency}
                      </td>
                      <td className="py-3.5">
                        <span className={statusBadgeClass[gap.gap_status] || 'badge-gray'}>
                          {gap.gap_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={importanceBadgeClass[gap.importance] || 'badge-gray'}>
                          {gap.importance.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => handleStartAssessment(gap.skill_id, gap.skill_name)}
                          disabled={startingSkillId === gap.skill_id}
                          className="btn-primary text-[10px] py-1.5 px-3.5"
                        >
                          <Play className="w-3 h-3" />
                          <span>{startingSkillId === gap.skill_id ? 'TESTING...' : 'ASSESS'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
