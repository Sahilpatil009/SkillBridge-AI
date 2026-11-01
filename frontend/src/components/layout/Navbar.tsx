import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Award, Sparkles, LogOut, Compass } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-[#FAF8F5]/90 backdrop-blur-md border-b-2 border-black/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/app/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#18181B] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
            <span className="font-mono font-black text-sm tracking-tighter">
              [S]
            </span>
          </div>
          <div className="flex items-baseline font-black tracking-tight text-neutral-900 text-lg uppercase">
            <span>SKILLBRIDGE</span>
            <span className="text-pink-500 font-mono text-base font-bold ml-1">.AI</span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-[2px_2px_0px_#EC4899]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/5'
              }`
            }
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/app/careers"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-[2px_2px_0px_#EC4899]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/5'
              }`
            }
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Careers</span>
          </NavLink>

          <NavLink
            to="/app/assessments"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-[2px_2px_0px_#EC4899]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/5'
              }`
            }
          >
            <Award className="w-3.5 h-3.5" />
            <span>Assessments</span>
          </NavLink>

          <NavLink
            to="/app/roadmap"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-[2px_2px_0px_#EC4899]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/5'
              }`
            }
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </NavLink>

          <NavLink
            to="/app/resume"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-black text-white shadow-[2px_2px_0px_#EC4899]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/5'
              }`
            }
          >
            <span className="font-mono text-xs">[AI]</span>
            <span>Resume</span>
          </NavLink>
        </nav>

        {/* Right side: Profile & Sign out */}
        <div className="flex items-center gap-3">
          <Link
            to="/app/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/30 hover:border-black font-mono text-xs font-medium text-neutral-800 transition-colors shadow-[1.5px_1.5px_0px_#18181B]"
          >
            <div className="w-5 h-5 rounded-full bg-pink-200 text-pink-900 border border-black/40 flex items-center justify-center font-bold text-[10px]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline font-bold">{user?.name?.split(' ')[0] || 'Profile'}</span>
          </Link>

          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-700 hover:text-black hover:bg-neutral-200/60 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
