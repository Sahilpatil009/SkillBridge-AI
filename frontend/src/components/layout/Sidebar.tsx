import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  BarChart2,
  Map,
  FileText,
  Library,
  FolderKanban,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/careers', icon: Briefcase, label: 'Careers' },
  { to: '/app/skills', icon: BookOpen, label: 'Skills' },
  { to: '/app/assessments', icon: ClipboardCheck, label: 'Assessments' },
  { to: '/app/skill-gap', icon: BarChart2, label: 'Skill Gap' },
  { to: '/app/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/app/resume', icon: FileText, label: 'Resume AI' },
  { to: '/app/resources', icon: Library, label: 'Resources' },
  { to: '/app/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#FAF8F5]/60 border-r-2 border-black/10 flex-shrink-0 hidden md:flex flex-col p-4">
      <div className="px-3 py-2 mb-2">
        <div className="neo-section-tag">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Navigation</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-[3px_3px_0px_#EC4899] translate-x-1'
                  : 'text-neutral-600 hover:text-black hover:bg-black/5 hover:translate-x-0.5'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mini Workspace info footer */}
      <div className="mt-auto pt-4 border-t border-black/10 px-2">
        <div className="text-[11px] font-mono text-neutral-500 flex items-center justify-between">
          <span>AI ENGINE</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="text-xs font-bold text-neutral-800 mt-1 font-mono">
          SkillBridge v2.4
        </div>
      </div>
    </aside>
  )
}
