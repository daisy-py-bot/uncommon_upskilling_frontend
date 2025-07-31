"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, BookOpen, Award, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Lock, Play, PlayCircle, CheckCircle, Trophy, Medal } from 'lucide-react';
import { decodeJWT, buildApiUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';


const getLessonIcon = (type: string) => {
  switch (type) {
    case "video":
      return <PlayCircle className="h-4 w-4 text-blue-600" />;
    case "reading":
      return <BookOpen className="h-4 w-4 text-green-600" />;
    case "quiz":
      return <CheckCircle className="h-4 w-4 text-purple-600" />;
    case "exercise":
      return <Trophy className="h-4 w-4 text-orange-600" />;
    default:
      return <PlayCircle className="h-4 w-4 text-blue-600" />;
  }
};

export default function CourseContentPage() {
  const params = useParams();
  const courseId = typeof params.courseId === 'string' ? params.courseId : Array.isArray(params.courseId) ? params.courseId[0] : '';
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();
  const [showBadgesDropdown, setShowBadgesDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!courseId) return;
    async function fetchCourse() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(buildApiUrl(`courses/${courseId}/content`));
        if (!res.ok) throw new Error('Failed to fetch course content');
        const data = await res.json();
        setCourse(data);
        // Expand the first module by default if available
        if (data.modules_outline && data.modules_outline.length > 0) {
          setExpandedModules([data.modules_outline[0].id]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch course content');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  // Fetch user info from backend
  useEffect(() => {
    async function fetchUser() {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setUserLoading(false);
        return;
      }
      try {
        const res = await fetch(buildApiUrl('dashboard'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        // fallback to JWT decode if fetch fails
        const userInfo = decodeJWT(localStorage.getItem('token'));
        setUser(userInfo);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBadgesDropdown(false);
      }
    }
    if (showBadgesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBadgesDropdown]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]));
  };

  const handleEnroll = async () => {
    setEnrollMessage(null);
    setEnrolling(true);
    try {
      if (!user?.id) throw new Error('User not found. Please log in.');
      const res = await fetch(buildApiUrl('enrollments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, courseId: course.id }),
      });
      if (res.status === 409) {
        setEnrollMessage('You are already enrolled in this course.');
        return;
      }
      if (!res.ok) throw new Error('Failed to enroll in course');
      setEnrollMessage('Successfully enrolled! Redirecting...');
      setTimeout(() => {
        router.push(`/courses/${course.id}/enroll`);
      }, 1200);
    } catch (err: any) {
      setEnrollMessage(err.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-500">Loading course content...</div>;
  }
  if (error) {
    return <div className="max-w-4xl mx-auto px-6 py-8 text-center text-red-500">{error}</div>;
  }
  if (!course) {
    return <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-500">No course found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with cover image */}
      <div className="relative rounded-lg mb-6 overflow-hidden" style={{ height: '180px' }}>
        <img
          src={course.coverImage}
          alt={course.title}
          className="w-full h-full object-cover"
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-1 text-white">{course.title}</h1>
          <p className="text-lg opacity-90 text-white">{course.tagline}</p>
        </div>
      </div>
      <button
        onClick={() => router.push('/courses')}
        className="mb-4 flex items-center text-gray-500 hover:text-blue-600 bg-transparent border-none outline-none cursor-pointer"
        style={{ background: 'transparent', boxShadow: 'none' }}
        aria-label="Back to Courses"
      >
        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Courses</span>
      </button>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(course.objectives ?? []).map((outcome: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Course Outline - Collapsible */}
            <Card>
              <CardHeader>
                <CardTitle>Course Outline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.modules && course.modules.map((module: any, index: number) => (
                    <Collapsible
                      key={module.id}
                      open={expandedModules.includes(module.id)}
                      onOpenChange={() => toggleModule(module.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <div
                          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors bg-blue-50 border-blue-200 hover:bg-blue-100`}
                        >
                          <div className="flex items-center">
                            <Play className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Module {index + 1}: {module.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {module.lessons.length} lessons • {module.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {expandedModules.includes(module.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="px-4 pb-2">
                        <div className="ml-8 mt-2 space-y-2">
                          {module.lessons.map((lesson: any, lessonIndex: number) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center justify-between p-3 rounded-md border bg-white border-gray-200 hover:bg-gray-50`}
                            >
                              <div className="flex items-center">
                                {getLessonIcon(lesson.type)}
                                <div className="ml-3">
                                  <h5 className="text-sm font-medium text-gray-800">
                                    {lessonIndex + 1}. {lesson.title}
                                  </h5>
                                  <p className="text-xs text-gray-500">
                                    {lesson.duration} • {lesson.type}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Instructor & Rewards */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={course.instructor?.avatar} />
                    <AvatarFallback>{course.instructor?.name?.charAt(0) || 'I'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{course.instructor?.name || 'Instructor'}</div>
                    <div className="text-xs text-gray-500">{course.instructor?.bio || 'Course instructor'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(course.rewards?.badges) && course.rewards.badges.length > 0 && (
                  <div ref={dropdownRef} className="relative flex items-center">
                    <Award className="h-5 w-5 text-yellow-600 mr-3" />
                    <span className="text-gray-700 mr-2">{course.rewards?.badges?.length || 0} Badges</span>
                    <button
                      className="flex items-center text-blue-600 hover:underline"
                      onClick={() => setShowBadgesDropdown((open) => !open)}
                      type="button"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showBadgesDropdown && (
                      <div className="absolute left-0 mt-2 w-64 bg-white border rounded shadow-lg z-10">
                        <ul className="py-2">
                          {course.rewards?.badges?.map((badge: any) => (
                            <li key={badge.id} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100">
                              <img src={badge.iconUrl} alt={badge.name} className="h-6 w-6 rounded-full" />
                              <div>
                                <div className="font-medium">{badge.name}</div>
                                <div className="text-xs text-gray-500">{badge.description}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {course.rewards?.certificate && (
                  <div className="flex items-center">
                    <Medal className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">{course.rewards.certificate}</span>
                  </div>
                )}
                {course.rewards?.challenges > 0 && (
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">
                      {course.rewards.challenges} Challenge{course.rewards.challenges === 1 ? '' : 's'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Enroll Button at the very bottom of the page */}
        <div className="flex flex-col items-center mt-12 mb-4">
          {userLoading ? (
            <Button className="w-48 bg-green-600 text-white text-base py-2 rounded-md shadow-md opacity-60" disabled>
              Loading user...
            </Button>
          ) : (
          <Button
            className="w-48 bg-green-600 hover:bg-green-700 text-white text-base py-2 rounded-md shadow-md"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Enrolling...' : 'Enroll in this course'}
          </Button>
          )}
          {enrollMessage && (
            <div className={`mt-4 text-sm ${enrollMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>{enrollMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
} 