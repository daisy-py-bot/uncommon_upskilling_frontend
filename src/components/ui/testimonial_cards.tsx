import Image from "next/image"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  name: string
  course: string
  quote: string
  rating: number // e.g., 4 for 4 stars
  avatar: string
}

export default function TestimonialCard({ name, course, quote, rating, avatar }: TestimonialCardProps) {
  return (
    <div className="relative w-[380px] flex flex-col items-start p-8 bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-[295px] group overflow-hidden">
      {/* Decorative background elements - contained within card */}
      <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full opacity-20"></div>
      <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full opacity-20"></div>
      
      {/* Quote icon */}
      <div className="absolute top-6 left-6 text-blue-200 text-4xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">
        "
      </div>
      
      <div className="flex items-center mb-4 relative z-10">
        <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg ring-4 ring-white flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={`Profile picture of ${name}`}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          ) : (
            <span className="text-white text-xl font-bold">
              {(() => {
                if (!name) return '?';
                const words = name.trim().split(' ');
                if (words.length === 1) return words[0].charAt(0).toUpperCase();
                return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
              })()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 truncate">{name}</h3>
          <p className="text-blue-600 text-sm font-medium bg-blue-100 px-3 py-1 rounded-full inline-block truncate">{course}</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 relative z-10">
        <p className="text-gray-700 text-base leading-relaxed line-clamp-4">
          {quote}
        </p>
      </div>
      
      <div className="flex items-center justify-between w-full relative z-10 mt-4">
        <div className="flex flex-shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
            />
          ))}
        </div>
        
        {/* Success badge */}
        <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Success Story
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}