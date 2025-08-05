"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { decodeJWT } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/utils";
import UserSidebar from "@/components/UserSidebar";

export default function CourseCatalogPage() {
  const [user, setUser] = useState<{ id?: string; name?: string; avatar?: string; tagline?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [visibleCourses, setVisibleCourses] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("courses");
  const CATEGORIES_TO_SHOW = 6;

  useEffect(() => {
    async function fetchUser() {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(buildApiUrl(`dashboard`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        // fallback to JWT decode if fetch fails
        const userInfo = decodeJWT(token);
        setUser(userInfo);
        setError("Could not fetch full user profile, using token info only.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Fetch all courses initially
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError("");
        let userId = user?.id;
        if (!userId) {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          const userInfo = decodeJWT(token);
          userId = userInfo?.id;
        }
        const res = await fetch(buildApiUrl(`courses/catalog/available?userId=${userId}`));
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [user]);

  // Fetch courses by category
  useEffect(() => {
    if (selectedCategory === 'All') return;
    async function fetchCoursesByCategory() {
      setIsCategoryLoading(true);
      setError("");
      try {
        let url = '';
        let userId = user?.id;
        if (!userId) {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          const userInfo = decodeJWT(token);
          userId = userInfo?.id;
        }
        if (selectedCategory === 'Most Popular') {
          url = buildApiUrl(`courses/search/most-popular?userId=${userId}`);
        } else {
          url = buildApiUrl(`courses/search/by-category?category=${encodeURIComponent(selectedCategory)}&userId=${userId}`);
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (err: any) {
        setCourses([]);
        setError(err.message || "Failed to fetch courses");
      } finally {
        setIsCategoryLoading(false);
      }
    }
    fetchCoursesByCategory();
  }, [selectedCategory, user]);

  // Reset visible courses when category changes
  useEffect(() => {
    setVisibleCourses(6);
  }, [selectedCategory, courses]);

  // Handle category click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      // Refetch all courses
      (async () => {
        setIsCategoryLoading(true);
        setError("");
        try {
          let userId = user?.id;
          if (!userId) {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const userInfo = decodeJWT(token);
            userId = userInfo?.id;
          }
          const res = await fetch(buildApiUrl(`courses/catalog/available?userId=${userId}`));
          if (!res.ok) throw new Error("Failed to fetch courses");
          const data = await res.json();
          setCourses(data);
        } catch (err: any) {
          setCourses([]);
          setError(err.message || "Failed to fetch courses");
        } finally {
          setIsCategoryLoading(false);
        }
      })();
    }
  };

  // Handle search
  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      // If search is cleared, show all courses for the current category
      handleCategoryClick(selectedCategory);
      return;
    }
    setIsSearchLoading(true);
    setError("");
    try {
      let userId = user?.id;
      if (!userId) {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const userInfo = decodeJWT(token);
        userId = userInfo?.id;
      }
      const res = await fetch(buildApiUrl(`courses/search?q=${encodeURIComponent(searchQuery)}&userId=${userId}`));
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
      setVisibleCourses(6);
    } catch (err: any) {
      setCourses([]);
      setError(err.message || "Failed to fetch courses");
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Add a handler for badge search (if you have a badge filter UI)
  const handleBadgeSearch = async (badgeName: string) => {
    setIsSearchLoading(true);
    setError("");
    try {
      let userId = user?.id;
      if (!userId) {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const userInfo = decodeJWT(token);
        userId = userInfo?.id;
      }
      const res = await fetch(buildApiUrl(`courses/search/by-badge?badgeName=${encodeURIComponent(badgeName)}&userId=${userId}`));
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
      setVisibleCourses(6);
    } catch (err: any) {
      setCourses([]);
      setError(err.message || "Failed to fetch courses");
    } finally {
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(buildApiUrl("courses/categories"));
        if (!res.ok) throw new Error("Failed to fetch categories");
        let data = await res.json();
        // Remove duplicates and reserved categories
        data = data.filter((cat: string) => cat.toLowerCase() !== 'all' && cat.toLowerCase() !== 'most popular');
        setCategories(["All", "Most Popular", ...data]);
      } catch (err) {
        setCategories(["All", "Most Popular"]);
      }
    }
    fetchCategories();
  }, []);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar - Reusable Component */}
      <UserSidebar 
        user={user || null}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex justify-center">
        <div className="flex-1 p-8 pr-16 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 flex items-center text-gray-500 hover:text-blue-600 bg-transparent border-none outline-none cursor-pointer"
          style={{ background: 'transparent', boxShadow: 'none' }}
          aria-label="Back to Dashboard"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
        {/* Courses Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Courses</h1>

          {/* Search Bar */}
          <form className="mb-6 flex" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none"
              disabled={isSearchLoading}
            >
              Search
            </button>
          </form>

          {/* Filter Section */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">Filter by category</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.slice(0, showAllCategories ? categories.length : CATEGORIES_TO_SHOW).map((category, index) => (
                <Badge
                  key={index}
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className={`px-3 py-1 rounded-full cursor-pointer text-sm ${selectedCategory === category ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Badge>
              ))}
              {categories.length > CATEGORIES_TO_SHOW && !showAllCategories && (
                <span
                  className="px-3 py-1 rounded-full cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 border-none outline-none flex items-center text-sm"
                  style={{ display: 'inline-flex', height: '28px' }}
                  onClick={() => setShowAllCategories(true)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setShowAllCategories(true); }}
                >
                  View more categories
                </span>
              )}
              {categories.length > CATEGORIES_TO_SHOW && showAllCategories && (
                <span
                  className="px-3 py-1 rounded-full cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 border-none outline-none flex items-center text-sm"
                  style={{ display: 'inline-flex', height: '28px' }}
                  onClick={() => setShowAllCategories(false)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setShowAllCategories(false); }}
                >
                  View less categories
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Most Popular Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</h2>
            <span className="text-sm text-gray-500">({courses.length} result{courses.length === 1 ? '' : 's'})</span>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {(loading || isCategoryLoading || isSearchLoading) ? (
              <div className="col-span-full text-center py-12 text-gray-500">Loading courses...</div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-red-500">{error}</div>
            ) : courses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No courses found.</div>
            ) : (
              courses.slice(0, visibleCourses).map((course) => (
                <Card
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
                  onClick={() => router.push(`/courses/${course.id}/content`)}
                >
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{course.title}</CardTitle>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{course.totalLessons} Lessons</span>
                        <span>{Math.round(course.duration / 60) > 0 ? `${Math.floor(course.duration / 60)}h ` : ''}{course.duration % 60}m</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">{course.description}</p>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 mt-auto">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/courses/${course.id}/content`);
                        }}
                        className="w-full rounded-md border-gray-300 text-white bg-[#0747A1] hover:bg-[#053674] px-4 py-2"
                      >
                        Enroll
                      </button>
                    </CardFooter>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Show More Button */}
          {visibleCourses < courses.length && (
            <div className="text-left">
              <Button
                variant="outline"
                className="rounded-md bg-transparent"
                onClick={() => setVisibleCourses(v => v + 6)}
              >
                Show more
              </Button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
} 