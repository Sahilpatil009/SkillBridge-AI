import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating brand icon matching screenshot bottom-left 'N' */}
      <div 
        className="fixed bottom-4 left-4 z-50 w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#000] border border-black/40 hover:scale-105 transition-transform cursor-pointer"
        title="SkillBridge AI Workspace"
      >
        N
      </div>
    </div>
  )
}
