"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Award, LayoutDashboard, GraduationCap, User, LogOut, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { buildApiUrl } from "@/lib/utils"

interface DashboardUser {
  name: string;
  tagline: string;
  avatar: string;
}
interface DashboardStats {
  totalCourses: number;
  totalHours: number;
  badges: number;
  certificates: number;
}
interface DashboardCourse {
  id: string;
  title: string;
  category?: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  isPublished?: boolean;
  tags?: string[];
  level?: string;
  createdAt?: string;
  progress?: number;
  certificate?: boolean;
}
interface DashboardBadge {
  id?: string;
  name?: string;
  icon?: string;
  earnedDate?: string;
  description?: string;
}
interface DashboardData {
  user: DashboardUser;
  stats: DashboardStats;
  completedCourses: DashboardCourse[];
  badges: DashboardBadge[];
  recommendedCourses: DashboardCourse[];
  ongoingCourses: DashboardCourse[];
}

export default function StudentDashboard() {
  const [userData, setUserData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setError("No token found. Please login.")
      setLoading(false)
      return
    }
    fetch(buildApiUrl("dashboard"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user data")
        }
        const data = await res.json()
        setUserData(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const DEFAULT_COURSE_IMAGE = "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80";
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=128&h=128&q=80";

  // Helper for fallback image
  function handleImgError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
    e.currentTarget.src = DEFAULT_COURSE_IMAGE;
  }

  function getNextLessonId(course: any) {
    if (!course?.modules) return '';
    const allLessons = course.modules.flatMap((module: any) => module.lessons);
    const lastCompletedIdx = allLessons.map((l: any) => !!l.completed).lastIndexOf(true);
    const nextLesson = allLessons[lastCompletedIdx + 1] || allLessons[0];
    return nextLesson?.id;
  }

  // Destructure API data
  const user = userData?.user;
  const stats = userData?.stats;
  const badges = userData?.badges || [];

  const completedCourses = useMemo(() => userData?.completedCourses || [], [userData]);
  const recommendedCourses = useMemo(() => userData?.recommendedCourses || [], [userData]);
  const ongoingCourses = useMemo(() => userData?.ongoingCourses || [], [userData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOngoing, setFilteredOngoing] = useState<any[]>([]);
  const [filteredCompleted, setFilteredCompleted] = useState<any[]>([]);
  const [filteredRecommended, setFilteredRecommended] = useState<any[]>([]);

  useEffect(() => {
    setFilteredOngoing(ongoingCourses);
    setFilteredCompleted(completedCourses);
    setFilteredRecommended(recommendedCourses);
  }, [ongoingCourses, completedCourses, recommendedCourses]);

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const term = searchTerm.trim().toLowerCase();
      if (!term) {
        setFilteredOngoing(ongoingCourses);
        setFilteredCompleted(completedCourses);
        setFilteredRecommended(recommendedCourses);
        return;
      }
      setFilteredOngoing(ongoingCourses.filter((item: any) =>
        item.course.title.toLowerCase().includes(term) ||
        (item.course.description?.toLowerCase().includes(term))
      ));
      setFilteredCompleted(completedCourses.filter((item: any) =>
        item.course.title.toLowerCase().includes(term) ||
        (item.course.description?.toLowerCase().includes(term))
      ));
      setFilteredRecommended(recommendedCourses.filter((item: any) =>
        item.title.toLowerCase().includes(term) ||
        (item.description?.toLowerCase().includes(term))
      ));
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-50 flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 bg-gray-100">
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => router.push('/profile')}
            title="Go to profile"
          >
            <div
              className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-500 transition"
              style={{ backgroundColor: user?.avatar ? undefined : '#0747A1' }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="h-10 w-10 object-cover"
                />
              ) : (
                <span className="text-white text-lg font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <span className="text-sm font-medium group-hover:text-blue-700">
              {user?.name || "User"}
            </span>
          </div>
        </div>
        {/* Navigation Menu (unchanged) */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9m0 0l9 9m-9-9v18" />
              </svg>
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveNav("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeNav === "dashboard" ? "bg-white text-gray-900 shadow-sm" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <Link href="/courses">
              <button
                onClick={() => setActiveNav("courses")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeNav === "courses" ? "bg-white text-gray-900 shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <GraduationCap className="h-5 w-5" />
                <span className="font-medium">Courses</span>
              </button>
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("token");
                  window.location.href = "http://localhost:3000/";
                }
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Hello, <span className="font-bold">{user?.name}</span>, welcome back!
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search"
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
            <div className="text-gray-600">
              {currentDate}
            </div>
          </div>
          {/* Ongoing Courses Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <div className="flex space-x-4">
                <button className="text-gray-600 hover:text-gray-900">View All</button>
              </div>
            </div>
            {filteredOngoing.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="mb-4">You have not enrolled in any courses yet.</p>
                <Link href="/courses">
                  <Button className="bg-[#0747A1] hover:bg-[#05316e]">Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOngoing.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden shadow-md">
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={item.course.thumbnailUrl || DEFAULT_COURSE_IMAGE}
                        onError={handleImgError}
                        alt={item.course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.course.title}</h3>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{item.course.level}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{item.course.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <span>
                          {Math.round((item.course.duration ?? 0) / 60) > 0
                            ? `${Math.floor((item.course.duration ?? 0) / 60)}h `
                            : ''}
                          {(item.course.duration ?? 0) % 60}m
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((item.progress ?? 0) * 100)}%</span>
                        </div>
                        <Progress value={Math.round((item.progress ?? 0) * 100)} className="h-2" />
                      </div>
                      <Button
                        className="w-full bg-[#0747A1] hover:bg-[#05316e]"
                        onClick={() => {
                          if (item.resumeLessonId) {
                            router.push(`/courses/${item.course.id}/learn/${item.resumeLessonId}`);
                          }
                        }}
                      >
                        Resume
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {/* Completed Courses Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Completed Courses</h2>
              <button className="text-gray-600 hover:text-gray-900">View All</button>
            </div>
            {filteredCompleted.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="mb-4">You have not completed any courses yet.</p>
                <Link href="/courses">
                  <Button className="bg-[#0747A1] hover:bg-[#05316e]">Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompleted.map((course: any) => {
                  // Get first lessonId if available
                  let firstLessonId = '1';
                  if (course.course?.modules && course.course.modules.length > 0) {
                    const firstModule = course.course.modules[0];
                    if (firstModule.lessons && firstModule.lessons.length > 0) {
                      firstLessonId = firstModule.lessons[0].id;
                    }
                  }
                  return (
                    <Card key={course.id} className="overflow-hidden shadow-md">
                      <div className="aspect-video bg-gray-200">
                      <img
                          src={course.course?.thumbnailUrl || DEFAULT_COURSE_IMAGE}
                        onError={handleImgError}
                          alt={course.course?.title}
                        className="w-full h-full object-cover"
                      />
                      </div>
                      <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{course.course?.title}</h3>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{course.course?.level}</span>
                      </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{course.course?.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <span>
                            {Math.round((course.course?.duration ?? 0) / 60) > 0
                              ? `${Math.floor((course.course?.duration ?? 0) / 60)}h `
                            : ''}
                            {(course.course?.duration ?? 0) % 60}m
                        </span>
                      </div>
                      <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Completed</span>
                            <span>100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                        <div className="flex flex-col gap-2">
                          <Link href={`/courses/${course.course?.id}/learn/${firstLessonId}`}>
                          <Button variant="outline" className="w-full bg-transparent">
                            Review
                          </Button>
                        </Link>
                          <Link href={`/courses/${course.course?.id}/certificate`}>
                            <Button className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center">
                            <Award className="h-4 w-4 mr-1" />
                            Certificate
                          </Button>
                          </Link>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>
          {/* Recommended Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
            </div>
            {filteredRecommended.length === 0 ? (
              <div className="text-center text-gray-500 py-12">There are currently no recommendations.</div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecommended.map((course: DashboardCourse) => (
                <Card key={course.id} className="overflow-hidden shadow-md">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={course.thumbnailUrl && course.thumbnailUrl !== '' ? course.thumbnailUrl : DEFAULT_COURSE_IMAGE}
                      onError={handleImgError}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{course.level}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <span>
                        {Math.round((course.duration ?? 0) / 60) > 0
                          ? `${Math.floor((course.duration ?? 0) / 60)}h `
                          : ''}
                        {(course.duration ?? 0) % 60}m
                      </span>
                    </div>
                    <Link href={`/courses/${course.id}/enroll`}>
                      <Button className="w-full bg-[#0747A1] hover:bg-[#05316e]">Enroll</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        </div>
        {/* Right Sidebar - Stats */}
        <div className="w-80 p-8 space-y-6">
          <Link href="/courses">
            <Button className="w-full mb-4 bg-[#0747A1] hover:bg-[#05316e]">Explore Courses &gt;</Button>
          </Link>
          {/* Total Courses */}
          <Card className="text-center p-6 shadow-md">
            <CardContent className="p-0">
              <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.totalCourses}</div>
              <div className="text-lg font-semibold text-gray-700">Total Courses</div>
            </CardContent>
          </Card>
          {/* Total Hours */}
          <Card className="text-center p-6 bg-gray-400 shadow-md">
            <CardContent className="p-0">
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.totalHours}</div>
              <div className="text-lg font-semibold text-gray-700">Total Hours</div>
            </CardContent>
          </Card>
          {/* Badges Earned */}
          <Card className="p-6 shadow-md">
            <CardContent className="p-0">
              <div className="text-center mb-4">
                <div className="flex justify-center items-center mb-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.badges}</div>
                <div className="text-lg font-semibold text-gray-700">Badges Earned</div>
              </div>
              {/* Recent Badges */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Recent Badges</h4>
                {badges.slice(0, 3).map((badge: DashboardBadge, idx: number) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm">
                      {/* You can use badge.icon if available */}
                      🏅
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{badge.name || "Badge"}</p>
                      <p className="text-xs text-gray-500">{badge.earnedDate || ""}</p>
                    </div>
                  </div>
                ))}
                <button className="w-full text-xs text-purple-600 hover:text-purple-800 font-medium mt-2">
                  View All Badges
                </button>
              </div>
            </CardContent>
          </Card>
          {/* Certificates */}
          <Card className="text-center p-6 shadow-md">
            <CardContent className="p-0">
              <div className="relative mx-auto mb-4 w-12 h-12">
                <Award className="h-12 w-12 text-yellow-500" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.certificates}</div>
              <div className="text-lg font-semibold text-gray-700">Certificates</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
