import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  ClipboardList,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderGit2,
  Sparkles,
  RefreshCw,
  Compass,
  Map,
  BookOpen,
  FileText,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface Career {
  id: number
  title: string
  description?: string
}

interface GapSummary {
  total_required: number
  target_met: number
  needs_improvement: number
  critical_gaps: number
  not_assessed: number
}

interface DashboardData {
  profileCompletion: number
  hasTargetCareer: boolean
  targetCareer: Career | null
  assessmentCount: number
  summary: GapSummary | null
  readinessScore: number
  roadmapProgress: { completed: number; total: number } | null
}

const quickActions = [
  {
    icon: Compass,
    title: 'Career Catalogue',
    description: 'Explore 20+ specialized engineering roles and market standards.',
    href: '/app/careers',
  },
  {
    icon: ClipboardList,
    title: 'Skill Assessments',
    description: 'Benchmarking quizzes designed to test production competency.',
    href: '/app/assessments',
  },
  {
    icon: Target,
    title: 'Skill Gap Report',
    description: 'Deep-dive into missing proficiencies vs target requirements.',
    href: '/app/skill-gap',
  },
  {
    icon: Map,
    title: 'Learning Roadmap',
    description: 'Curated step-by-step milestones to achieve job readiness.',
    href: '/app/roadmap',
  },
  {
    icon: FileText,
    title: 'AI Resume Score',
    description: 'Calibrate your resume against ATS and engineering role requirements.',
    href: '/app/resume',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] ?? 'Learner'
  
  const [data, setData] = useState<DashboardData | null>(null)
  const [allCareers, setAllCareers] = useState<Career[]>([])
  const [selectedCareerId, setSelectedCareerId] = useState<string>('')
  const [connecting, setConnecting] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    Promise.allSettled([
      api.get('/api/v1/profile/completion'),
      api.get('/api/v1/skill-gap'),
      api.get('/api/v1/assessments/history'),
      api.get('/api/v1/roadmap'),
      api.get('/api/v1/careers'),
    ]).then(([profileRes, gapRes, histRes, roadmapRes, careersRes]) => {
      const completion =
        profileRes.status === 'fulfilled' ? profileRes.value.data?.percentage ?? 0 : 0
      
      const gapData = gapRes.status === 'fulfilled' ? gapRes.value.data : null
      const hasCareer = gapData?.has_target_career === true
      const targetCareer = gapData?.career ?? null
      const summary: GapSummary | null = gapData?.summary ?? null

      const assessmentHistory = histRes.status === 'fulfilled' ? histRes.value.data || [] : []
      const assessmentCount = Array.isArray(assessmentHistory)
        ? assessmentHistory.filter((item: { status?: string }) => item.status === 'submitted').length
        : 0

      const roadmapRaw = roadmapRes.status === 'fulfilled' ? roadmapRes.value.data : null
      const roadmapProgress =
        roadmapRaw && roadmapRaw.total_milestones > 0
          ? { completed: roadmapRaw.completed_milestones, total: roadmapRaw.total_milestones }
          : null

      const careersList = careersRes.status === 'fulfilled' ? (careersRes.value.data || []) : []
      setAllCareers(careersList)
      if (targetCareer) {
        setSelectedCareerId(String(targetCareer.id))
      } else if (careersList.length > 0) {
        setSelectedCareerId(String(careersList[0].id))
      }

      let calculatedReadiness = 0
      if (summary && summary.total_required > 0) {
        calculatedReadiness = Math.round(
          ((summary.target_met * 1.0 + summary.needs_improvement * 0.5) / summary.total_required) * 100
        )
      }

      setData({
        profileCompletion: completion,
        hasTargetCareer: hasCareer,
        targetCareer,
        assessmentCount,
        summary,
        readinessScore: calculatedReadiness,
        roadmapProgress,
      })
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleConnectCareer = async () => {
    if (!selectedCareerId) return
    setConnecting(true)
    try {
      await api.put('/api/v1/careers/target', { career_id: parseInt(selectedCareerId, 10) })
      await api.post('/api/v1/skill-gap/recalculate')
      loadData()
    } catch {
      setConnecting(false)
      return
    } finally {
      setConnecting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Benchmarking skill workspace..." />
  }

  const chartData = [
    { name: 'Critical Gap', value: data?.summary?.critical_gaps ?? 0, color: '#F472B6' },
    { name: 'Needs Work', value: data?.summary?.needs_improvement ?? 0, color: '#FB923C' },
    { name: 'Target Met', value: data?.summary?.target_met ?? 0, color: '#FBBF24' },
    { name: 'Not Assessed', value: data?.summary?.not_assessed ?? 0, color: '#E4E4E7' },
  ]

  const readinessScore = data?.readinessScore ?? 0
  const totalRequired = data?.summary?.total_required ?? 0
  const notAssessed = data?.summary?.not_assessed ?? 0
  const allUntested = totalRequired > 0 && notAssessed === totalRequired
  const isHighRisk = (data?.summary?.critical_gaps ?? 0) > 0 || (readinessScore < 60 && !allUntested && totalRequired > 0)
  const readinessBadge = !data?.hasTargetCareer
    ? 'NOT CONNECTED'
    : allUntested || totalRequired === 0
      ? 'NOT TESTED'
      : isHighRisk
        ? 'CRITICAL GAP'
        : 'STABLE MATCH'

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Header Section matching Screenshot 1 */}
      <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          {/* Section Indicator Badge */}
          <div className="neo-section-tag">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>ENGINEERING SKILL WORKSPACE</span>
          </div>

          {/* Hero Headline with Screenshot Pink Highlighter Accent */}
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-none font-sans">
            Focus review effort{' '}
            <span className="neo-highlight">where it matters.</span>
          </h1>

          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed pt-1">
            Transparent skill risk, evidence-based competency prioritization, and concrete roadmap
            recommendations tailored for your target engineering career.
          </p>
        </div>

        {/* Top-right Callout Box matching Screenshot 1 (Mint box with shield) */}
        <div className="lg:w-72 bg-[#D1FAE5] border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#18181B] flex items-start gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-200/80 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-900" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-neutral-900 tracking-wide uppercase leading-snug">
              Scores guide review.
            </p>
            <p className="text-xs font-mono text-neutral-800 leading-snug mt-0.5">
              They do not replace hands-on code.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Top Metric Row matching Screenshot 1 (3 clean stat cards with LIVE tags) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Connected Target Career */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-black flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-black" />
            </div>
            <span className="font-mono text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
              LIVE
            </span>
          </div>
          <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
            {data?.hasTargetCareer ? '1' : '0'}
          </div>
          <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-wider">
            Connected career tracks
          </p>
        </div>

        {/* Card 2: Completed Analyses / Assessments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-black flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-black" />
            </div>
            <span className="font-mono text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
              LIVE
            </span>
          </div>
          <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
            {data?.assessmentCount ?? 0}
          </div>
          <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-wider">
            Completed skill tests
          </p>
        </div>

        {/* Card 3: Average Change Risk / Readiness Index */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-black flex items-center justify-center">
              <Target className="w-4 h-4 text-black" />
            </div>
            <span className="font-mono text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
              LIVE
            </span>
          </div>
          <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
            {readinessScore}%
          </div>
          <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-wider">
            Target role readiness
          </p>
        </div>
      </section>

      {/* 3. Section matching Screenshot 2: Connect a Career Repository / Selector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="neo-section-tag">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>CAREER CONNECTION</span>
          </div>
          <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {allCareers.length} AVAILABLE
          </span>
        </div>

        <div className="card">
          <h2 className="text-xl font-black text-neutral-900 tracking-tight font-sans">
            Connect a Target Engineering Career
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 mb-4">
            Choose a target discipline to create a calibrated skill gap & learning workspace for it.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Input / Dropdown pill container matching Screenshot 2 pink outline */}
            <div className="relative flex-1">
              <div className="flex items-center w-full px-4 py-2.5 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#18181B] ring-1 ring-pink-400">
                <Briefcase className="w-4 h-4 text-neutral-500 mr-2 flex-shrink-0" />
                <span className="font-mono text-xs text-neutral-400 font-bold uppercase mr-2 hidden sm:inline">
                  ROLE:
                </span>
                <select
                  aria-label="Target Career"
                  value={selectedCareerId}
                  onChange={(e) => setSelectedCareerId(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none cursor-pointer"
                >
                  {allCareers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pill button matching Screenshot 2 "CONNECT REPOSITORY" with pink drop-shadow */}
            <button
              onClick={handleConnectCareer}
              disabled={connecting || !selectedCareerId}
              className="btn-primary flex-shrink-0"
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SYNCING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CONNECT CAREER</span>
                </>
              )}
            </button>
          </div>

          <p className="font-mono text-[11px] text-neutral-500 mt-3">
            Market requirements are continually refreshed against verified tech standards.
          </p>
        </div>
      </section>

      {/* 4. Section matching Screenshot 2 & 3: Active Workspace Card & Calibrated Diagnostics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="neo-section-tag">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>YOUR WORKSPACE</span>
          </div>
          <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {data?.hasTargetCareer ? '1 CONNECTED' : '0 CONNECTED'}
          </span>
        </div>

        {/* Primary Repository Card matching Screenshot 2 */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                {firstName.toUpperCase()} / {data?.hasTargetCareer ? 'TARGET-ROLE' : 'NO-TARGET'}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-sans mt-0.5">
                {data?.targetCareer?.title || 'Connect a career to calibrate this workspace'}
              </h2>
            </div>

            <Link
              to="/app/skill-gap"
              className="w-11 h-11 rounded-full bg-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#18181B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#18181B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all self-end sm:self-center"
              aria-label="View Skill Gap"
            >
              <ArrowRight className="w-5 h-5 text-neutral-900" />
            </Link>
          </div>

          {/* Solid Black Divider line from screenshot */}
          <div className="my-5 border-t-2 border-black"></div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                LATEST READINESS INDEX
              </span>
              <span className="text-3xl sm:text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {readinessScore}%
              </span>
            </div>

            {/* Pill Badge matching CRITICAL badge from screenshot */}
            <span className={isHighRisk ? 'badge-red' : allUntested || !data?.hasTargetCareer ? 'badge-gray' : 'badge-green'}>
              {readinessBadge}
            </span>
          </div>
        </div>

        {/* 5. Detail Row matching Screenshot 3: Calibrated Risk & Donut Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
          {/* Left Card: Calibrated Change Risk / Progress bar */}
          <div className="card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-widest">
                  CALIBRATED CAREER READINESS
                </span>
                <div className="w-7 h-7 rounded-lg border border-black bg-neutral-50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-neutral-800" />
                </div>
              </div>

              <div className="flex items-baseline gap-3 my-3">
                <span className="text-4xl sm:text-5xl font-black text-neutral-900 font-sans tracking-tight">
                  {readinessScore}%
                </span>
                <span className={isHighRisk ? 'badge-red' : allUntested || !data?.hasTargetCareer ? 'badge-gray' : 'badge-green'}>
                  {readinessBadge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                This is the model's estimate for the benchmarked career requirements. Skill scores rank
                review priority and are computed from calibrated assessments.
              </p>
            </div>

            {/* Custom Neo Pink Progress Bar matching Screenshot 3 */}
            <div className="mt-6">
              <div className="neo-progress-track">
                <div
                  className="neo-progress-fill"
                  style={{ width: `${Math.min(100, Math.max(8, readinessScore))}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-neutral-500 mt-1 uppercase font-bold">
                <span>0% Baseline</span>
                <span>100% Industry Standard</span>
              </div>
            </div>
          </div>

          {/* Right Card: Donut Chart with Black Stroke Borders and Legend */}
          <div className="card">
            <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-widest block mb-1">
              SKILL STATUS DISTRIBUTION
            </span>

            <div className="h-44 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#18181B"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 4 Metric Legend underneath donut chart matching Screenshot 3 */}
            <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-black/10">
              <div>
                <div className="text-lg font-black text-neutral-900 font-sans">
                  {data?.summary?.critical_gaps ?? 0}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                  CRITICAL
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-neutral-900 font-sans">
                  {data?.summary?.needs_improvement ?? 0}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                  NEEDS WORK
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-neutral-900 font-sans">
                  {data?.summary?.target_met ?? 0}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                  ON TARGET
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-neutral-900 font-sans">
                  {data?.summary?.not_assessed ?? 0}
                </div>
                <div className="font-mono text-[10px] text-neutral-500 uppercase font-bold">
                  NOT TESTED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quick Action Cards & Roadmap Progress */}
      <section className="space-y-4">
        <div className="neo-section-tag">
          <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
          <span>QUICK ACTIONS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={href}
              to={href}
              className="card-interactive flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center mb-3 shadow-[2px_2px_0px_#18181B] group-hover:bg-neutral-100 transition-colors">
                  <Icon className="w-5 h-5 text-neutral-900" />
                </div>
                <h3 className="font-black text-neutral-900 text-sm tracking-tight font-sans">
                  {title}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{description}</p>
              </div>

              <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-neutral-900 uppercase tracking-wider mt-4">
                <span>OPEN</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
