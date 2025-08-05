"use client"

import { useState } from "react"
import { LayoutDashboard, GraduationCap, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface UserSidebarProps {
  user: {
    name: string;
    avatar?: string;
  } | null;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function UserSidebar({ user, activeNav = "dashboard", onNavChange }: UserSidebarProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter();

  return (
    <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-gradient-to-b from-white to-gray-50 flex flex-col shadow-xl transition-all duration-300`}>
      {/* User Profile Section - Enhanced */}
      <div className="p-6 bg-gradient-to-r from-[#0747A1] to-blue-600 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 z-20"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className={`w-4 h-4 text-white transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div
          className="flex items-center space-x-3 cursor-pointer group relative z-10"
          onClick={() => router.push('/profile')}
          title="Go to profile"
        >
          <div
            className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center group-hover:ring-4 group-hover:ring-white/30 transition-all duration-300 group-hover:scale-110 shadow-lg"
            style={{ backgroundColor: user?.avatar ? undefined : 'rgba(255,255,255,0.2)' }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="h-12 w-12 object-cover"
              />
            ) : (
              <span className="text-white text-xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1">
              <span className="text-white text-lg font-semibold group-hover:text-blue-100 transition-colors">
                {user?.name || "User"}
              </span>
              <p className="text-blue-100 text-sm opacity-90">Student</p>
            </div>
          )}
          {!sidebarCollapsed && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
        </div>
      </div>
      
      {/* Navigation Menu - Enhanced */}
      <nav className="flex-1 p-6">
        <div className="space-y-4">
          {/* Home Button */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} px-4 py-4 rounded-xl text-left transition-all duration-300 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 group`}
            title={sidebarCollapsed ? "Home" : ""}
          >
            <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9m0 0l9 9m-9-9v18" />
              </svg>
            </div>
            {!sidebarCollapsed && <span className="font-semibold">Home</span>}
          </button>
          
          {/* Dashboard Button */}
          <button
            onClick={() => onNavChange?.("dashboard")}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} px-4 py-4 rounded-xl text-left transition-all duration-300 group ${
              activeNav === "dashboard" 
                ? "bg-gradient-to-r from-[#0747A1] to-blue-600 text-white shadow-lg scale-105" 
                : "text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105"
            }`}
            title={sidebarCollapsed ? "Dashboard" : ""}
          >
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              activeNav === "dashboard" 
                ? "bg-white/20" 
                : "bg-gradient-to-br from-blue-400 to-blue-500 group-hover:scale-110"
            }`}>
              <LayoutDashboard className={`h-5 w-5 ${
                activeNav === "dashboard" ? "text-white" : "text-white"
              }`} />
            </div>
            {!sidebarCollapsed && <span className="font-semibold">Dashboard</span>}
          </button>
          
          {/* Courses Button */}
          <Link href="/courses">
            <button
              onClick={() => onNavChange?.("courses")}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} px-4 py-4 rounded-xl text-left transition-all duration-300 group ${
                activeNav === "courses" 
                  ? "bg-gradient-to-r from-[#0747A1] to-blue-600 text-white shadow-lg scale-105" 
                  : "text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105"
              }`}
              title={sidebarCollapsed ? "Courses" : ""}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                activeNav === "courses" 
                  ? "bg-white/20" 
                  : "bg-gradient-to-br from-green-400 to-green-500 group-hover:scale-110"
              }`}>
                <GraduationCap className={`h-5 w-5 ${
                  activeNav === "courses" ? "text-white" : "text-white"
                }`} />
              </div>
              {!sidebarCollapsed && <span className="font-semibold">Courses</span>}
            </button>
          </Link>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                window.location.href = "http://localhost:3000/";
              }
            }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-4'} px-4 py-4 rounded-xl text-left transition-all duration-300 text-gray-700 hover:bg-red-50 hover:shadow-lg hover:scale-105 group`}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <LogOut className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </nav>
    </div>
  )
} 