import { useState, useEffect } from 'react'
import {
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Briefcase,
  Copy,
  Check,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'

interface Career {
  id: number
  title: string
}

interface ResumeAnalysis {
  overall_score: number
  grade: string
  badge: string
  word_count: number
  target_career: string
  target_career_id: number | null
  breakdown: {
    skills_match: number
    impact_metrics: number
    ats_structure: number
    depth_experience: number
  }
  detected_skills: string[]
  matched_skills: string[]
  missing_skills: { name: string; importance: string; target_proficiency: string }[]
  action_verbs_found: string[]
  sections_detected: Record<string, boolean>
  strengths: string[]
  actionable_tips: string[]
}

const SAMPLE_RESUME = `SANSKAR SHARMA
Full-Stack Software Engineer
Email: sanskar.sharma@example.com | GitHub: github.com/sanskar-cpu-sudo | LinkedIn: linkedin.com/in/sanskar-sharma

SUMMARY
Results-driven Full-Stack Engineer with experience architecting high-performance web applications and distributed backends. Proficient in Python, TypeScript, React, and FastAPI with a focus on scalable systems.

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, SQL, HTML, CSS
Frameworks & Libraries: React, FastAPI, Node.js, Tailwind CSS, SQLAlchemy
Tools & Infrastructure: Docker, Git, GitHub, REST APIs, SQLite, PostgreSQL, Vite

EXPERIENCE
Full-Stack Developer Intern | CloudTech Solutions
• Architected and deployed responsive dashboard microservices using React and FastAPI, reducing API latency by 35%.
• Integrated PostgreSQL database schemas and optimized complex ORM queries across 15+ data models.
• Automated CI/CD build pipelines using GitHub Actions and Docker, accelerating production deployment cycles by 40%.
• Engineered secure JWT authentication and role-based access control (RBAC) protecting over 10,000 active user sessions.

PROJECTS
BugRisk AI – Autonomous Code Analysis Platform
• Developed an automated Python vulnerability inspection tool analyzing 50,000+ lines of codebase per minute.
• Built interactive neo-brutalist user interfaces with React, Vite, and Tailwind CSS.
• Deployed Docker containers to cloud infrastructure ensuring 99.9% service uptime.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
XYZ University | CGPA: 8.8 / 10 | 2022 – 2026`

export default function ResumeScorePage() {
  const [careers, setCareers] = useState<Career[]>([])
  const [selectedCareerId, setSelectedCareerId] = useState<string>('')
  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<ResumeAnalysis | null>(null)
  const [error, setError] = useState('')
  const [copiedSample, setCopiedSample] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.get('/api/v1/careers'),
      api.get('/api/v1/careers/target'),
    ]).then(([careersRes, targetRes]) => {
      const careersList = careersRes.status === 'fulfilled' ? careersRes.value.data || [] : []
      setCareers(careersList)

      const targetId =
        targetRes.status === 'fulfilled' ? targetRes.value.data?.target?.career_id : null

      if (targetId) {
        setSelectedCareerId(String(targetId))
      } else if (careersList.length > 0) {
        setSelectedCareerId(String(careersList[0].id))
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 30) {
      setError('Please enter or paste your resume content (at least 30 characters).')
      return
    }
    setError('')
    setAnalyzing(true)
    try {
      const res = await api.post('/api/v1/resume/score', {
        resume_text: resumeText,
        career_id: selectedCareerId ? parseInt(selectedCareerId, 10) : null,
      })
      setResult(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to analyze resume. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleInsertSample = () => {
    setResumeText(SAMPLE_RESUME)
    setCopiedSample(true)
    setTimeout(() => setCopiedSample(false), 2000)
  }

  // Donut chart data matching theme
  const chartData = result
    ? [
        { name: 'Skills Match', value: result.breakdown.skills_match, color: '#F472B6' },
        { name: 'Impact & Metrics', value: result.breakdown.impact_metrics, color: '#FB923C' },
        { name: 'ATS Structure', value: result.breakdown.ats_structure, color: '#FBBF24' },
        { name: 'Depth & Exp', value: result.breakdown.depth_experience, color: '#34D399' },
      ]
    : []

  if (loading) return <LoadingSpinner text="Loading AI resume workspace..." />

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="neo-section-tag">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>AI CAREER INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-none font-sans">
            Calibrated <span className="neo-highlight">AI Resume Score</span>
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed pt-1">
            Evaluate your technical resume against live industry standards. Get an ATS compatibility
            benchmark, detect missing target keywords, and unlock actionable line-by-line optimization.
          </p>
        </div>

        {/* Top-Right Callout Box */}
        <div className="lg:w-72 bg-[#D1FAE5] border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#18181B] flex items-start gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-200 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-900" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-neutral-900 tracking-wide uppercase leading-snug">
              ATS-Optimized Review.
            </p>
            <p className="text-xs font-mono text-neutral-800 leading-snug mt-0.5">
              Tested against modern recruiting parsing engines.
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Input Section */}
      <div className="card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-neutral-900 font-sans tracking-tight">
            Target Role & Resume Content
          </h2>

          <button
            type="button"
            onClick={handleInsertSample}
            className="btn-secondary text-[10px] py-1.5 px-3 self-start sm:self-auto"
          >
            {copiedSample ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>LOADED SAMPLE</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>LOAD SAMPLE RESUME</span>
              </>
            )}
          </button>
        </div>

        {/* Career Selector */}
        <div className="flex items-center w-full px-4 py-2.5 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#18181B] ring-1 ring-pink-400">
          <Briefcase className="w-4 h-4 text-neutral-500 mr-2 flex-shrink-0" />
          <span className="font-mono text-xs text-neutral-400 font-bold uppercase mr-2 hidden sm:inline">
            BENCHMARK AGAINST:
          </span>
          <select
            aria-label="Target Career"
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            className="w-full bg-transparent font-mono text-xs sm:text-sm font-bold text-neutral-900 focus:outline-none cursor-pointer"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Resume Text Area */}
        <div className="relative">
          <textarea
            rows={10}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your plain text or Markdown resume content here (e.g. Summary, Technical Skills, Experience, Projects, Education)..."
            className="w-full p-4 bg-white border-2 border-black rounded-2xl font-mono text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-black shadow-[3px_3px_0px_#18181B] resize-y leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <p className="font-mono text-xs text-neutral-500">
            {resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words entered` : 'Ready to evaluate'}
          </p>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !resumeText.trim()}
            className="btn-primary text-xs py-3 px-6 self-end sm:self-auto"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>CALIBRATING WITH AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ANALYZE RESUME WITH AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section matching Screenshot 3 */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  ATS MATCH SCORE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {result.overall_score}%
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">
                {result.grade}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  MATCHED KEYWORDS
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              </div>
              <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {result.matched_skills.length}
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">
                Core Requirements
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  MISSING GAPS
                </span>
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              </div>
              <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {result.missing_skills.length}
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">
                Immediate Additions
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  ACTION VERBS
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              </div>
              <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
                {result.action_verbs_found.length}
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1 uppercase">
                High-Impact Terms
              </p>
            </div>
          </div>

          {/* Calibrated Risk & Donut Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Card: Calibrated Score */}
            <div className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-widest">
                    BENCHMARKED ATS SCORE
                  </span>
                  <div className="w-7 h-7 rounded-lg border border-black bg-neutral-50 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-neutral-800" />
                  </div>
                </div>

                <div className="flex items-baseline gap-3 my-3">
                  <span className="text-5xl font-black text-neutral-900 font-sans tracking-tight">
                    {result.overall_score}%
                  </span>
                  <span className={result.badge}>{result.grade}</span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Calibrated against <strong className="text-black">{result.target_career}</strong> standards.
                  Scores reflect recruiter keyword match, quantifiable business impact, and ATS header compliance.
                </p>
              </div>

              {/* Neo Pink Progress Bar */}
              <div className="mt-6">
                <div className="neo-progress-track">
                  <div
                    className="neo-progress-fill"
                    style={{ width: `${Math.min(100, Math.max(6, result.overall_score))}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-neutral-500 mt-1 uppercase font-bold">
                  <span>ATS Reject Threshold (&lt;60%)</span>
                  <span>Recruiter Interview Ready (&gt;85%)</span>
                </div>
              </div>
            </div>

            {/* Right Card: Score Breakdown Donut */}
            <div className="card">
              <span className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-widest block mb-1">
                EVALUATION DIMENSIONS
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

              {/* Breakdown Legend */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-black/10">
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {result.breakdown.skills_match}%
                  </div>
                  <div className="font-mono text-[9px] text-neutral-500 uppercase font-bold">
                    SKILLS
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {result.breakdown.impact_metrics}%
                  </div>
                  <div className="font-mono text-[9px] text-neutral-500 uppercase font-bold">
                    IMPACT
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {result.breakdown.ats_structure}%
                  </div>
                  <div className="font-mono text-[9px] text-neutral-500 uppercase font-bold">
                    STRUCTURE
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-neutral-900 font-sans">
                    {result.breakdown.depth_experience}%
                  </div>
                  <div className="font-mono text-[9px] text-neutral-500 uppercase font-bold">
                    DEPTH
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matched Keywords */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-base text-neutral-900 font-sans">
                  Matched Role Keywords ({result.matched_skills.length})
                </h3>
              </div>
              <p className="text-xs text-neutral-600 mb-4">
                These critical technical skills were successfully verified by the parser:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.length > 0 ? (
                  result.matched_skills.map((s) => (
                    <span key={s} className="badge-green text-xs">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-xs text-neutral-500">No direct skills matched yet.</span>
                )}
              </div>
            </div>

            {/* Missing Critical Keywords */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-pink-600" />
                <h3 className="font-black text-base text-neutral-900 font-sans">
                  Missing High-Priority Keywords ({result.missing_skills.length})
                </h3>
              </div>
              <p className="text-xs text-neutral-600 mb-4">
                Recruiters filter by these terms. Add verified projects demonstrating these:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.length > 0 ? (
                  result.missing_skills.map((m) => (
                    <span key={m.name} className="badge-red text-xs">
                      {m.name}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-xs text-emerald-700 font-bold">
                    All core target skills detected!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations & Strengths */}
          <div className="card space-y-5">
            <h3 className="font-black text-lg text-neutral-900 font-sans">
              Actionable Optimization Roadmap
            </h3>

            {/* Strengths */}
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
                PROVEN STRENGTHS
              </span>
              <ul className="space-y-2">
                {result.strengths.map((st, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="space-y-2 pt-3 border-t-2 border-black/10">
              <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-wider">
                HIGH-LEVERAGE EDITS
              </span>
              <ul className="space-y-2">
                {result.actionable_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-black text-white font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
