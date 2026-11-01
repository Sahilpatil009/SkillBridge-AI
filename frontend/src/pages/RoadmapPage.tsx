import { useState, useEffect, useCallback } from 'react'
import { Map, CheckCircle, Clock, RefreshCw, X, ChevronLeft, ChevronRight, Award, AlertTriangle, Play, Video, ExternalLink } from 'lucide-react'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

// ---- Types ----
interface Milestone {
  id: number; skill_id: number; skill_name: string; title: string; description?: string
  current_proficiency?: string; target_proficiency: string
  gap_status?: string; importance?: string
  estimated_hours?: number; status: string; order_index: number; completed_at?: string
}
interface Roadmap {
  id: number; career_title: string; version: number; status: string
  total_milestones: number; completed_milestones: number
  estimated_remaining_hours?: number; milestones: Milestone[]
}
interface Option { id: number; text: string; order_index: number }
interface Question {
  id: number; text: string; difficulty: string
  skill_id: number; topic_id: number | null; options: Option[]
}
interface AssessmentResult {
  id: number; skill_id: number; skill_name: string
  score_percentage: number; correct_count: number; total_questions: number
  proficiency_level: string; submitted_at: string
}

// ---- Assessment Modal ----
function AssessmentModal({
  skillName, questions, assessmentId, onPass, onFail, onClose,
}: {
  skillName: string
  questions: Question[]
  assessmentId: number
  onPass: (result: AssessmentResult) => void
  onFail: (result: AssessmentResult) => void
  onClose: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState('')

  const q = questions[current]
  const total = questions.length
  const answered = Object.keys(answers).length
  const allAnswered = answered === total
  const PASS_THRESHOLD = 75

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      const payload = {
        answers: questions.map(qu => ({
          question_id: qu.id,
          selected_option_id: answers[qu.id] ?? null,
        }))
      }
      const res = await api.post(`/api/v1/assessments/${assessmentId}/submit`, payload)
      setResult(res.data)
      setSubmitted(true)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && result) {
    const pct = Math.round(result.score_percentage)
    const passed = pct >= PASS_THRESHOLD
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed
                ? <CheckCircle className="w-8 h-8 text-green-600" />
                : <AlertTriangle className="w-8 h-8 text-red-500" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {passed ? 'Assessment Passed!' : 'Not Quite There Yet'}
            </h2>
            <p className="text-3xl font-bold mt-3 mb-1 text-gray-900">{pct}%</p>
            <p className="text-sm text-gray-500 mb-2">
              {result.correct_count} / {result.total_questions} correct
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all ${passed ? 'bg-green-500' : 'bg-red-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {passed ? (
              <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 mb-5">
                Great work! You scored above the 75% threshold. This milestone will now be marked as completed.
              </p>
            ) : (
              <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-5">
                You need at least <strong>75%</strong> to complete this milestone. You scored {pct}%. Review the material and try again!
              </p>
            )}
            <div className="flex gap-3 justify-center">
              {passed ? (
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={() => onPass(result)}
                >
                  <CheckCircle className="w-4 h-4" /> Mark as Completed
                </button>
              ) : (
                <button
                  className="btn-danger flex items-center gap-2"
                  onClick={() => onFail(result)}
                >
                  <RefreshCw className="w-4 h-4" /> Retake Assessment
                </button>
              )}
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">{skillName} — Completion Check</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Answer {total} questions. Score ≥ 75% to mark this milestone complete.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Question {current + 1} of {total}</span>
          <span className="text-xs text-gray-500">{answered} answered</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
          <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(answered / total) * 100}%` }} />
        </div>

        {/* Dots */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {questions.map((qu, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === current ? 'bg-indigo-600' :
                answers[qu.id] !== undefined ? 'bg-emerald-400' : 'bg-gray-200'
              }`}
              title={`Q${i + 1}`}
            />
          ))}
        </div>

        {error && <div className="mb-3"><ErrorAlert message={error} onClose={() => setError('')} /></div>}

        {/* Question */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-gray-900 font-medium text-sm leading-relaxed mb-4">{q.text}</p>
          <div className="space-y-2">
            {[...q.options].sort((a, b) => a.order_index - b.order_index).map(opt => {
              const selected = answers[q.id] === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-medium'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-700'
                  }`}
                >
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            className="btn-secondary flex items-center gap-1 text-sm"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="flex items-center gap-2">
            {current < total - 1 ? (
              <button
                className="btn-primary flex items-center gap-1 text-sm"
                onClick={() => setCurrent(c => c + 1)}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  allAnswered
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
              >
                {submitting ? <><Clock className="w-4 h-4 animate-spin" /> Submitting...</> : <><Award className="w-4 h-4" /> Submit</>}
              </button>
            )}
          </div>
        </div>
        {!allAnswered && (
          <p className="text-center text-xs text-gray-400 mt-2">{total - answered} question{total - answered !== 1 ? 's' : ''} remaining</p>
        )}
      </div>
    </div>
  )
}

// ---- Status colors ----
const statusColors: Record<string, string> = {
  not_started: 'border-2 border-black bg-white shadow-[3px_3px_0px_#18181B]',
  in_progress: 'border-2 border-black bg-[#FEF9C3] shadow-[3px_3px_0px_#18181B]',
  completed: 'border-2 border-black bg-[#DCFCE7] shadow-[3px_3px_0px_#18181B]',
}
const gapBadge: Record<string, string> = {
  critical_gap: 'badge-red',
  needs_improvement: 'badge-yellow',
  not_assessed: 'badge-gray',
  target_met: 'badge-blue',
}
// Extra card class for milestones where target is already met — show as "advance further"
const targetMetCardClass = 'border-2 border-[#0EA5E9] bg-[#F0F9FF] shadow-[3px_3px_0px_#0EA5E9]'

interface YouTubeVideo {
  title: string
  channel: string
  url: string
  duration: string
}

const YOUTUBE_RESOURCES: Record<string, YouTubeVideo[]> = {
  python: [
    { title: 'Python Full Course for Beginners [2024]', channel: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', duration: '6h' },
    { title: 'Python for Beginners – Full Course', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: '4.5h' },
  ],
  javascript: [
    { title: 'JavaScript Full Course 2024', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=EerdGm-ehJQ', duration: '7h' },
    { title: 'JavaScript in 100 Seconds', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=DHjqpvDnNGE', duration: '2m' },
  ],
  react: [
    { title: 'React Full Course for Beginners', channel: 'Dave Gray', url: 'https://www.youtube.com/watch?v=RVFAyFWO4go', duration: '8h' },
    { title: 'React in 100 Seconds', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', duration: '2m' },
  ],
  typescript: [
    { title: 'TypeScript Full Course for Beginners', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=30LWjhZzg50', duration: '5h' },
    { title: 'TypeScript Tutorial for Beginners', channel: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=d56mG7DezGs', duration: '1h' },
  ],
  sql: [
    { title: 'SQL Tutorial - Full Database Course', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', duration: '4.5h' },
    { title: 'SQL in 100 Seconds', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=zsjvFFKOm3c', duration: '2m' },
  ],
  docker: [
    { title: 'Docker Tutorial for Beginners [Full Course]', channel: 'TechWorld with Nana', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', duration: '3h' },
    { title: 'Docker in 100 Seconds', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', duration: '2m' },
  ],
  fastapi: [
    { title: 'FastAPI Course for Beginners - Build an API', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA', duration: '19h' },
    { title: 'FastAPI Tutorial - Crash Course', channel: 'Amigoscode', url: 'https://www.youtube.com/watch?v=7t2alSnE2-I', duration: '1.5h' },
  ],
  git: [
    { title: 'Git and GitHub for Beginners - Crash Course', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk', duration: '1h' },
    { title: 'Git in 100 Seconds', channel: 'Fireship', url: 'https://www.youtube.com/watch?v=hwP7WQkmECE', duration: '2m' },
  ],
  machine: [
    { title: 'Machine Learning Course for Beginners', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=NWONtOFqqoI', duration: '10h' },
    { title: 'Complete Machine Learning Playlist', channel: 'Krish Naik', url: 'https://www.youtube.com/watch?v=JxgmHe2N9nY', duration: 'Playlist' },
  ],
  algorithms: [
    { title: 'Algorithms and Data Structures Tutorial', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=8hly31xKli0', duration: '5h' },
    { title: 'NeetCode 150 - Complete Roadmap', channel: 'NeetCode', url: 'https://www.youtube.com/watch?v=KLlXCFG5TnA', duration: 'Course' },
  ],
  node: [
    { title: 'Node.js and Express.js - Full Course', channel: 'freeCodeCamp.org', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', duration: '8h' },
    { title: 'Node.js Tutorial for Beginners', channel: 'Programming with Mosh', url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4', duration: '1h' },
  ],
}

function getVideosForSkill(skillName: string): YouTubeVideo[] {
  const normalized = skillName.toLowerCase()
  for (const [key, videos] of Object.entries(YOUTUBE_RESOURCES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return videos
    }
  }
  return [
    {
      title: `${skillName} Full Crash Course & Tutorial`,
      channel: 'YouTube Curated Tutorial',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' full course tutorial')}`,
      duration: 'Course',
    },
    {
      title: `${skillName} in 100 Seconds / Overview`,
      channel: 'YouTube Video Overview',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' in 100 seconds')}`,
      duration: 'Quick',
    },
  ]
}

// ---- Main Page ----
export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Assessment modal state
  const [assessmentModal, setAssessmentModal] = useState<{
    milestoneId: number
    skillName: string
    questions: Question[]
    assessmentId: number
  } | null>(null)
  const [startingAssessmentId, setStartingAssessmentId] = useState<number | null>(null)

  const fetchRoadmap = () => {
    setLoading(true); setError('')
    api.get('/api/v1/roadmap')
      .then(res => setRoadmap(res.data?.roadmap === null ? null : (res.data.milestones !== undefined ? res.data : null)))
      .catch(() => setError('Failed to load roadmap.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRoadmap() }, [])

  const handleGenerate = async () => {
    setGenerating(true); setError('')
    try { const res = await api.post('/api/v1/roadmap/generate'); setRoadmap(res.data) }
    catch (e: any) { setError(e.response?.data?.detail || 'Failed to generate roadmap.') }
    finally { setGenerating(false) }
  }

  const handleRegenerate = () => {
    if (window.confirm('Regenerate your roadmap? Completed milestones will be preserved, but priorities may change.')) {
      handleGenerate()
    }
  }

  const updateStatus = async (milestoneId: number, newStatus: string) => {
    setUpdatingId(milestoneId)
    try {
      const res = await api.patch(`/api/v1/roadmap/milestones/${milestoneId}`, { status: newStatus })
      setRoadmap(prev => prev ? {
        ...prev,
        completed_milestones: prev.milestones.filter(m => (m.id === milestoneId ? newStatus : m.status) === 'completed').length,
        milestones: prev.milestones.map(m => m.id === milestoneId ? { ...m, ...res.data } : m)
      } : null)
    } catch { setError('Failed to update milestone.') }
    finally { setUpdatingId(null) }
  }

  // When user clicks "Completed" — launch the assessment gate
  const handleCompleteClick = async (milestone: Milestone) => {
    // Already completed — allow unchecking without assessment
    if (milestone.status === 'completed') {
      updateStatus(milestone.id, 'not_started')
      return
    }
    setStartingAssessmentId(milestone.id)
    setError('')
    try {
      const res = await api.post('/api/v1/assessments', { skill_id: milestone.skill_id })
      setAssessmentModal({
        milestoneId: milestone.id,
        skillName: milestone.skill_name,
        questions: res.data.questions,
        assessmentId: res.data.assessment_id,
      })
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to start assessment.')
    } finally {
      setStartingAssessmentId(null)
    }
  }

  const handleAssessmentPass = async (result: AssessmentResult) => {
    if (!assessmentModal) return
    setAssessmentModal(null)
    await updateStatus(assessmentModal.milestoneId, 'completed')
  }

  const handleAssessmentFail = async (result: AssessmentResult) => {
    // Close modal so user can review, keep milestone as-is
    setAssessmentModal(null)
  }

  if (loading) return <LoadingSpinner text="Loading roadmap..." />

  const pct = roadmap ? Math.round((roadmap.completed_milestones / Math.max(roadmap.total_milestones, 1)) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* Assessment gate modal */}
      {assessmentModal && (
        <AssessmentModal
          skillName={assessmentModal.skillName}
          questions={assessmentModal.questions}
          assessmentId={assessmentModal.assessmentId}
          onPass={handleAssessmentPass}
          onFail={handleAssessmentFail}
          onClose={() => setAssessmentModal(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Roadmap</h1>
          {roadmap && <p className="text-gray-500 text-sm mt-1">For: <span className="font-medium text-indigo-600">{roadmap.career_title}</span> v{roadmap.version}</p>}
        </div>
        {roadmap && (
          <button className="btn-secondary flex items-center gap-2 text-sm" onClick={handleRegenerate} disabled={generating}>
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        )}
      </div>

      {error && <div className="mb-4"><ErrorAlert message={error} onClose={() => setError('')} /></div>}

      {!roadmap ? (
        <EmptyState icon={Map} title="No Roadmap Yet"
          description="Generate a personalized roadmap based on your current skill gaps and target career."
          action={
            <button className="btn-primary mt-2 flex items-center gap-2" onClick={handleGenerate} disabled={generating}>
              {generating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Roadmap'}
            </button>
          } />
      ) : (
        <>
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-neutral-600 uppercase">
                {roadmap.completed_milestones}/{roadmap.total_milestones} MILESTONES COMPLETED
              </span>
              <span className="font-mono text-xs font-bold text-neutral-900">{pct}%</span>
            </div>
            <div className="neo-progress-track">
              <div className="neo-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            {roadmap.estimated_remaining_hours && (
              <p className="font-mono text-xs text-neutral-500 mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~{roadmap.estimated_remaining_hours} hours remaining (calibrated estimate)
              </p>
            )}
          </div>

          {/* Assessment gate notice */}
          <div className="mb-5 bg-[#FEF08A] border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#18181B] flex items-start gap-2.5">
            <Award className="w-4 h-4 text-neutral-900 flex-shrink-0 mt-0.5" />
            <p className="font-mono text-xs text-neutral-900">
              <strong>Assessment required to complete milestones.</strong> Clicking "Mark Complete" will launch an automated evaluation. Score ≥ 75% to unlock milestone certification.
            </p>
          </div>

          <div className="space-y-3">
            {roadmap.milestones.map((m, i) => {
              const isAdvance = m.gap_status === 'target_met'
              const cardClass = isAdvance
                ? targetMetCardClass
                : (statusColors[m.status] || statusColors.not_started)
              return (
              <div key={m.id} className={`rounded-xl p-4 transition-all ${cardClass}`}>
                {/* Advance Further Banner */}
                {isAdvance && (
                  <div className="flex items-center gap-1.5 mb-3 pb-2 border-b-2 border-[#0EA5E9]/40">
                    <span className="text-[10px]">🚀</span>
                    <span className="font-mono text-[10px] font-bold text-[#0369A1] uppercase tracking-widest">
                      ADVANCE FURTHER — Target Already Met
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    m.status === 'completed' ? 'bg-green-500 text-white' :
                    isAdvance ? 'bg-[#0EA5E9] text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {m.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{m.skill_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{m.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {m.gap_status && <span className={gapBadge[m.gap_status] || 'badge-gray'}>{m.gap_status.replace(/_/g, ' ')}</span>}
                        {m.estimated_hours && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Clock className="w-3 h-3" />~{m.estimated_hours}h</span>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.current_proficiency || 'not assessed'} &rarr; <span className="font-medium">{m.target_proficiency}</span>
                    </p>
                    {m.description && <p className="text-xs text-gray-400 mt-1">{m.description}</p>}
                    {m.completed_at && <p className="text-xs text-green-600 mt-1">Completed {new Date(m.completed_at).toLocaleDateString()}</p>}

                    {/* YouTube Video Tutorials Section */}
                    <div className="mt-3.5 pt-3 border-t-2 border-black/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-neutral-800 uppercase">
                          <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                          <span>YOUTUBE VIDEO LESSONS</span>
                        </div>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(m.skill_name + ' full course tutorial')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] font-bold text-neutral-500 hover:text-black flex items-center gap-1 hover:underline"
                        >
                          <span>SEARCH MORE</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getVideosForSkill(m.skill_name).map((video, vIdx) => (
                          <a
                            key={vIdx}
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2.5 p-2 bg-white/90 hover:bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#18181B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#18181B] transition-all group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-rose-100 border border-black/40 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-rose-200">
                              <Play className="w-3 h-3 text-rose-600 fill-rose-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate leading-snug font-sans">
                                {video.title}
                              </p>
                              <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500 mt-0.5">
                                <span className="truncate">{video.channel}</span>
                                <span>&bull;</span>
                                <span className="text-neutral-800 font-bold">{video.duration}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-black flex-shrink-0 self-center" />
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1.5 mt-3.5 flex-wrap">
                      {/* Not Started */}
                      <button
                        disabled={updatingId === m.id || m.status === 'not_started'}
                        onClick={() => updateStatus(m.id, 'not_started')}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                          m.status === 'not_started' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                        } disabled:opacity-50`}
                      >
                        Not Started
                      </button>

                      {/* In Progress */}
                      <button
                        disabled={updatingId === m.id || m.status === 'in_progress'}
                        onClick={() => updateStatus(m.id, 'in_progress')}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                          m.status === 'in_progress' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                        } disabled:opacity-50`}
                      >
                        In Progress
                      </button>

                      {/* Completed — triggers assessment gate */}
                      <button
                        disabled={updatingId === m.id || startingAssessmentId === m.id}
                        onClick={() => {
                          if (m.status === 'completed') {
                            updateStatus(m.id, 'not_started')
                          } else {
                            handleCompleteClick(m)
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
                          m.status === 'completed'
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-400 hover:text-green-700'
                        } disabled:opacity-50`}
                      >
                        {startingAssessmentId === m.id ? (
                          <><RefreshCw className="w-3 h-3 animate-spin" /> Loading...</>
                        ) : m.status === 'completed' ? (
                          <><CheckCircle className="w-3 h-3" /> Completed</>
                        ) : (
                          <><Award className="w-3 h-3" /> Mark Complete</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        </>
      )}
    </div>
  )
}
