import { useState, useEffect } from 'react'
import { Search, BookOpen, CheckCircle, Plus } from 'lucide-react'
import api from '../lib/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

interface SkillCategory {
  id: number
  name: string
}

interface Skill {
  id: number
  name: string
  slug: string
  description?: string
  category: SkillCategory
  is_active: boolean
}

interface StudentSkill {
  id: number
  skill_id: number
  skill: Skill
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [mySkillIds, setMySkillIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/v1/skills/categories').then((res) => setCategories(res.data)).catch(() => {})
    api.get('/api/v1/skills/mine')
      .then((res) => setMySkillIds(new Set((res.data as StudentSkill[]).map((s) => s.skill_id))))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string | number> = {}
    if (search) params.search = search
    if (categoryId) params.category_id = categoryId
    api.get('/api/v1/skills', { params })
      .then((res) => setSkills(res.data))
      .catch(() => setError('Failed to load skills.'))
      .finally(() => setLoading(false))
  }, [search, categoryId])

  const toggleSkill = async (skill: Skill) => {
    setTogglingId(skill.id)
    try {
      if (mySkillIds.has(skill.id)) {
        await api.delete(`/api/v1/skills/mine/${skill.id}`)
        setMySkillIds((prev) => {
          const s = new Set(prev)
          s.delete(skill.id)
          return s
        })
      } else {
        await api.post('/api/v1/skills/mine', { skill_id: skill.id })
        setMySkillIds((prev) => new Set([...prev, skill.id]))
      }
    } catch {
      setError('Failed to update skill. Please try again.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="neo-section-tag mb-1">
            <span className="w-2.5 h-2.5 rounded-full border border-black bg-emerald-400 inline-block"></span>
            <span>SKILL CATALOGUE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans">
            Inventory & Track <span className="neo-highlight">Competencies</span>
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Toggle technical skills in your active developer stack to refine gap diagnostics.
          </p>
        </div>

        <div className="bg-[#FAF8F5] border-2 border-black rounded-xl px-4 py-2 shadow-[2px_2px_0px_#18181B] font-mono text-xs font-bold uppercase">
          <span className="text-neutral-500">Active Stack:</span>{' '}
          <span className="text-black">{mySkillIds.size} SELECTED</span>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            className="input-field pl-9 text-xs"
            placeholder="Search competencies (e.g. Docker, TypeScript, PyTorch)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field sm:w-56 text-xs font-mono font-bold cursor-pointer"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Scanning skill inventory..." />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No competencies found"
          description="Try broadening your category filter or search query."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => {
            const selected = mySkillIds.has(skill.id)
            const toggling = togglingId === skill.id
            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill)}
                disabled={toggling}
                className={`text-left p-4 rounded-2xl border-2 border-black transition-all ${
                  selected
                    ? 'bg-[#D1FAE5] shadow-[3px_3px_0px_#18181B] -translate-y-0.5'
                    : 'bg-white shadow-[2px_2px_0px_#18181B] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#18181B]'
                } ${toggling ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-neutral-900 text-sm font-sans truncate">
                      {skill.name}
                    </p>
                    <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">
                      {skill.category.name}
                    </span>
                  </div>
                  {selected ? (
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0 hover:bg-neutral-100">
                      <Plus className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}
                </div>
                {skill.description && (
                  <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
