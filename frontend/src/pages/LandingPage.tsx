import { Link } from 'react-router-dom'
import { Target, BarChart3, Map, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Target,
    tag: 'DIAGNOSTICS',
    title: 'Calibrated Skill Gap Analysis',
    description:
      'Compare your production competency directly against verified tech requirements. File and prioritize gaps objectively.',
  },
  {
    icon: BarChart3,
    tag: 'EVALUATION',
    title: 'Precision Skill Benchmarks',
    description:
      'Take 10-question standardized assessments for each skill and get evidence-backed proficiency rankings.',
  },
  {
    icon: Map,
    tag: 'EXECUTION',
    title: 'Evidence-Based Learning Roadmap',
    description:
      'Follow an algorithmically tailored step-by-step curriculum to close critical gaps and become job-ready.',
  },
]

const careers = [
  'Full-Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI Engineer',
  'Machine Learning Engineer',
  'DevOps Architect',
  'Cloud Platform Engineer',
  'Cybersecurity Specialist',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Navigation matching Screenshot 1 Navbar */}
      <nav className="bg-[#FAF8F5]/90 backdrop-blur-md border-b-2 border-black/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
              <span className="font-mono font-black text-xs">[S]</span>
            </div>
            <div className="flex items-baseline font-black tracking-tight text-neutral-900 text-lg uppercase">
              <span>SKILLBRIDGE</span>
              <span className="text-pink-500 font-mono text-base font-bold ml-1">.AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-xs py-2 px-4">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-xs py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section matching Screenshot 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-14">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="neo-section-tag">
              <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
              <span>ENGINEERING CAREER WORKSPACE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-none font-sans">
              Focus learning effort{' '}
              <span className="neo-highlight">where it matters.</span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed pt-2">
              Transparent skill risk, evidence-based competency benchmarking, and concrete testing
              recommendations to bridge the gap between academia and industry.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link to="/register" className="btn-primary px-6 py-3 text-sm">
                <span>START BENCHMARK FREE</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-sm">
                <span>VIEW LIVE DEMO</span>
              </Link>
            </div>
          </div>

          {/* Top-Right Callout Banner matching Screenshot 1 */}
          <div className="lg:w-80 bg-[#D1FAE5] border-2 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#18181B] flex flex-col gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 border border-black flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-900" />
            </div>
            <p className="text-sm font-mono font-bold text-neutral-900 tracking-wide uppercase leading-snug">
              Scores guide review. They do not replace hands-on code.
            </p>
            <p className="text-xs font-mono text-neutral-700 leading-relaxed mt-1">
              Calibrated automated assessments provide objective skill scores to direct your study hours with maximum precision.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Metric Cards matching Screenshot 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              20+
            </div>
            <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-wider">
              Engineering Disciplines
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-black flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-black" />
              </div>
              <span className="font-mono text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
                LIVE
              </span>
            </div>
            <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
              100%
            </div>
            <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-wider">
              Calibrated Questions
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-black flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span className="font-mono text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
                LIVE
              </span>
            </div>
            <div className="text-4xl font-black text-neutral-900 font-sans tracking-tight">
              96%
            </div>
            <p className="font-mono text-xs text-neutral-500 mt-1 uppercase tracking-wider">
              Accuracy in Gap Diagnostics
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="neo-section-tag mb-2">
          <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
          <span>METHODOLOGY</span>
        </div>
        <h2 className="text-3xl font-black text-neutral-900 tracking-tight font-sans mb-8">
          How the SkillBridge Platform Operates
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, tag, title, description }) => (
            <div key={title} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-neutral-100 border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
                    <Icon className="w-5 h-5 text-neutral-900" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {tag}
                  </span>
                </div>
                <h3 className="font-black text-neutral-900 text-lg mb-2 font-sans tracking-tight">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/10 flex items-center gap-1 font-mono text-xs font-bold text-neutral-900 uppercase">
                <span>LEARN MORE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Careers Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="card text-center py-10">
          <div className="neo-section-tag mb-2 justify-center">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>SUPPORTED CAREER TRACKS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-sans mb-4">
            Calibrated for Tech Industry Roles
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto mb-6">
            Real market skill breakdowns synced from industry requirements.
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center max-w-3xl mx-auto">
            {careers.map((c) => (
              <span key={c} className="badge-blue text-xs px-3.5 py-1.5 shadow-[2px_2px_0px_#18181B]">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA matching Screenshot black card with pink offset shadow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#18181B] border-2 border-black rounded-3xl p-8 sm:p-12 text-center text-white shadow-[6px_6px_0px_#EC4899]">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-sans mb-3">
            Ready to review and close your skill gaps?
          </h2>
          <p className="text-neutral-400 font-mono text-xs sm:text-sm max-w-xl mx-auto mb-8">
            Create your engineering profile and benchmark your skill readiness in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full border-2 border-white shadow-[3px_3px_0px_#EC4899] hover:bg-neutral-100 transition-all"
          >
            <span>CREATE FREE ACCOUNT</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-black/10 py-8 text-center font-mono text-xs text-neutral-500">
        &copy; 2026 SKILLBRIDGE.AI &bull; EVIDENCE-BASED ENGINEERING CAREER PREPARATION
      </footer>
    </div>
  )
}
