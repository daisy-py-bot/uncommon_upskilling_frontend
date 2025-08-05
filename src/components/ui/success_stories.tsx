import TestimonialCard from "@/components/ui/testimonial_cards"
import { Button } from "@/components/ui/button"
import { FC, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = { onGetStarted?: () => void; feedback?: any[] }

const StudentSuccessStories: FC<Props> = ({ onGetStarted, feedback }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const defaultTestimonials = [
    {
      id: "1",
      name: "Marcus John",
      course: "Budgeting Masterclass",
      quote:
        "The Budgeting Masterclass helped me learn how to manage my finances. Through the lessons I learnt from this course, I was able to save up for my new laptop which has helped make my work as a designer easier.",
      rating: 4,
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      id: "2",
      name: "Sarah Chen",
      course: "Web Development Fundamentals",
      quote:
        "This course was a game-changer! I went from zero coding knowledge to building my first website. The instructors were fantastic and the content was easy to follow.",
      rating: 5,
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      id: "3",
      name: "David Lee",
      course: "Digital Marketing Strategy",
      quote:
        "I highly recommend this course for anyone looking to boost their online presence. The strategies I learned helped me significantly increase traffic to my small business website.",
      rating: 4,
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      id: "4",
      name: "Emily Rodriguez",
      course: "Data Science Essentials",
      quote:
        "This platform transformed my career! The data science course gave me the skills I needed to transition from marketing to analytics. The practical projects were invaluable.",
      rating: 5,
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      id: "5",
      name: "Alex Thompson",
      course: "UI/UX Design Mastery",
      quote:
        "As a developer, I wanted to improve my design skills. This course taught me the fundamentals of user experience design and helped me create better products.",
      rating: 4,
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
    {
      id: "6",
      name: "Maria Garcia",
      course: "Project Management",
      quote:
        "The project management course was exactly what I needed to advance in my career. I learned practical tools and techniques that I use daily in my role.",
      rating: 5,
      imageSrc: "/placeholder.svg?height=64&width=64",
    },
  ]
  const testimonials = feedback && feedback.length > 0 ? feedback : defaultTestimonials;

  // Create infinite loop by duplicating testimonials
  const infiniteTestimonials = [...testimonials, ...testimonials, ...testimonials];
  const totalSlides = testimonials.length;

  // Auto-play functionality with infinite loop
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = prev + 1;
        // Reset to beginning when we reach the end of original testimonials
        if (next >= totalSlides) {
          // Add a small delay before resetting to create seamless loop
          setTimeout(() => setCurrentSlide(0), 50);
          return totalSlides;
        }
        return next;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev + 1;
      if (next >= totalSlides) {
        setTimeout(() => setCurrentSlide(0), 50);
        return totalSlides;
      }
      return next;
    });
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev - 1;
      if (next < 0) {
        setTimeout(() => setCurrentSlide(totalSlides - 1), 50);
        return -1;
      }
      return next;
    });
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="w-full  bg-white  mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-medium mb-4">Student Success Stories</h2>
        <p className="text-lg md:text-xl text-gray-700">
          Discover how the Uncommon upskilling platform has transformed careers and empowered individuals.
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * (100/3)}%)` }}
        >
          {infiniteTestimonials.map((testimonial, index) => (
            <div key={`${testimonial.id}-${index}`} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Dots indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-[#0747A1] scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
      {/*Call to action section content */}
      <div className="text-center mt-16 pt-8 border-gray-200">
        {" "}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6">Your Next Step Begins Here!</h2>
        <p className="text-lg md:text-xl text-gray-700  mb-10 mt-10">
          This platform was created to help Uncommon alumni keep growing beyond the bootcamp. It fills in the gaps,
          covering soft skills, advanced digital tools, and new career pathways that weren’t fully explored during the
          one-year program. Whether you're refining your communication, boosting your tech skills, or preparing for
          real-world challenges, this space is here to support your next step.
        </p>
        <Button
          className="bg-uncommonBlue hover:bg-uncommonBlue-dark text-white px-4 py-5 rounded-md text-xs"
          onClick={onGetStarted}
        >
                Get Started &gt;&gt;
        </Button>
      </div>

    </section>
  )
}

export default StudentSuccessStories