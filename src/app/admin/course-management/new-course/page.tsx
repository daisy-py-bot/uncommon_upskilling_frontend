"use client"

import { useState, useRef, useEffect } from "react" // Import useState, useRef
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react" // Import Plus and Minus icons
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { buildApiUrl } from "@/lib/utils"
import NotificationModal from '@/components/ui/NotificationModal';
import { supabase } from '@/lib/superbase'

export default function AddNewCourse() {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [category, setCategory] = useState('');

  // State to manage learning objectives
  const [learningObjectives, setLearningObjectives] = useState<string[]>([""]) // Start with one empty objective
  // State for image upload and preview
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  // Add modal color state and pass to NotificationModal
  const [modalColor, setModalColor] = useState<string|undefined>(undefined);

  // Mark as dirty on any field change
  function markDirty() { setHasUnsavedChanges(true); }

  function showModal(message: string, timeout = 2000) {
    setModalMessage(message);
    setModalOpen(true);
    // NotificationModal auto-closes after timeout
  }

  // Add beforeunload warning for unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Upload file to Supabase and return the URL
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `course-thumbnails/${fileName}`

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (error) throw error

    const { data: publicUrl } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return publicUrl.publicUrl
  }

  // Save handler with file upload
  async function handleSave() {
    try {
      let uploadedThumbnailUrl = null
      
      // Upload thumbnail if selected
      if (thumbnail) {
        setModalMessage('Uploading thumbnail...')
        setModalOpen(true)
        uploadedThumbnailUrl = await uploadFile(thumbnail)
      }

      const courseData = {
        title: titleRef.current?.value || '',
        description: descriptionRef.current?.value || '',
        category,
        learningObjectives,
        level,
        badges,
        previewUrl: uploadedThumbnailUrl || previewUrl, // Use uploaded URL or existing preview URL
      };
      
      localStorage.setItem('newCourseData', JSON.stringify(courseData));
      setHasUnsavedChanges(false);
      setModalMessage('Course saved!');
      setModalOpen(true);
    } catch (error: any) {
      setModalMessage(`Error: ${error.message}`);
      setModalOpen(true);
    }
  }

  // Confirm navigation if unsaved changes
  function confirmNav(action: () => void) {
    if (!hasUnsavedChanges) {
      action();
    } else {
      setModalMessage('You have unsaved changes. Please save before leaving.');
      setModalOpen(true);
    }
  }

  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError('');
    fetch(buildApiUrl('courses/categories'))
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      })
      .then(data => setCategories(data))
      .catch(() => setCategoriesError('Failed to fetch categories'))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Course level and badges
  const [level, setLevel] = useState('');
  const [badges, setBadges] = useState<string[]>([]); // store selected badge ids
  const [allBadges, setAllBadges] = useState<any[]>([]); // array of badge objects
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [badgesError, setBadgesError] = useState('');
  useEffect(() => {
    setBadgesLoading(true);
    setBadgesError('');
    fetch(buildApiUrl('badges'))
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch badges');
        return res.json();
      })
      .then(data => setAllBadges(data))
      .catch(() => setBadgesError('Failed to fetch badges'))
      .finally(() => setBadgesLoading(false));
  }, []);

  // Add refs for form fields
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Load course data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('newCourseData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.title && titleRef.current) titleRef.current.value = data.title;
        if (data.description && descriptionRef.current) descriptionRef.current.value = data.description;
        if (data.category) setCategory(data.category);
        if (data.learningObjectives) setLearningObjectives(data.learningObjectives);
        if (data.level) setLevel(data.level);
        if (data.badges) setBadges(data.badges);
        if (data.previewUrl) setPreviewUrl(data.previewUrl);
      } catch {}
    }
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      setPreviewUrl(URL.createObjectURL(file))
      markDirty()
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setThumbnail(file)
      setPreviewUrl(URL.createObjectURL(file))
      markDirty()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleAddObjective = () => {
    setLearningObjectives([...learningObjectives, ""])
  }

  const handleRemoveObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index))
  }

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...learningObjectives]
    newObjectives[index] = value
    setLearningObjectives(newObjectives)
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
        <button
          className="flex items-center gap-2 px-3 py-2 mb-6 bg-transparent text-gray-600 hover:bg-gray-100 rounded transition"
          onClick={() => confirmNav(() => router.push('/admin/course-management'))}
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Course Management</span>
        </button>
          <h1 className="text-3xl font-bold mb-2">Upload New Course</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Add course details to help students discover your course and understand what they will learn
          </p>
        </header>



        <section className="mb-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add course details to help students discover your course and understand what they will learn
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="course-title"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Course Title
                  </label>
                  <Input id="course-title" placeholder="Course Title" className="w-full" ref={titleRef} onChange={markDirty} />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="course-description"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Course Description
                  </label>
                  <Textarea id="course-description" placeholder="Course Description" className="min-h-[120px] w-full" ref={descriptionRef} onChange={markDirty} />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Category
                  </label>
                  <Select onValueChange={v => { setCategory(v); markDirty(); }} value={category} required disabled={categoriesLoading || !!categoriesError}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : categoriesError ? "Failed to load categories" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                {/* Learning Objectives Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Learning Objectives
                  </label>
                  {learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Objective ${index + 1}`}
                        value={objective}
                        onChange={(e) => { handleObjectiveChange(index, e.target.value); markDirty(); }}
                      />
                      {learningObjectives.length > 1 && (
                        <Button
                          variant="outline"
                          
                          onClick={() => { handleRemoveObjective(index); markDirty(); }}
                          className="text-red-500 hover:bg-red-100"
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Remove objective</span>
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => { handleAddObjective(); markDirty(); }} className="w-full mt-2 bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Objective
                  </Button>
                </div>
                {/* Course Level Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Course Level</label>
                  <Select value={level} onValueChange={v => { setLevel(v); markDirty(); }} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Badges Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Badges</label>
                  {badgesLoading ? (
                    <div className="text-gray-500 text-sm">Loading badges...</div>
                  ) : badgesError ? (
                    <div className="text-red-500 text-sm">{badgesError}</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allBadges.map((badge: any) => (
                        <button
                          key={badge.id}
                          type="button"
                          title={badge.description}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${badges.includes(badge.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                          onClick={() => { setBadges(badges.includes(badge.id) ? badges.filter(b => b !== badge.id) : [...badges, badge.id]); markDirty(); }}
                        >
                          {badge.iconUrl && (
                            <img src={badge.iconUrl} alt={badge.name} className="h-4 w-4 rounded-full" />
                          )}
                          {badge.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Thumbnail Section */}
            <Card>
              <CardHeader>
                <CardTitle>Course Thumbnail</CardTitle>
                <p className="text-sm text-muted-foreground">Add your course's cover image</p>
              </CardHeader>
              <CardContent>
                <div
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg h-[300px] text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleBrowseClick}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="mb-4 rounded-lg object-contain max-h-40" />
                  ) : (
                    <div className="mb-4 p-4 bg-gray-100 rounded-lg flex flex-col items-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <p className="text-lg font-semibold mt-2">Upload Photo</p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-2">JPG, PNG, max 2MB</p>
                  <p className="text-sm text-muted-foreground">
                    Drop your document here, or{' '}
                    <span className="text-blue-600 hover:underline" onClick={e => { e.stopPropagation(); handleBrowseClick(); }}>
                      click to browse
                    </span>
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={e => { handleFileChange(e); markDirty(); }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-end mt-8 w-full">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('newCourseData');
                if (titleRef.current) titleRef.current.value = '';
                if (descriptionRef.current) descriptionRef.current.value = '';
                setCategory('');
                setLearningObjectives(['']);
                setLevel('');
                setBadges([]);
                setPreviewUrl(null);
                showModal('Course reset!');
              }}
            >
              Reset
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              onClick={() => {
                const courseData = {
                  title: titleRef.current?.value || '',
                  description: descriptionRef.current?.value || '',
                  category,
                  learningObjectives,
                  level,
                  badges,
                  previewUrl,
                };
                localStorage.setItem('newCourseData', JSON.stringify(courseData));
                setHasUnsavedChanges(false);
                setModalMessage('Course saved!');
                setModalOpen(true);
                setModalColor('green');
                setTimeout(() => {
                  setModalColor(undefined);
                  router.push('/admin/course-management/new-module');
                }, 2000);
              }}
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <NotificationModal open={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage} color={modalColor} />
    </div>
  )
}
