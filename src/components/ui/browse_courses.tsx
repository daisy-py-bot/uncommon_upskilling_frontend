import CourseCard from "@/components/ui/course_card"
import Pagination from "@/components/ui/pagination"
import { FC } from "react"
import { Button } from "@/components/ui/button"

type BrowseCoursesProps = {
  courses?: any[];
  stats?: any;
  onRequireLogin?: () => void;
};

const BrowseCourses: FC<BrowseCoursesProps> = ({ courses = [], stats, onRequireLogin }) => {
  return (
    <section className="w-full max-w-[1400px] bg-white mt-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-medium mb-4">Browse Courses</h2>
        <p className="text-lg md:text-xl text-gray-700">
          Explore a wide range of courses designed to help you learn new skills and advance your career.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No courses available.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} {...course} onRequireLogin={onRequireLogin} alreadyEnrolledMessage="already enrolled in course" />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              onClick={onRequireLogin}
              className="bg-[#0747A1] hover:bg-[#05316e] text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            >
              <span className="flex items-center gap-3">
                Explore More
                <div className="relative">
                  {/* Arrow in pulsing circle */}
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <svg 
                      className="w-4 h-4 text-white transform group-hover:translate-x-0.5 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </span>
              
              {/* Pulsing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
            </Button>
          </div>
        </>
      )}
    </section>
  )
}

export default BrowseCourses