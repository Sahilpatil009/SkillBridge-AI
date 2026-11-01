import { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BarChart2,
  Clock,
  Award,
  ShieldCheck,
} from 'lucide-react'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'

// ---- Types ----
interface Option {
  id: number
  text: string
  order_index: number
}
interface Question {
  id: number
  text: string
  difficulty: string
  skill_id: number
  topic_id: number | null
  options: Option[]
}
interface TopicPerformance {
  topic_name: string
  correct: number
  total: number
  percentage: number
}
interface QuestionResult {
  question_id: number
  question_text: string
  selected_option_id: number | null
  correct_option_id: number
  is_correct: boolean
  explanation: string | null
  topic_name: string | null
}
interface AssessmentResult {
  id: number
  skill_id: number
  skill_name: string
  score_percentage: number
  correct_count: number
  total_questions: number
  proficiency_level: string
  submitted_at: string
  topic_performance: TopicPerformance[]
  question_results: QuestionResult[]
}

const difficultyBadge: Record<string, string> = {
  easy: 'badge-green',
  intermediate: 'badge-yellow',
  hard: 'badge-red',
}
const proficiencyColor: Record<string, string> = {
  beginner: 'badge-red',
  intermediate: 'badge-yellow',
  advanced: 'badge-green',
}

// ---- Quiz Component ----
function QuizView({
  questions,
  skillName,
  assessmentId,
  onDone,
}: {
  questions: Question[]
  skillName: string
  assessmentId: number
  onDone: (result: AssessmentResult) => void
}) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const q = questions[current]
  const total = questions.length
  const answered = Object.keys(answers).length
  const allAnswered = answered === total

  const selectOption = (optionId: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          selected_option_id: answers[q.id] ?? null,
        })),
      }
      const res = await api.post(`/api/v1/assessments/${assessmentId}/submit`, payload)
      onDone(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="neo-section-tag mb-1">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>ACTIVE ASSESSMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-sans">
            {skillName} Evaluation
          </h1>
          <p className="font-mono text-xs text-neutral-500 mt-0.5">
            QUESTION {current + 1} OF {total} &bull; {answered} ANSWERED
          </p>
        </div>

        {/* Progress indicator dots */}
        <div className="flex gap-1.5 flex-wrap max-w-[200px] justify-start sm:justify-end">
          {questions.map((q_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-4 h-4 rounded-full border border-black font-mono text-[9px] font-bold flex items-center justify-center transition-all ${
                i === current
                  ? 'bg-black text-white shadow-[1px_1px_0px_#EC4899]'
                  : answers[q_.id] !== undefined
                  ? 'bg-emerald-300 text-black'
                  : 'bg-white text-neutral-400'
              }`}
              title={`Q${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Neo Progress bar */}
      <div className="neo-progress-track">
        <div
          className="neo-progress-fill"
          style={{ width: `${Math.max(5, (answered / total) * 100)}%` }}
        />
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Question Card */}
      <div className="card space-y-5">
        <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-4">
          <p className="text-base sm:text-lg font-bold text-neutral-900 leading-relaxed font-sans">
            <span className="font-mono text-pink-600 mr-2">Q{current + 1}.</span>
            {q.text}
          </p>
          <span className={`flex-shrink-0 ${difficultyBadge[q.difficulty] || 'badge-gray'}`}>
            {q.difficulty}
          </span>
        </div>

        <div className="space-y-3">
          {[...q.options]
            .sort((a, b) => a.order_index - b.order_index)
            .map((opt) => {
              const selected = answers[q.id] === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => selectOption(opt.id)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border-2 border-black text-sm transition-all ${
                    selected
                      ? 'bg-pink-100 text-neutral-900 shadow-[3px_3px_0px_#EC4899] font-bold'
                      : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#18181B] text-neutral-800'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-neutral-400 mr-2 uppercase">
                    [{opt.order_index + 1}]
                  </span>
                  {opt.text}
                </button>
              )
            })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          className="btn-secondary text-xs"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>PREVIOUS</span>
        </button>

        <div className="flex items-center gap-2">
          {current < total - 1 ? (
            <button
              className="btn-secondary text-xs"
              onClick={() => setCurrent((c) => c + 1)}
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              className="btn-primary text-xs"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  <span>SUBMIT ASSESSMENT</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Result Component ----
function ResultView({
  result,
  onRetake,
  skillName,
}: {
  result: AssessmentResult
  onRetake: () => void
  skillName: string
}) {
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(true)
  const pct = Math.round(result.score_percentage)

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Score card matching Screenshot 3 calibrated risk style */}
      <div className="card text-center py-8">
        <div className="neo-section-tag justify-center mb-2">
          <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
          <span>ASSESSMENT COMPLETE</span>
        </div>

        <h1 className="text-3xl font-black text-neutral-900 tracking-tight font-sans">
          {result.skill_name || skillName} Evaluation
        </h1>

        <div className="flex items-center justify-center gap-3 my-6">
          <div className="text-6xl font-black text-neutral-900 font-sans tracking-tight">
            {pct}%
          </div>
          <span className={`py-1.5 px-4 text-xs font-mono font-bold ${proficiencyColor[result.proficiency_level] || 'badge-gray'}`}>
            {result.proficiency_level.toUpperCase()}
          </span>
        </div>

        <p className="font-mono text-xs text-neutral-600 uppercase">
          {result.correct_count} CORRECT OUT OF {result.total_questions} QUESTIONS
        </p>

        {/* Neo Progress bar */}
        <div className="max-w-md mx-auto mt-6">
          <div className="neo-progress-track">
            <div className="neo-progress-fill" style={{ width: `${Math.max(6, pct)}%` }} />
          </div>
        </div>
      </div>

      {/* Topic performance breakdown */}
      {result.topic_performance.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-base text-neutral-900 font-sans">
              Calibrated Sub-Topic Breakdown
            </h2>
            <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
              TOPIC METRICS
            </span>
          </div>

          <div className="space-y-4">
            {result.topic_performance.map((tp) => (
              <div key={tp.topic_name}>
                <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                  <span className="text-neutral-800">{tp.topic_name}</span>
                  <span className="text-neutral-600">
                    {tp.correct}/{tp.total} &bull; {Math.round(tp.percentage)}%
                  </span>
                </div>
                <div className="neo-progress-track h-3">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${tp.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question review */}
      <div className="card">
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setShowDetails((d) => !d)}
        >
          <h2 className="font-black text-base text-neutral-900 font-sans">
            Question Review ({result.question_results.length})
          </h2>
          <ChevronRight
            className={`w-4 h-4 text-neutral-500 transition-transform ${
              showDetails ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showDetails && (
          <div className="mt-5 space-y-4 pt-4 border-t-2 border-black/10">
            {result.question_results.map((qr, i) => (
              <div
                key={qr.question_id}
                className={`rounded-2xl border-2 border-black p-4 ${
                  qr.is_correct
                    ? 'bg-[#DCFCE7] shadow-[2px_2px_0px_#18181B]'
                    : 'bg-[#FCE7F3] shadow-[2px_2px_0px_#18181B]'
                }`}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  {qr.is_correct ? (
                    <CheckCircle className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-bold text-neutral-900 font-sans">
                    <span className="font-mono text-xs text-neutral-500 mr-1.5">Q{i + 1}.</span>
                    {qr.question_text}
                  </p>
                </div>
                {qr.topic_name && (
                  <p className="font-mono text-[10px] text-neutral-600 uppercase ml-6 mb-1">
                    TOPIC: {qr.topic_name}
                  </p>
                )}
                {qr.explanation && (
                  <p className="font-mono text-xs text-neutral-800 ml-6 mt-2 border-l-2 border-black pl-3 py-0.5">
                    {qr.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <button className="btn-secondary" onClick={onRetake}>
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RETAKE TEST</span>
        </button>
        <button className="btn-primary" onClick={() => navigate('/app/skill-gap')}>
          <BarChart2 className="w-3.5 h-3.5" />
          <span>VIEW SKILL GAP REPORT</span>
        </button>
        <button className="btn-secondary" onClick={() => navigate('/app/assessments')}>
          <span>ALL ASSESSMENTS</span>
        </button>
      </div>
    </div>
  )
}

// ---- Main Page ----
export default function AssessmentFlowPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const locationState = location.state as {
    questions?: Question[]
    skill_id?: number
    skillName?: string
  } | null

  const [questions, setQuestions] = useState<Question[]>(locationState?.questions || [])
  const [skillName, setSkillName] = useState(locationState?.skillName || '')
  const [assessmentId, setAssessmentId] = useState<number | null>(
    id && !/result/.test(location.pathname) ? parseInt(id, 10) : null
  )
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isResultRoute = location.pathname.endsWith('/result')

  const loadResult = useCallback(async (aId: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/v1/assessments/${aId}/result`)
      setResult(res.data)
      setSkillName(res.data.skill_name)
    } catch {
      setError('Could not load assessment result.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isResultRoute && id) {
      loadResult(parseInt(id, 10))
    }
  }, [id, isResultRoute, loadResult])

  const handleRetake = async () => {
    if (!result) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/v1/assessments', { skill_id: result.skill_id })
      setQuestions(res.data.questions)
      setAssessmentId(res.data.assessment_id)
      setSkillName(result.skill_name)
      setResult(null)
      navigate(`/app/assessments/${res.data.assessment_id}`, { replace: true })
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to start new attempt.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Processing evaluation..." />
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <ErrorAlert message={error} onClose={() => navigate('/app/assessments')} />
      </div>
    )
  }

  if (result) {
    return <ResultView result={result} skillName={skillName} onRetake={handleRetake} />
  }

  if (isResultRoute) {
    return <LoadingSpinner text="Loading result..." />
  }

  if (!questions.length || !assessmentId) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center card">
        <p className="font-mono text-xs text-neutral-600 mb-4">
          No assessment loaded. Please start one from the assessments page.
        </p>
        <button className="btn-primary" onClick={() => navigate('/app/assessments')}>
          Go to Assessments
        </button>
      </div>
    )
  }

  return (
    <QuizView
      questions={questions}
      skillName={skillName}
      assessmentId={assessmentId}
      onDone={setResult}
    />
  )
}
