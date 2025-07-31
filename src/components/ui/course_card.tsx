import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { decodeJWT, buildApiUrl } from "@/lib/utils"

interface CourseCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  totalLessons?: number;
  duration?: string;
  description?: string;
  progress?: number; // New optional prop for dashboard cards
  onRequireLogin?: () => void;
  alreadyEnrolledMessage?: string;
}

export default function CourseCard({ id, title, totalLessons, duration, description, thumbnailUrl, progress, onRequireLogin, alreadyEnrolledMessage }: CourseCardProps) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);
  const handleEnrol = useCallback(async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        if (onRequireLogin) onRequireLogin();
        return;
      }
      const userInfo = decodeJWT(token);
      if (!userInfo?.id) {
        setEnrollMessage('User not found. Please log in again.');
        return;
      }
      setEnrollMessage(null);
      setEnrolling(true);
      try {
        const res = await fetch(buildApiUrl('enrollments'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: userInfo.id, courseId: id }),
        });
        if (res.status === 409) {
          setEnrollMessage(alreadyEnrolledMessage || 'You are already enrolled in this course.');
          setEnrolling(false);
          setTimeout(() => {
            setEnrollMessage(null);
          }, 2000);
          return;
        }
        if (!res.ok) throw new Error('Failed to enroll in course');
        setEnrollMessage('Successfully enrolled! Redirecting...');
        setTimeout(() => {
          router.push(`/courses/${id}/enroll`);
        }, 1200);
      } catch (err: any) {
        setEnrollMessage(err.message || 'Failed to enroll in course');
      } finally {
        setEnrolling(false);
      }
    }
  }, [id, onRequireLogin, router, alreadyEnrolledMessage]);
  return (
    <div className="flex flex-col rounded-lg border bg-white text-card-foreground shadow-sm overflow-hidden min-h-[400px]">
      <div className="w-full h-[170px] bg-gray-200 rounded-t-lg overflow-hidden">
        <img
          src={thumbnailUrl || "/placeholder.svg"}
          alt={`Image for ${title}`}
          className="object-cover w-full h-full rounded-t-lg"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {progress !== undefined ? (
          // Dashboard specific content
          <>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span>{progress}%</span>
              <div className="flex-grow h-2 bg-gray-200 rounded-full ml-2">
                <div className="h-full bg-uncommonBlue rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <Button className="w-full bg-uncommonBlue hover:bg-uncommonBlue text-white">Resume</Button>
          </>
        ) : (
          // Browse courses specific content
          <>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>{
                typeof totalLessons === 'number'
                  ? `${totalLessons} Lesson${totalLessons === 1 ? '' : 's'}`
                  : '0 Lessons'
              }</span>
              <span>{duration} mins</span>
            </div>
            <p className="text-gray-700 text-sm mb-4 flex-grow line-clamp-3">{description}</p>
            <Button className="w-full bg-uncommonBlue hover:bg-uncommonBlue-dark text-white" onClick={handleEnrol} disabled={enrolling}>
              {enrolling ? 'Enrolling...' : 'Enrol'}
            </Button>
            {enrollMessage && (
              <div className={`mt-2 text-xs ${enrollMessage.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>{enrollMessage}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}