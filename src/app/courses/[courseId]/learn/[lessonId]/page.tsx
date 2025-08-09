"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CourseNavbar from "@/components/CourseNavbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  Volume2,
  Maximize,
  CheckCircle,
  Circle,
  FileText,
  BookOpen,
  Trophy,
  Clock,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Lock,
  GraduationCap,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { decodeJWT, buildApiUrl } from "@/lib/utils"
import { useParams } from "next/navigation";

const getLessonIcon = (type: string, completed: boolean, current: boolean, locked = false) => {
  if (locked) {
    return <Lock className="h-4 w-4 text-gray-300" />
  }
  if (completed) {
    return <CheckCircle className="h-4 w-4 text-blue-600" />
  }
  if (current) {
    return <Circle className="h-4 w-4 text-blue-600 fill-blue-600" />
  }

  switch (type) {
    case "video":
      return <PlayCircle className="h-4 w-4 text-gray-400" />
    case "reading":
      return <BookOpen className="h-4 w-4 text-gray-400" />
    case "quiz":
      return <Trophy className="h-4 w-4 text-gray-400" />
    default:
      return <Circle className="h-4 w-4 text-gray-400" />
  }
}

export default function CourseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("transcription")
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  // Add state for navigation modal
  const [pendingNav, setPendingNav] = useState<{ direction: 'next' | 'prev', item: any } | null>(null);
  const [showNavModal, setShowNavModal] = useState(false);

  async function fetchUserAndCourse() {
    setLoading(true)
    setError("")
    try {
      // Get user ID from JWT token
      if (typeof window === "undefined") return
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No token found. Please login.")
        setLoading(false)
        return
      }
      const userInfo = decodeJWT(token)
      const currentUserId = userInfo?.id
      if (!currentUserId) {
        setError("Could not get user ID from token.")
        setLoading(false)
        return
      }
      setUserId(currentUserId)
      // Fetch course content with user ID and current lesson ID
      const res = await fetch(
        buildApiUrl(`courses/${courseId}/content?userId=${currentUserId}&currentLessonId=${lessonId}`)
      )
      if (!res.ok) throw new Error("Failed to fetch course content")
      const data = await res.json()
      setCourse(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch course content")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserAndCourse();
  }, [courseId, lessonId]);

  // Track lesson access on page load
  useEffect(() => {
    if (!userId || !courseId || !lessonId) return;
    fetch(buildApiUrl('progress/track'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        courseId: courseId,
        lessonId: lessonId
      })
    });
  }, [userId, courseId, lessonId]);

  // Mark lesson as complete
  const [markingComplete, setMarkingComplete] = useState(false);
  // Always check the current lesson's completed status from the latest course data
  const completed = !!course?.modules
    ?.flatMap((module: any) => module.lessons)
    .find((lesson: any) => course?.currentLesson && lesson.id === course.currentLesson.id)?.completed;

  async function markLessonComplete() {
    setMarkingComplete(true);
    await fetch(buildApiUrl('progress'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        lessonId: lessonId,
        isCompleted: true
      })
    });
    // Refetch course content to update UI
    await fetchUserAndCourse();
    setMarkingComplete(false);
  }

  // Ensure the current module is always open in the collapsible sidebar
  useEffect(() => {
    if (!course) return;
    let currentModule, currentLesson;
    if (course.completed && course.modules && course.modules.length > 0) {
      currentModule = course.modules[0];
      currentLesson = currentModule.lessons && currentModule.lessons.length > 0 ? currentModule.lessons[0] : null;
    } else {
      currentModule = course.modules.find((module: any) =>
        module.lessons.some((lesson: any) => course.currentLesson && lesson.id === course.currentLesson.id)
    );
      currentLesson = course.currentLesson;
    }
    if (currentModule && !expandedModules.includes(currentModule.id)) {
      setExpandedModules((prev) => [...prev, currentModule.id]);
    }
  }, [course, course?.currentLesson?.id]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  // Find current lesson for navigation and helpers (always defined)
  let currentLessonIndex = -1;
  const allLessons: any[] = [];
  const modules = course?.modules || [];
  modules.forEach((module: any) => {
    module.lessons.forEach((lesson: any) => {
      allLessons.push(lesson);
      if (lesson.current) {
        currentLessonIndex = allLessons.length - 1;
      }
    });
  });
  const currentModule = modules.find((module: any) =>
    module.lessons.some((lesson: any) => lesson.id === course?.currentLesson?.id)
  );
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;
  const isYouTubeUrl = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Build a flat ordered array of all navigable items (lessons, quizzes, final assessment, certificate)
  const navigationItems: any[] = [];
  if (modules.length > 0) {
    modules.forEach((module: any) => {
      if (Array.isArray(module.lessons)) {
        module.lessons.forEach((lesson: any) => navigationItems.push({ ...lesson, type: 'lesson' }));
      }
      if (Array.isArray(module.quizzes)) {
        module.quizzes.forEach((quiz: any) => navigationItems.push({ ...quiz, type: 'quiz' }));
      }
    });
  }
  if (course?.finalAssessment) {
    navigationItems.push({ ...course.finalAssessment, type: 'finalAssessment' });
  }
  if (course?.hasCertificate) {
    navigationItems.push({ id: 'certificate', type: 'certificate' });
  }

  // Find the current item index in the navigation array
  let currentNavIndex = navigationItems.findIndex(item => {
    if (item.type === 'lesson' && course?.currentLesson && item.id === course.currentLesson.id) return true;
    if (item.type === 'quiz' && course?.currentLesson && item.id === course.currentLesson.id) return true;
    if (item.type === 'finalAssessment' && course?.currentLesson && item.id === course.currentLesson.id) return true;
    if (item.type === 'certificate' && lessonId === 'certificate') return true;
    return false;
  });
  const previousNavItem = currentNavIndex > 0 ? navigationItems[currentNavIndex - 1] : null;
  const nextNavItem = currentNavIndex < navigationItems.length - 1 ? navigationItems[currentNavIndex + 1] : null;

  // Helper to get the correct href for each item
  const getNavHref = (item: any) => {
    if (item.type === 'lesson') return `/courses/${courseId}/learn/${item.id}`;
    if (item.type === 'quiz') return `/courses/${courseId}/learn/quiz/${item.id}`;
    if (item.type === 'finalAssessment') return `/courses/${courseId}/learn/final-assessment`;
    if (item.type === 'certificate') return `/courses/${courseId}/certificate`;
    return '#';
  };

  // Helper to get the label for each item
  const getNavLabel = (item: any) => {
    if (item.type === 'quiz') return 'Quiz';
    if (item.type === 'finalAssessment') return 'Final Assessment';
    if (item.type === 'certificate') return 'Certificate';
    return '';
  };

  // Always render sidebar and main layout; only lesson content is dynamic
  return (
    <>
      <CourseNavbar />
      <div className="min-h-screen bg-white flex pt-[64px]">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-white border-r border-gray-100`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 min-w-[120px] flex items-center justify-center">
                <Menu className="h-4 w-4 mr-2" />
                Hide menu
              </Button>
            </div>

            {/* Course Modules */}
            <div className="space-y-2">
              {course?.modules.map((module: any, moduleIndex: number) => (
                <div key={module.id}>
                  {/* Module Header */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      module.locked
                        ? "bg-gray-50 border border-gray-100"
                        : "bg-gray-100 border border-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => !module.locked && toggleModule(module.id)}
                  >
                    <div className="flex items-center">
                      {module.locked ? (
                        <Lock className="h-4 w-4 text-gray-400 mr-3" />
                      ) : (
                        <Play className="h-4 w-4 text-gray-600 mr-3" />
                      )}
                      <div>
                        <h4 className={`font-medium text-sm ${module.locked ? "text-gray-400" : "text-gray-800"}`}>
                          Module {moduleIndex + 1}: {module.title}
                        </h4>
                        <p className={`text-xs ${module.locked ? "text-gray-300" : "text-gray-500"}`}>
                          {module.lessons.length} lessons • {module.duration}
                        </p>
                      </div>
                    </div>
                    {!module.locked && (
                      <div className="flex items-center">
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Module Lessons */}
                  {expandedModules.includes(module.id) && !module.locked && (
                    <div className="ml-4 mt-2 space-y-1">
                      {module.lessons.map((lesson: any, lessonIndex: number) => (
                        <Link
                          key={lesson.id}
                          href={`/courses/${courseId}/learn/${lesson.id}`}
                          className={`flex items-center p-2 rounded-md transition-colors ${
                            lesson.current ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="mr-3">
                            {getLessonIcon(lesson.type, !!lesson.completed, !!lesson.current, module.locked)}
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium text-xs ${lesson.current ? "text-blue-900" : "text-gray-800"}`}>
                              {lessonIndex + 1}. {lesson.title}
                            </h5>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {lesson.duration}
                            </p>
                          </div>
                        </Link>
                      ))}
                      {/* Module Quizzes */}
                      {Array.isArray(module.quizzes) && module.quizzes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {module.quizzes.map((quiz: any, quizIndex: number) => (
                            <Link
                              key={quiz.id}
                              href={`/courses/${courseId}/learn/quiz/${quiz.id}${quiz.completed ? '/review' : ''}`}
                              className={`flex items-center p-2 rounded-md transition-colors hover:bg-yellow-50 border border-yellow-100 ${quiz.completed ? 'bg-green-50 border-green-200' : ''}`}
                            >
                              <div className="mr-3 flex items-center">
                                {quiz.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className={`font-medium text-xs ${quiz.completed ? 'text-green-900' : 'text-yellow-900'}`}>Quiz: {quiz.title}</h5>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {/* Final Assessment */}
              {course?.finalAssessment && (
                <div className="mt-6">
                  <Link
                    href={`/courses/${courseId}/learn/final-assessment${course.finalAssessmentCompleted ? '/review' : ''}`}
                    className={`flex items-center p-3 rounded-lg transition-colors mt-2 border ${course.finalAssessmentCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-100 hover:bg-gray-200'}`}
                  >
                    {course.finalAssessmentCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-gray-600 mr-3" />
                    )}
                    <span className={`font-medium text-sm ${course.finalAssessmentCompleted ? 'text-green-900' : 'text-gray-800'}`}>Final Assessment: {course.finalAssessment.title}</span>
                  </Link>
                </div>
              )}
              {/* Feedback */}
              <div className="mt-2">
                <Link
                  href={`/courses/${courseId}/feedback`}
                  className="flex items-center p-3 rounded-lg transition-colors mt-2 border bg-gray-100 border-gray-100 hover:bg-gray-200"
                >
                  <MessageCircle className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="font-medium text-sm text-gray-800">Feedback</span>
                </Link>
              </div>
              {/* Certificate Link */}
              {course?.hasCertificate && (
                <div className="mt-2">
                  <Link
                    href={`/courses/${courseId}/certificate`}
                    className="flex items-center p-3 rounded-lg transition-colors border bg-gray-100 border-gray-100 hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="font-medium text-sm text-gray-800">Certificate</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {/* Course Navigation */}
          <div className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/dashboard" className="hover:text-blue-600">
                  {course?.title || 'Course'}
                </Link>
                <ChevronRight className="h-4 w-4" />
                {currentModule && (
                  <>
                    <span className="text-gray-900 font-medium">{currentModule.title}</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
                <span className="text-gray-900 font-medium">{course?.currentLesson?.title || 'Lesson'}</span>
                {completed && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>
            </div>
          </div>

          {/* Video and Content */}
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto px-2">
              {/* Video Player */}
              <Card className="mb-6 border-0">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    {loading || error || !course || !course.currentLesson ? (
                      <div className="flex items-center justify-center w-full h-full text-gray-400 text-lg">{error ? error : 'Loading...'}</div>
                    ) : course.currentLesson.videoUrl && course.currentLesson.videoUrl.endsWith('.pdf') ? (
                      <iframe
                        src={course.currentLesson.videoUrl}
                        title={course.currentLesson.title}
                        className="w-full h-full"
                        style={{ minHeight: 400 }}
                      />
                    ) : course.currentLesson.videoUrl && isYouTubeUrl(course.currentLesson.videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(course.currentLesson.videoUrl)}
                        title={course.currentLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : course.currentLesson.videoUrl ? (
                      <video
                        src={course.currentLesson.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster={course.currentLesson.videoUrl}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400 text-lg">No video available.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex w-full justify-start">
                  <TabsTrigger value="transcription">Transcription</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
                <div className="border-b border-gray-100 w-full mb-4" />
                <TabsContent value="transcription" className="mt-6">
                  {loading || error || !course ? (
                    <div className="py-8 text-center text-gray-400">{error ? error : 'Loading...'}</div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 max-h-[400px] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <h3 className="font-medium text-left">Language</h3>
                            <Select defaultValue="english">
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                                <SelectItem value="french">French</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {course.currentLesson && Array.isArray(course.currentLesson.transcript) ? (
                            course.currentLesson.transcript.map((item: any, index: number) => (
                            <div key={index} className="flex space-x-4">
                              <span className="text-sm font-mono text-blue-600 min-w-[3rem]">{item.timestamp}</span>
                              <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                            </div>
                            ))
                          ) : (
                            <div className="text-gray-400">No transcript available.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="notes" className="mt-6">
                  {loading || error || !course ? (
                    <div className="py-8 text-center text-gray-400">{error ? error : 'Loading...'}</div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 max-h-[400px] overflow-y-auto">
                        <div className="space-y-6">
                          {course.currentLesson && Array.isArray(course.currentLesson.notes) ? (
                            course.currentLesson.notes.map((note: any, index: number) => (
                            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                              <h4 className="font-semibold text-gray-900 mb-2 text-left">{note.title}</h4>
                              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                {note.content}
                              </div>
                            </div>
                            ))
                          ) : (
                            <div className="text-gray-400">No notes available.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="resources" className="mt-6">
                  {loading || error || !course ? (
                    <div className="py-8 text-center text-gray-400">{error ? error : 'Loading...'}</div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 max-h-[400px] overflow-y-auto">
                        <div className="space-y-4">
                          {course.currentLesson && Array.isArray(course.currentLesson.resources) ? (
                            course.currentLesson.resources.map((resource: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-shrink-0">
                                {resource.type === "video" && <Play className="h-5 w-5 text-red-600" />}
                                {resource.type === "article" && <FileText className="h-5 w-5 text-blue-600" />}
                                {resource.type === "pdf" && <FileText className="h-5 w-5 text-green-600" />}
                                {resource.type === "website" && <BookOpen className="h-5 w-5 text-purple-600" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1 text-left">{resource.name || resource.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Open Resource →
                                </a>
                              </div>
                            </div>
                            ))
                          ) : (
                            <div className="text-gray-400">No resources available.</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
              {/* Mark as Complete Button or Completed Badge */}
              {!loading && !error && course && (
                <div className="flex justify-between items-center mt-4">
                  <div>
                    {completed ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Completed
                      </div>
                    ) : (
                      <Button onClick={markLessonComplete} disabled={markingComplete}>
                        {markingComplete ? 'Marking...' : 'Mark as Complete'}
                      </Button>
                    )}
                  </div>
                  
                  {/* Navigation buttons on the right */}
                  <div className="flex space-x-2">
                    {previousLesson && (
                      <Link href={`/courses/${courseId}/learn/${previousLesson.id}`}>
                        <Button variant="outline" className="min-w-[120px] flex items-center justify-center">
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          <span className="inline-block align-middle">Previous</span>
                        </Button>
                      </Link>
                    )}
                    {nextLesson && (
                      <Link href={`/courses/${courseId}/learn/${nextLesson.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 min-w-[120px] flex items-center justify-center">
                          <span className="inline-block align-middle">Next</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Module Quiz CTA - Show at the end of the last lesson in a module */}
          {currentModule && currentModule.lessons && course?.currentLesson &&
            currentModule.lessons[currentModule.lessons.length - 1].id === course.currentLesson.id &&
            Array.isArray(currentModule.quizzes) && currentModule.quizzes.length > 0 && (
              <div className="mt-12 flex flex-col items-center">
                <div className="text-xl font-semibold text-blue-800 mb-2">🎉 You've completed all lessons in this module!</div>
                <div className="text-gray-700 mb-6">Test your knowledge and reinforce your learning with the module quiz.</div>
                <Link href={`/courses/${courseId}/learn/quiz/${currentModule.quizzes[0].id}`}>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-8 py-4 text-lg shadow-md rounded-xl">
                    Ready for the Module Quiz? Take it now!
                  </Button>
                </Link>
              </div>
            )
          }
        </div>

        {/* Sidebar Toggle Button (when closed) */}
        {!sidebarOpen && (
          <Button variant="outline" onClick={() => setSidebarOpen(true)} className="fixed top-[64px] left-4 z-40 min-w-[120px] flex items-center justify-center">
            <Menu className="h-4 w-4 mr-2" />
            Show menu
          </Button>
        )}
      </div>
      {/* Modal or notification for navigation */}
      {showNavModal && pendingNav && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] flex flex-col items-center">
            <div className="mb-4 text-lg font-semibold">
              {pendingNav.direction === 'next' ? 'Proceed to' : 'Go back to'} {getNavLabel(pendingNav.item)}?
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => { setShowNavModal(false); setPendingNav(null); }}
              >
                Cancel
              </Button>
              <Link href={getNavHref(pendingNav.item)}>
                <Button
                  className={pendingNav.item.type === 'certificate' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  onClick={() => { setShowNavModal(false); setPendingNav(null); }}
                >
                  Continue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
