"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import AuthModal from "@/components/ui/AuthModal"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import BrowseCourses from "@/components/ui/browse_courses" // Import the new component
import StudentSuccessStories from "@/components/ui/success_stories"
import { useRouter } from "next/navigation"
import { buildApiUrl } from "@/lib/utils"

export default function LandingPage() {
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseStats, setCourseStats] = useState<any>(null);
  const [browseCourses, setBrowseCourses] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ students: 0, courses: 0, categories: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(buildApiUrl("dashboard"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Dashboard API response:', data); // Debug log
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          localStorage.removeItem("token");
        }
      }
      setUserLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(buildApiUrl("home"))
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch home data");
        const data = await res.json();
        setCourseStats({
          numberOfCourses: data.numberOfCourses,
          numberOfCategories: data.numberOfCategories,
          numberOfStudents: data.numberOfStudents,
        });
        // Set target values for animation
        setAnimatedStats({
          students: data.numberOfStudents || 0,
          courses: data.numberOfCourses || 0,
          categories: data.numberOfCategories || 0,
        });
        setBrowseCourses(data.courses || []);
        // Transform feedback to testimonial format
        setFeedback(
          (data.feedback || []).map((fb: any) => ({
            id: fb.id,
            name: fb.user ? `${fb.user.firstname} ${fb.user.lastname}` : "Anonymous",
            course: fb.course?.title || "",
            quote: fb.testimonial || fb.comment || "",
            rating: fb.rating || 5,
            imageSrc: fb.user?.avatarUrl || "/placeholder.svg",
          }))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Animate stats when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start animation when stats section is visible
            animateStats();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [courseStats]);

  const animateStats = () => {
    const duration = 2000; // 2 seconds
    const steps = 120; // More steps for smoother animation
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        students: Math.floor((courseStats?.numberOfStudents || 0) * progress),
        courses: Math.floor((courseStats?.numberOfCourses || 0) * progress),
        categories: Math.floor((courseStats?.numberOfCategories || 0) * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        // Set final values
        setAnimatedStats({
          students: courseStats?.numberOfStudents || 0,
          courses: courseStats?.numberOfCourses || 0,
          categories: courseStats?.numberOfCategories || 0,
        });
      }
    }, stepDuration);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
      {/* Main white card container for Hero Section */}
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between w-full py-6">
          <div className="text-2xl font-bold text-uncommonBlue">uncommon</div>
          <nav className="hidden space-x-8 md:flex">
            <button
              className="text-lg font-medium hover:text-uncommonBlue focus:outline-none bg-transparent"
              onClick={() => router.push('/')}
            >
              Home
            </button>
            <button
              className="text-lg font-medium hover:text-uncommonBlue focus:outline-none bg-transparent"
              onClick={() => {
                if (user) {
                  router.push('/dashboard');
                } else {
                  setAuthModalMode('login');
                }
              }}
            >
              Dashboard
            </button>
            <button
              className="text-lg font-medium hover:text-uncommonBlue focus:outline-none bg-transparent"
              onClick={() => {
                if (user) {
                  router.push('/courses');
                } else {
                  setAuthModalMode('login');
                }
              }}
            >
              Courses
            </button>
            <button
              className="text-lg font-medium hover:text-uncommonBlue focus:outline-none bg-transparent"
              onClick={() => {
                const section = document.getElementById('success-stories');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              About
            </button>
          </nav>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {!userLoading && (
              user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:opacity-80 flex items-center justify-center"
                      onClick={handleProfileClick}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-amber-700 flex items-center justify-center">
                          {(() => {
                            let initials = '?';
                            if (user.name) {
                              const words = user.name.trim().split(' ');
                              if (words.length === 1) {
                                initials = words[0].charAt(0).toUpperCase();
                              } else if (words.length > 1) {
                                initials = words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
                              }
                            }
                            return (
                              <span className="text-amber-50 text-sm font-semibold">
                                {initials}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <span 
                      className="text-sm font-medium text-gray-700 cursor-pointer hover:text-uncommonBlue"
                      onClick={handleProfileClick}
                    >
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    className="bg-uncommonBlue hover:bg-uncommonBlue-dark text-white px-6 py-2 rounded-md"
                    onClick={() => setAuthModalMode('login')}
                  >
              Login
            </Button>
                  <Button
                    className="bg-uncommonBlue hover:bg-uncommonBlue-dark text-white px-6 py-2 rounded-md"
                    onClick={() => setAuthModalMode('signup')}
                  >
              Sign Up
            </Button>
                </>
              )
            )}
          </div>
        </header>

        {/* Hero Section - Grid for content and image */}
        <main className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 pb-20 mt-10">
          {/* Left Content */}
          <div className="col-span-2 space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium leading-tight">
              <span className="bg-gradient-to-r from-amber-800 via-amber-900 to-yellow-900 bg-clip-text text-transparent animate-gradient">Continue</span>{" "}
              your{" "}
              <span className="text-[#0747A1]">uncommon</span>{" "}
              journey
            </h1>
            <p className="text-xl md:text-2xl text-gray-700">
              Enhance your employability with our upskilling courses.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 w-full">
              <a href="#success-stories" className="w-full sm:w-auto">
                <Button className="bg-uncommonBlue hover:bg-uncommonBlue-dark text-white px-4 py-5 rounded-md text-xs w-full">
                Know More &gt;&gt;
              </Button>
              </a>
              <Button
                className="bg-uncommonBlue hover:bg-uncommonBlue-dark text-white px-4 py-5 rounded-md text-xs"
                onClick={() => {
                  if (user) {
                    router.push('/dashboard');
                  } else {
                    setAuthModalMode('login');
                  }
                }}
              >
                Get Started &gt;&gt;
              </Button>
            </div>

            {/* Statistics (dynamic from API) */}
            <div ref={statsRef} className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-6 sm:space-y-0 sm:space-x-8 pt-8 w-full">
              <div className="flex flex-col items-start">
                <span className="text-4xl font-bold text-gray-800 transition-all duration-300">
                  {animatedStats.students.toLocaleString()}
                </span>
                <span className="text-gray-600">Active Students</span>
              </div>
              <div className="h-16 w-1 bg-black hidden sm:block" /> {/* Vertical divider */}
              <div className="flex flex-col items-start">
                <span className="text-4xl font-bold text-gray-800 transition-all duration-300">
                  {animatedStats.courses.toLocaleString()}
                </span>
                <span className="text-gray-600">Courses</span>
              </div>
              <div className="h-16 w-1  bg-black hidden sm:block" /> {/* Vertical divider */}
              <div className="flex flex-col items-start">
                <span className="text-4xl font-bold text-gray-800 transition-all duration-300">
                  {animatedStats.categories.toLocaleString()}
                </span>
                <span className="text-gray-600">Course Categories</span>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder (with frame) */}
          <div className="p-8 h-[400px] w-full md:w-[400px] flex items-center justify-center overflow-hidden rounded-lg mx-auto">
            <Image
              src="/hero_img.png"
              alt="Placeholder for student image"
              width={500}
              height={600}
              className="object-cover object-top h-full w-full rounded-lg "
            />
          </div>
        </main>

      {/* Loading/Error State */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-red-500">{error}</div>
      ) : (
        <>
      {/* Browse Courses Section */}
          <BrowseCourses courses={browseCourses} stats={courseStats} onRequireLogin={() => setAuthModalMode('login')} />
      {/* Student Success Stories Section */}
          <div id="success-stories">
            <StudentSuccessStories 
              onGetStarted={() => {
                if (user) {
                  router.push('/dashboard');
                } else {
                  setAuthModalMode('login');
                }
              }} 
              feedback={feedback} 
            />
          </div>
        </>
      )}
      {authModalMode && (
        <AuthModal
          onClose={() => setAuthModalMode(null)}
          initialMode={authModalMode}
          onAuthSuccess={(userData) => setUser(userData)}
        />
      )}
      </div>
    </div>
  )
}