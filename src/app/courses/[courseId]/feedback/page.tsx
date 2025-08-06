"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Star, ChevronLeft, Heart, MessageCircle, Lightbulb, ThumbsUp, Award, Sparkles } from 'lucide-react'
import { decodeJWT, buildApiUrl } from '@/lib/utils'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function CourseFeedbackPage() {
  const params = useParams();
  const [rating, setRating] = useState(0)
  const [enjoyment, setEnjoyment] = useState("")
  const [improvements, setImprovements] = useState("")
  const [usefulness, setUsefulness] = useState("")
  const [clarity, setClarity] = useState("")
  const [recommend, setRecommend] = useState("")
  const [testimonial, setTestimonial] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Please provide a rating before submitting.')
      return
    }

    setSubmitting(true)

    try {
      // Get user ID from JWT token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const userInfo = decodeJWT(token)
      
      if (!userInfo?.id) {
        throw new Error('User not authenticated')
      }

      // Build the feedback payload according to CreateFeedbackDto
      const feedbackPayload = {
        userId: userInfo.id,
        courseId: params.courseId,
        rating: rating,
        comment: enjoyment || improvements || "Great course!",
        testimonial: testimonial || "Highly recommended!",
        publicOk: true,
        fullResponse: {
          answers: [
            { question: "What did you enjoy most about the course?", answer: enjoyment },
            { question: "What could be improved?", answer: improvements },
            { question: "How useful was this course?", answer: usefulness },
            { question: "How clear was the content?", answer: clarity },
            { question: "Would you recommend this course?", answer: recommend }
          ].filter(item => item.answer) // Only include questions that have answers
        }
      }

      const res = await fetch(buildApiUrl('feedback'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedbackPayload)
      })

      if (!res.ok) {
        throw new Error('Failed to submit feedback')
      }

      setSubmitted(true)
    } catch (err: any) {
      alert(`Error submitting feedback: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/courses/${params.courseId}`} className="flex items-center text-gray-600 hover:text-blue-700 text-sm font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-md">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Course
          </Link>
        </div>
        
        <Card className="w-full p-8 shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-2xl">
          <CardHeader className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Share Your Experience! 🎉
            </CardTitle>
            <p className="text-gray-600 mt-2 text-lg">Your feedback helps us improve and helps others discover great courses</p>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You! 🎊</h3>
                <p className="text-gray-600">Your feedback has been submitted successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Question 1: Rating */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <div className="flex items-center mb-4">
                    <Star className="h-6 w-6 text-yellow-500 mr-2" />
                    <Label htmlFor="rating" className="text-lg font-semibold text-gray-800">
                      How would you rate this course?
                    </Label>
                  </div>
                  <div className="flex space-x-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-10 w-10 cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                          star <= rating 
                            ? "text-yellow-500 fill-yellow-500 drop-shadow-lg" 
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center mt-2 text-sm text-gray-600">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent!"}
                    </p>
                  )}
                </div>

                {/* Question 2: Enjoyment */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-green-500 mr-2" />
                    <Label htmlFor="enjoyment" className="text-lg font-semibold text-gray-800">
                      What did you enjoy most about the course?
                    </Label>
                  </div>
                  <Textarea
                    id="enjoyment"
                    placeholder="Share what you liked most... ✨"
                    value={enjoyment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEnjoyment(e.target.value)}
                    rows={4}
                    className="min-h-[100px] w-full border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Question 3: Improvements */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-4">
                    <Lightbulb className="h-6 w-6 text-blue-500 mr-2" />
                    <Label htmlFor="improvements" className="text-lg font-semibold text-gray-800">
                      Is there anything you think could be improved?
                    </Label>
                  </div>
                  <Textarea
                    id="improvements"
                    placeholder="Let us know what could be better... 💡"
                    value={improvements}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImprovements(e.target.value)}
                    rows={4}
                    className="min-h-[100px] w-full border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Question 4: Usefulness */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="h-6 w-6 text-purple-500 mr-2" />
                    <Label className="text-lg font-semibold text-gray-800">
                      How useful was this course to your personal or career goals?
                    </Label>
                  </div>
                  <RadioGroup value={usefulness} onValueChange={setUsefulness} className="space-y-3 w-full">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-100 transition-colors">
                      <RadioGroupItem value="not-useful" id="usefulness-1" />
                      <Label htmlFor="usefulness-1" className="cursor-pointer">Not useful</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-100 transition-colors">
                      <RadioGroupItem value="somewhat-useful" id="usefulness-2" />
                      <Label htmlFor="usefulness-2" className="cursor-pointer">Somewhat useful</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-100 transition-colors">
                      <RadioGroupItem value="very-useful" id="usefulness-3" />
                      <Label htmlFor="usefulness-3" className="cursor-pointer">Very useful</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-100 transition-colors">
                      <RadioGroupItem value="extremely-useful" id="usefulness-4" />
                      <Label htmlFor="usefulness-4" className="cursor-pointer">Extremely useful</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Question 5: Clarity */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 text-indigo-500 mr-2" />
                    <Label className="text-lg font-semibold text-gray-800">
                      How clear and easy to understand was the course content?
                    </Label>
                  </div>
                  <RadioGroup value={clarity} onValueChange={setClarity} className="space-y-3 w-full">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-100 transition-colors">
                      <RadioGroupItem value="not-clear" id="clarity-1" />
                      <Label htmlFor="clarity-1" className="cursor-pointer">Not clear at all</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-100 transition-colors">
                      <RadioGroupItem value="somewhat-clear" id="clarity-2" />
                      <Label htmlFor="clarity-2" className="cursor-pointer">Somewhat clear</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-100 transition-colors">
                      <RadioGroupItem value="very-clear" id="clarity-3" />
                      <Label htmlFor="clarity-3" className="cursor-pointer">Very clear</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-100 transition-colors">
                      <RadioGroupItem value="extremely-clear" id="clarity-4" />
                      <Label htmlFor="clarity-4" className="cursor-pointer">Extremely clear</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Question 6: Recommendation */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                  <div className="flex items-center mb-4">
                    <Award className="h-6 w-6 text-emerald-500 mr-2" />
                    <Label className="text-lg font-semibold text-gray-800">
                      Would you recommend this course to others?
                    </Label>
                  </div>
                  <RadioGroup value={recommend} onValueChange={setRecommend} className="space-y-3 w-full">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-100 transition-colors">
                      <RadioGroupItem value="definitely-not" id="recommend-1" />
                      <Label htmlFor="recommend-1" className="cursor-pointer">Definitely not</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-100 transition-colors">
                      <RadioGroupItem value="probably-not" id="recommend-2" />
                      <Label htmlFor="recommend-2" className="cursor-pointer">Probably not</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-100 transition-colors">
                      <RadioGroupItem value="maybe" id="recommend-3" />
                      <Label htmlFor="recommend-3" className="cursor-pointer">Maybe</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-100 transition-colors">
                      <RadioGroupItem value="probably" id="recommend-4" />
                      <Label htmlFor="recommend-4" className="cursor-pointer">Probably</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-100 transition-colors">
                      <RadioGroupItem value="definitely" id="recommend-5" />
                      <Label htmlFor="recommend-5" className="cursor-pointer">Definitely</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Question 7: Testimonial */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                  <div className="flex items-center mb-4">
                    <MessageCircle className="h-6 w-6 text-amber-500 mr-2" />
                    <Label htmlFor="testimonial" className="text-lg font-semibold text-gray-800">
                      Would you like to share a testimonial? (Optional)
                    </Label>
                  </div>
                  <Textarea
                    id="testimonial"
                    placeholder="Share your experience with others... 🌟"
                    value={testimonial}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestimonial(e.target.value)}
                    rows={4}
                    className="min-h-[100px] w-full border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col items-center space-y-4 pt-6">
                  <Button 
                    type="submit" 
                    className="w-full max-w-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Submit Feedback
                      </div>
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 text-center">Your certificate will be ready once you submit ✨</p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
