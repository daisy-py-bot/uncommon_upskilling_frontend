'use client'
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, GraduationCap, ClipboardList, MessageCircle, User, LogOut, Award } from "lucide-react"

const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };
  return (
    <aside className="w-64 bg-[#0747A1] text-white p-6 flex flex-col min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">uncommon</h1>
      </div>
      <nav className="flex-1 space-y-2">
        <div className="text-sm font-semibold text-gray-300 mb-2">Navigation</div>
        <Link href="/admin/dashboard" className={`flex items-center space-x-2 p-3 rounded-lg font-medium ${pathname === '/admin/dashboard' ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 text-white transition-colors'}` }>
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/users" className={`flex items-center space-x-2 p-3 rounded-lg font-medium ${pathname === '/admin/users' ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 text-white transition-colors'}` }>
          <Users className="h-5 w-5" />
          <span>User Management</span>
        </Link>
        <Link href="/admin/course-management" className={`flex items-center space-x-2 p-3 rounded-lg font-medium ${pathname === '/admin/course-management' ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 text-white transition-colors'}` }>
          <GraduationCap className="h-5 w-5" />
          <span>Course Management</span>
        </Link>
        <Link href="/admin/assessments" className={`flex items-center space-x-2 p-3 rounded-lg font-medium ${pathname === '/admin/assessments' ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 text-white transition-colors'}` }>
          <ClipboardList className="h-5 w-5" />
          <span>Assessments</span>
        </Link>
        <Link href="/admin/feedback" className={`flex items-center space-x-2 p-3 rounded-lg font-medium ${pathname === '/admin/feedback' ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 text-white transition-colors'}` }>
          <MessageCircle className="h-5 w-5" />
          <span>Manage Feedback</span>
        </Link>
        <Link href="/admin/badges" className={`flex items-center space-x-2 p-3 rounded-lg font-medium ${pathname === '/admin/badges' ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 text-white transition-colors'}` }>
          <Award className="h-5 w-5" />
          <span>Badges</span>
        </Link>
        <Link href="/admin/profile" className={`flex items-center space-x-2 p-3 rounded-lg font-medium ${pathname === '/admin/profile' ? 'bg-blue-700 text-white' : 'hover:bg-blue-600 text-white transition-colors'}` }>
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
        <div
          className="flex items-center space-x-2 p-3 rounded-lg w-full text-left bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors mt-2 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar 