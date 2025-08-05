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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const heroImages = [
    { src: "/hero_img.png", alt: "Students learning and growing" },
    { src: "/hero_img2.png", alt: "Professional development" },
    { src: "/hero_img3.png", alt: "Career advancement" }
  ];

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

  // Auto-slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

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

        {/* Hero Section - Enhanced with animations and visual appeal */}
        <main className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-12 pb-20 mt-10">
          {/* Left Content - Enhanced */}
          <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-2 rounded-full text-sm font-medium text-blue-700 animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              🚀 Join 1000+ students already learning
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Continue your{" "}
              {/* <span className="bg-gradient-to-r from-amber-800 via-amber-900 to-yellow-900 bg-clip-text text-transparent animate-gradient">Continue</span>{" "} */}
              {/* your{" "} */}
              <span className="text-[#0747A1] relative">
                uncommon
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#0747A1] to-blue-400 rounded-full animate-pulse"></div>
              </span>{" "}
              {/* <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-gradient">
                journey
              </span> */}
              journey
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
              Transform your career with cutting-edge skills. Our platform bridges the gap between bootcamp and real-world success.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-6 w-full">
              <Button 
                className="bg-gradient-to-r from-[#0747A1] to-blue-600 hover:from-[#05316e] hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto group"
                onClick={() => {
                  if (user) {
                    router.push('/dashboard');
                  } else {
                    setAuthModalMode('login');
                  }
                }}
              >
                <span className="flex items-center gap-2">
                  Get Started Now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
              
                             <a href="#success-stories" className="w-full sm:w-auto">
                 <Button className="bg-blue-600 border-2 border-blue-600 text-white hover:bg-[#0747A1] hover:border-[#0747A1] hover:text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full group">
                   <span className="flex items-center gap-2">
                     See Success Stories
                     <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                     </svg>
                   </span>
                 </Button>
               </a>
            </div>

            {/* Enhanced Statistics with icons and better styling */}
            <div ref={statsRef} className="grid grid-cols-3 gap-8 pt-8 w-full max-w-2xl">
              <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span className="text-3xl md:text-4xl font-bold text-gray-800 transition-all duration-300">
                  {animatedStats.students.toLocaleString()}+
                </span>
                <span className="text-gray-600 text-sm font-medium">Active Students</span>
              </div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-3xl md:text-4xl font-bold text-gray-800 transition-all duration-300">
                  {animatedStats.courses.toLocaleString()}+
                </span>
                <span className="text-gray-600 text-sm font-medium">Expert Courses</span>
              </div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-3xl md:text-4xl font-bold text-gray-800 transition-all duration-300">
                  {animatedStats.categories.toLocaleString()}+
                </span>
                <span className="text-gray-600 text-sm font-medium">Categories</span>
              </div>
            </div>
          </div>

          {/* Right Image - Enhanced with sliding carousel */}
          <div className="relative">
            {/* Background decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Main image container with carousel */}
            <div className="relative p-8 h-[500px] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              {/* Image carousel */}
              <div className="relative w-full h-full">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={500}
                      height={600}
                      className="object-cover object-top h-full w-full rounded-xl shadow-lg"
                    />
                  </div>
                ))}
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 animate-bounce z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Live Learning</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 animate-bounce z-10" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Expert Mentors</span>
                </div>
              </div>

              {/* Carousel indicators */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-125 shadow-lg' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
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