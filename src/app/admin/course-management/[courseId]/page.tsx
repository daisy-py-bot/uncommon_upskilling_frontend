// src/app/admin/course-management/[courseId]/page.tsx
// This page is used to view and manage a course.
// It is used by the admin to view and manage a course.
// It is used to view and manage a course.
"use client"

// import { AppSidebar } from "@/components/app-sidebar"
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Edit, Save, X, Plus, Trash2, Loader2, Tag, Award } from "lucide-react"
import Link from "next/link"
import { CourseStatisticItem } from "@/components/course-statistic-item"
import React, { useEffect, useState } from "react";
import { buildApiUrl } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CourseViewPage({ params }: { params: Promise<{ courseId: string }> }) {
  // --- Course data state and fetch logic ---
  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  // --- Statistics state and fetch logic ---
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // --- Edit state management ---
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editData, setEditData] = useState<any>({});
  // --- Ancillary management data (categories, badges, tags) ---
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [badges, setBadges] = useState<any[]>([]);
  const [badgesLoading, setBadgesLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>("");
  const [showAddLessonModal, setShowAddLessonModal] = useState<boolean>(false);
  const [lessonModalModuleId, setLessonModalModuleId] = useState<string | null>(null);
  const [showAddModuleModal, setShowAddModuleModal] = useState<boolean>(false);

  // Unwrap params Promise
  const { courseId } = React.use(params);

  // Fetch course data on mount
  useEffect(() => {
    async function fetchCourseData() {
      setCourseLoading(true);
      setCourseError(null);
      try {
        const res = await fetch(buildApiUrl(`courses/${courseId}/content/admin`));
        if (!res.ok) throw new Error("Failed to fetch course data");
        const data = await res.json();
        setCourse(data);
      } catch (err: any) {
        setCourseError(err.message || "Failed to fetch course data");
      } finally {
        setCourseLoading(false);
      }
    }
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    async function fetchStatistics() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const res = await fetch(buildApiUrl(`courses/${courseId}/statistics`));
        if (!res.ok) throw new Error("Failed to fetch statistics");
        const data = await res.json();
        setStatistics(data.statistics);
      } catch (err: any) {
        setStatsError(err.message || "Failed to fetch statistics");
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStatistics();
  }, [courseId]);
  // --- End statistics logic ---

  // --- Load categories and badges for management ---
  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        const res = await fetch(buildApiUrl('categories/all'), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } finally {
        setCategoriesLoading(false);
      }
    }
    async function loadBadges() {
      try {
        setBadgesLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        const res = await fetch(buildApiUrl('badges'), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          setBadges(Array.isArray(data) ? data : []);
        }
      } finally {
        setBadgesLoading(false);
      }
    }
    loadCategories();
    loadBadges();
  }, []);

  // --- Edit handlers ---
  const startEditingModule = (module: any) => {
    setEditingModuleId(module.id);
    setEditData({
      title: module.title || '',
      description: module.description || '',
      duration: module.duration || ''
    });
  };

  const startEditingLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setEditData({
      title: lesson.title || '',
      content: lesson.content || '',
      duration: lesson.duration || '',
      type: lesson.type || 'video',
      mediaUrl: lesson.mediaUrl || '',
      notes: lesson.notes || [],
      resources: lesson.resources || [],
      transcript: lesson.transcript || []
    });
  };

  const startEditingCourse = () => {
    setEditingCourse(true);
    setEditData({
      title: course.title || '',
      description: course.description || '',
      level: course.level || 'beginner',
      categoryId: course.categoryId || '',
      objectives: course.objectives || [],
      tags: Array.isArray(course.searchTags)
        ? course.searchTags
        : (Array.isArray(course.tags) ? course.tags : []),
      badgeIds: Array.isArray(course.badges) ? course.badges.map((b: any) => b.id) : (Array.isArray(course.badgeIds) ? course.badgeIds : []),
      isPublished: course.isPublished ?? true,
    });
  };

  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const saveModule = async (moduleId: string) => {
    try {
      const res = await fetch(buildApiUrl(`courses/${courseId}/modules/${moduleId}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
          duration: editData.duration,
        }),
      });
      if (!res.ok) throw new Error('Failed to save module');
      
      // Update local state
      setCourse((prevCourse: any) => ({
        ...prevCourse,
        modules: prevCourse.modules.map((mod: any) =>
          mod.id === moduleId ? { ...mod, ...editData } : mod
        )
      }));
      
      setEditingModuleId(null);
      setEditData({});
    } catch (error) {
      console.error('Error saving module:', error);
    }
  };

  const saveLesson = async (moduleId: string, lessonId: string) => {
    try {
      // Normalize notes to array of { title, content }
      const normalizedNotes = Array.isArray(editData.notes)
        ? editData.notes.map((n: any) => ({
            title: (n?.title ?? '').toString(),
            content: (n?.content ?? '').toString(),
          }))
        : (typeof editData.notes === 'string' && editData.notes.trim().length > 0
            ? [{ title: 'Notes', content: editData.notes.trim() }]
            : []);

      // Normalize resources to array of { title, description, url, type }
      const normalizedResources = Array.isArray(editData.resources)
        ? editData.resources.map((r: any) => ({
            title: (r?.title ?? '').toString(),
            description: (r?.description ?? '').toString(),
            url: (r?.url ?? '').toString(),
            type: (r?.type ?? 'article').toString(),
          }))
        : [];

      const res = await fetch(buildApiUrl(`lessons/${lessonId}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          title: editData.title,
          content: editData.content,
          duration: editData.duration !== undefined && editData.duration !== null && String(editData.duration).trim() !== ''
            ? Number.parseInt(String(editData.duration), 10)
            : undefined,
          type: editData.type,
          mediaUrl: editData.mediaUrl,
          notes: normalizedNotes,
          resources: normalizedResources,
        }),
      });
      if (!res.ok) throw new Error('Failed to save lesson');
      
      // Update local state
      setCourse((prevCourse: any) => ({
        ...prevCourse,
        modules: prevCourse.modules.map((mod: any) => ({
          ...mod,
          lessons: mod.lessons?.map((lesson: any) =>
            lesson.id === lessonId ? { ...lesson, ...editData } : lesson
          ) || []
        }))
      }));
      
      setEditingLessonId(null);
      setEditData({});
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const saveCourse = async () => {
    try {
      setSaving(true);
      const payload: any = {
        title: editData.title,
        description: editData.description,
        level: editData.level,
        objectives: editData.objectives,
        categoryId: editData.categoryId || null,
        searchTags: Array.isArray(editData.tags) ? editData.tags : [],
        badgeIds: Array.isArray(editData.badgeIds) ? editData.badgeIds : [],
        isPublished: editData.isPublished,
      };

      const res = await fetch(buildApiUrl(`courses/${courseId}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save course');
      const updated = await res.json().catch(() => null);
      
      // Update local state
      setCourse((prevCourse: any) => ({
        ...prevCourse,
        ...editData,
        ...(updated || {}),
      }));
      
      setEditingCourse(false);
      setEditData({});
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingModuleId(null);
    setEditingLessonId(null);
    setEditingCourse(false);
    setEditData({});
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(buildApiUrl(`courses/${courseId}/modules/${moduleId}`), {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete module');
      
      // Update local state
      setCourse((prevCourse: any) => ({
        ...prevCourse,
        modules: prevCourse.modules.filter((mod: any) => mod.id !== moduleId)
      }));
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(buildApiUrl(`courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`), {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete lesson');
      
      // Update local state
      setCourse((prevCourse: any) => ({
        ...prevCourse,
        modules: prevCourse.modules.map((mod: any) =>
          mod.id === moduleId
            ? { ...mod, lessons: mod.lessons?.filter((lesson: any) => lesson.id !== lessonId) || [] }
            : mod
        )
      }));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const openAddLesson = (moduleId: string) => {
    setLessonModalModuleId(moduleId);
    setShowAddLessonModal(true);
  };

  const handleCreateLesson = async (moduleId: string, payload: { title: string; content?: string; duration?: number | string; type?: string; mediaUrl?: string; notes?: Array<{ title: string; content: string }>; resources?: Array<{ title: string; description?: string; url: string; type?: string }>; }) => {
    const moduleObj = course?.modules?.find((m: any) => m.id === moduleId);
    const nextOrder = ((moduleObj?.lessons?.length || 0) + 1);
    const res = await fetch(buildApiUrl('lessons'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        moduleId,
        title: payload.title,
        content: payload.content,
        mediaUrl: payload.mediaUrl,
        notes: Array.isArray(payload.notes) ? payload.notes : undefined,
        resources: Array.isArray(payload.resources) ? payload.resources : undefined,
        order: nextOrder,
        duration: payload.duration !== undefined && payload.duration !== null && String(payload.duration).trim() !== ''
          ? Number.parseInt(String(payload.duration), 10)
          : undefined,
        type: payload.type,
      }),
    });
    if (!res.ok) throw new Error('Failed to add lesson');
    const created = await res.json();
    setCourse((prevCourse: any) => ({
      ...prevCourse,
      modules: prevCourse.modules.map((mod: any) =>
        mod.id === moduleId
          ? { ...mod, lessons: [...(mod.lessons || []), created] }
          : mod
      )
    }));
    startEditingLesson(created);
  };

  const openAddModule = () => {
    setShowAddModuleModal(true);
  };

  const handleCreateModule = async (payload: { title: string; description?: string; order: number; }) => {
    const res = await fetch(buildApiUrl('modules'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        courseId: String(courseId),
        title: payload.title,
        description: payload.description,
        order: Number(payload.order),
      }),
    });
    if (!res.ok) throw new Error('Failed to add module');
    const created = await res.json();
    setCourse((prevCourse: any) => ({
      ...prevCourse,
      modules: [...(prevCourse.modules || []), created],
    }));
    startEditingModule(created);
  };

  // --- Inline forms for modals ---
  function LessonForm({ onSubmit, onCancel }: { onSubmit: (payload: { title: string; content?: string; duration?: number | string; type?: string; mediaUrl?: string; notes?: Array<{ title: string; content: string }>; resources?: Array<{ title: string; description?: string; url: string; type?: string }>; }) => void | Promise<void>, onCancel: () => void }) {
    const [form, setForm] = useState<{ title: string; content: string; duration: string; type: string; mediaUrl: string; notes: Array<{ title: string; content: string }>; resources: Array<{ title: string; description: string; url: string; type: string }> }>({
      title: '',
      content: '',
      duration: '',
      type: 'video',
      mediaUrl: '',
      notes: [{ title: '', content: '' }],
      resources: [{ title: '', description: '', url: '', type: 'article' }],
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const uploadFile = async (file: File): Promise<string> => {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }
      const data = await response.json();
      return data.url;
    };
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Lesson Title</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lesson title" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (min)</label>
            <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} type="number" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">Doc</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Media URL</label>
            <Input value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://..." />
            <div className="mt-2 flex items-center gap-2">
              <Input id="lesson-file-upload" type="file" className="hidden" onChange={async (e) => {
                if (!e.target.files || !e.target.files[0]) return;
                try {
                  setUploading(true);
                  const url = await uploadFile(e.target.files[0]);
                  setForm({ ...form, mediaUrl: url });
                } catch (err: any) {
                  alert(err?.message || 'Upload failed');
                } finally {
                  setUploading(false);
                }
              }} />
              <Button type="button" variant="outline" onClick={() => document.getElementById('lesson-file-upload')?.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </div>
          </div>
        </div>
        {/* Removed Video URL and Transcript per request */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <div className="space-y-2">
            {form.notes.map((note, idx) => (
              <div key={idx} className="space-y-2">
                <Input placeholder="Title" value={note.title} onChange={(e) => {
                  const updated = [...form.notes];
                  updated[idx] = { ...updated[idx], title: e.target.value };
                  setForm({ ...form, notes: updated });
                }} />
                <Textarea placeholder="Content" value={note.content} onChange={(e) => {
                  const updated = [...form.notes];
                  updated[idx] = { ...updated[idx], content: e.target.value };
                  setForm({ ...form, notes: updated });
                }} rows={2} />
                {form.notes.length > 1 && (
                  <Button type="button" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => setForm({ ...form, notes: form.notes.filter((_, i) => i !== idx) })}>Remove</Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setForm({ ...form, notes: [...form.notes, { title: '', content: '' }] })}>Add Note</Button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Resources</label>
          <div className="space-y-2">
            {form.resources.map((res, idx) => (
              <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Input placeholder="Title" value={res.title} onChange={(e) => {
                  const updated = [...form.resources];
                  updated[idx] = { ...updated[idx], title: e.target.value };
                  setForm({ ...form, resources: updated });
                }} />
                <Input placeholder="Description" value={res.description} onChange={(e) => {
                  const updated = [...form.resources];
                  updated[idx] = { ...updated[idx], description: e.target.value };
                  setForm({ ...form, resources: updated });
                }} />
                <Input placeholder="URL" value={res.url} onChange={(e) => {
                  const updated = [...form.resources];
                  updated[idx] = { ...updated[idx], url: e.target.value };
                  setForm({ ...form, resources: updated });
                }} />
                <Input placeholder="Type (article/video/pdf)" value={res.type} onChange={(e) => {
                  const updated = [...form.resources];
                  updated[idx] = { ...updated[idx], type: e.target.value };
                  setForm({ ...form, resources: updated });
                }} />
                {form.resources.length > 1 && (
                  <Button type="button" variant="outline" className="col-span-2 md:col-span-4 text-red-600 hover:bg-red-50" onClick={() => setForm({ ...form, resources: form.resources.filter((_, i) => i !== idx) })}>Remove</Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setForm({ ...form, resources: [...form.resources, { title: '', description: '', url: '', type: 'article' }] })}>Add Resource</Button>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!form.title.trim()) return;
              setSubmitting(true);
              await onSubmit({
                title: form.title.trim(),
                content: form.content.trim() || undefined,
                duration: form.duration ? Number(form.duration) : undefined,
                type: form.type,
                mediaUrl: form.mediaUrl.trim() || undefined,
                notes: form.notes.filter(n => n.title.trim() || n.content.trim()).map(n => ({ title: n.title.trim(), content: n.content.trim() })),
                resources: form.resources.filter(r => r.title.trim() || r.url.trim()).map(r => ({ title: r.title.trim(), description: r.description.trim(), url: r.url.trim(), type: r.type.trim() })),
              });
              setSubmitting(false);
            }}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Lesson'}
          </Button>
        </div>
      </div>
    );
  }

  function ModuleForm({ onSubmit, onCancel }: { onSubmit: (payload: { title: string; description?: string; order: number; }) => void | Promise<void>, onCancel: () => void }) {
    const [form, setForm] = useState<{ title: string; description: string; order: string }>({
      title: '',
      description: '',
      order: String((course?.modules?.length || 0) + 1),
    });
    const [submitting, setSubmitting] = useState(false);
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Module title" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <Input value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} type="number" min={1} />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!form.title.trim()) return;
              setSubmitting(true);
              await onSubmit({
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                order: form.order ? Number(form.order) : ((course?.modules?.length || 0) + 1),
              });
              setSubmitting(false);
            }}
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Module'}
          </Button>
        </div>
      </div>
    );
  }

  if (courseLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h2 className="text-lg font-semibold text-gray-500">Course View</h2>
          <p className="mt-4 text-center text-gray-600">Loading course...</p>
        </main>
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="flex min-h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h2 className="text-lg font-semibold text-gray-500">Course View</h2>
          <p className="mt-4 text-center text-gray-600">{courseError || "Course not found."}</p>
        </main>
      </div>
    )
  }

  // Calculate total lessons count from modules
  const totalLessons = course.modules?.reduce((total: number, module: any) => {
    return total + (module.lessons?.length || 0);
  }, 0) || 0;

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-lg font-semibold text-gray-500">Course View</h2>
        </header>

        <section className="mb-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Course Statistics</h1>

          {statsLoading ? (
            <div className="text-center text-gray-500 mb-10">Loading statistics...</div>
          ) : statsError ? (
            <div className="text-center text-red-500 mb-10">{statsError}</div>
          ) : statistics ? (
            <>
          <div className="flex items-center justify-center gap-8 mb-10">
                <CourseStatisticItem label="Completion Rate" value={statistics.completionRate} />
                <CourseStatisticItem label="Avg Rating" value={statistics.avgRating} />
                <CourseStatisticItem label="In Progress" value={statistics.dropOffRate} isLast />
          </div>
          <div className="flex items-center justify-center gap-8 mb-10">
                <CourseStatisticItem label="Active Today" value={statistics.activeToday} />
                <CourseStatisticItem label="Avg completion time" value={statistics.avgCompletionTime} />
                <CourseStatisticItem label="Enrollments" value={statistics.enrollments} isLast />
          </div>
            </>
          ) : (
            <div className="text-center text-gray-500 mb-10">No statistics available.</div>
          )}

          <h1 className="text-3xl font-bold mb-6 text-center">Course Overview</h1>

          {course.thumbnailUrl ? (
            <div className="w-full h-[300px] rounded-lg mb-6 overflow-hidden">
              <img 
                src={course.thumbnailUrl} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
          <div className="w-full h-[300px] bg-gray-200 rounded-lg mb-6 flex items-center justify-center text-gray-500 text-xl font-semibold">
            Course Thumbnail Placeholder
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-4xl font-bold mb-2">
              {editingCourse ? (
                <Input
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-4xl font-bold border-0 p-0 h-auto"
                />
              ) : (
                course.title
              )}
            </h2>
            {!editingCourse && (
              <Button
                variant="outline"
                onClick={startEditingCourse}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Course
              </Button>
            )}
          </div>

          {editingCourse && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Level</label>
                    <Select value={editData.level || 'beginner'} onValueChange={(value) => setEditData({ ...editData, level: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    {categoriesLoading ? (
                      <div className="text-sm text-gray-500">Loading categories...</div>
                    ) : (
                      <Select value={editData.categoryId || ''} onValueChange={(value) => setEditData({ ...editData, categoryId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Search Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(editData.tags || []).map((tag: string, idx: number) => (
                      <span key={`${tag}-${idx}`} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          className="ml-1 text-blue-700 hover:text-blue-900"
                          onClick={() => setEditData({ ...editData, tags: (editData.tags || []).filter((t: string, i: number) => i !== idx) })}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a tag and press Enter"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = newTag.trim();
                          if (value && !(editData.tags || []).includes(value)) {
                            setEditData({ ...editData, tags: [ ...(editData.tags || []), value ] });
                          }
                          setNewTag('');
                        }
                      }}
                      onBlur={() => {
                        const value = newTag.trim();
                        if (value && !(editData.tags || []).includes(value)) {
                          setEditData({ ...editData, tags: [ ...(editData.tags || []), value ] });
                        }
                        setNewTag('');
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const value = newTag.trim();
                        if (value && !(editData.tags || []).includes(value)) {
                          setEditData({ ...editData, tags: [ ...(editData.tags || []), value ] });
                        }
                        setNewTag('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Badges</label>
                  {badgesLoading ? (
                    <div className="text-sm text-gray-500">Loading badges...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {badges.map((b: any) => {
                        const checked = (editData.badgeIds || []).includes(b.id);
                        return (
                          <label key={b.id} className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-pointer">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) => {
                                const current: string[] = editData.badgeIds || [];
                                setEditData({
                                  ...editData,
                                  badgeIds: val ? [...current, b.id] : current.filter((id) => id !== b.id),
                                })
                              }}
                            />
                            <span className="text-sm">{b.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Published</label>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded text-xs border ${editData.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                    onClick={() => setEditData({ ...editData, isPublished: !editData.isPublished })}
                  >
                    {editData.isPublished ? 'Yes' : 'No'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveCourse} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Course
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <span>{totalLessons} Lessons</span>
            <span className="mx-2">•</span>
            <span>{course.duration} minutes</span>
          </div>

          <h3 className="text-xl font-bold mb-2">Course Description</h3>
          <p className="text-muted-foreground mb-8">
            {editingCourse ? (
              <span className="whitespace-pre-wrap">{editData.description || ''}</span>
            ) : (
              <>
                {course.description}
                <Link href="#" className="text-blue-600 hover:underline ml-1">
                  Read more
                </Link>
              </>
            )}
          </p>

          <h3 className="text-xl font-bold mb-2">What you'll learn</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-8 space-y-1">
            {course.objectives?.map((objective: string, index: number) => (
              <li key={index}>{objective}</li>
            )) || <li>No learning objectives available.</li>}
          </ul>

          <h3 className="text-xl font-bold mb-2">Badges</h3>
          {editingCourse ? (
            <div className="flex flex-wrap gap-2 mb-8">
              {badges
                .filter((b: any) => (editData.badgeIds || []).includes(b.id))
                .map((b: any) => (
                  <span key={b.id} className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                    <Award className="h-3 w-3" />
                    {b.name}
                  </span>
                ))}
              {(editData.badgeIds || []).length === 0 && (
                <span className="text-sm text-gray-500">No badges selected.</span>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-8">
              {Array.isArray(course.badges) && course.badges.length > 0 ? (
                course.badges.map((b: any) => (
                  <span key={b.id || b.name} className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                    <Award className="h-3 w-3" />
                    {b.name || b}
                  </span>
                ))
              ) : Array.isArray(course.badgeIds) && course.badgeIds.length > 0 ? (
                badges
                  .filter((b: any) => course.badgeIds.includes(b.id))
                  .map((b: any) => (
                    <span key={b.id} className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                      <Award className="h-3 w-3" />
                      {b.name}
                    </span>
                  ))
              ) : (
                <span className="text-sm text-gray-500">No badges assigned.</span>
              )}
            </div>
          )}

          <h3 className="text-xl font-bold mb-4">Modules</h3>
          <Accordion type="single" collapsible className="w-full">
            {course.modules?.map((module: any) => (
              <AccordionItem key={module.id} value={module.id} className="border-b">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline flex justify-between items-start">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      {editingModuleId === module.id ? (
                        <Input
                          value={editData.title || ''}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="text-lg font-semibold border-0 p-0 h-auto bg-transparent"
                        />
                      ) : (
                        module.title
                      )}
                      {editingModuleId === module.id && (
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveModule(module.id);
                            }}
                            className="h-6 px-2 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEdit();
                            }}
                            className="h-6 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {editingModuleId !== module.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingModule(module);
                            }}
                            className="h-6 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteModule(module.id);
                            }}
                            className="h-6 px-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingModuleId === module.id ? (
                      <Textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Module description..."
                        className="text-sm text-gray-500 font-normal border-0 p-0 h-auto bg-transparent resize-none"
                        rows={2}
                      />
                    ) : (
                      module.description && (
                        <div className="text-sm text-gray-500 font-normal">{module.description}</div>
                      )
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-4 py-2 space-y-2">
                  <Accordion type="single" collapsible className="w-full">
                    {module.lessons?.map((lesson: any) => (
                      <AccordionItem key={lesson.id} value={lesson.id} className="border-b border-gray-100">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline flex justify-between items-start">
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              {editingLessonId === lesson.id ? (
                                <Input
                                  value={editData.title || ''}
                                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                  className="text-sm font-medium border-0 p-0 h-auto bg-transparent"
                                />
                              ) : (
                                lesson.title
                              )}
                              {editingLessonId === lesson.id && (
                                <div className="flex gap-1">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveLesson(module.id, lesson.id);
                                }}
                                    className="h-5 px-2 bg-green-600 hover:bg-green-700"
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelEdit();
                                    }}
                                    className="h-5 px-2"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              {editingLessonId !== lesson.id && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingLesson(lesson);
                                    }}
                                    className="h-5 px-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteLesson(module.id, lesson.id);
                                    }}
                                    className="h-5 px-2 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {editingLessonId === lesson.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  value={editData.duration || ''}
                                  onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                                  placeholder="Duration"
                                  className="text-xs text-gray-500 font-normal border-0 p-0 h-auto bg-transparent w-20"
                                />
                                <span className="text-xs text-gray-500">minutes</span>
                                <Select value={editData.type || 'video'} onValueChange={(value) => setEditData({ ...editData, type: value })}>
                                  <SelectTrigger className="h-5 w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="reading">Reading</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="doc">Doc</SelectItem>
                                    <SelectItem value="image">Image</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ) : (
                              lesson.duration && (
                                <div className="text-xs text-gray-500 font-normal">{lesson.duration} minutes</div>
                              )
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4 py-2 space-y-3">
                          {editingLessonId === lesson.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Content</label>
                                <Textarea
                                  value={editData.content || ''}
                                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                  rows={3}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Media URL</label>
                                <Input
                                  value={editData.mediaUrl || ''}
                                  onChange={(e) => setEditData({ ...editData, mediaUrl: e.target.value })}
                                  placeholder="https://example.com/media.mp4"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Notes</label>
                                  <div className="space-y-2">
                                    {(editData.notes || []).map((note: any, idx: number) => (
                                      <div key={idx} className="p-3 rounded border bg-white">
                                        <Input
                                          placeholder="Title"
                                          value={note.title || ''}
                                          onChange={(e) => {
                                            const updated = [...(editData.notes || [])];
                                            updated[idx] = { ...updated[idx], title: e.target.value };
                                            setEditData({ ...editData, notes: updated });
                                          }}
                                          className="mb-2"
                                        />
                                        <Textarea
                                          placeholder="Content"
                                          value={note.content || ''}
                                          onChange={(e) => {
                                            const updated = [...(editData.notes || [])];
                                            updated[idx] = { ...updated[idx], content: e.target.value };
                                            setEditData({ ...editData, notes: updated });
                                          }}
                                          rows={2}
                                        />
                                        <div className="flex justify-end mt-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                              const updated = (editData.notes || []).filter((_: any, i: number) => i !== idx);
                                              setEditData({ ...editData, notes: updated });
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setEditData({ ...editData, notes: [ ...(editData.notes || []), { title: '', content: '' } ] })}
                                    >
                                      Add Note
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Resources</label>
                                  <div className="space-y-2">
                                    {(editData.resources || []).map((res: any, idx: number) => (
                                      <div key={idx} className="p-3 rounded border bg-white">
                                        <Input
                                          placeholder="Title"
                                          value={res.title || ''}
                                          onChange={(e) => {
                                            const updated = [...(editData.resources || [])];
                                            updated[idx] = { ...updated[idx], title: e.target.value };
                                            setEditData({ ...editData, resources: updated });
                                          }}
                                          className="mb-2"
                                        />
                                        <Input
                                          placeholder="Description"
                                          value={res.description || ''}
                                          onChange={(e) => {
                                            const updated = [...(editData.resources || [])];
                                            updated[idx] = { ...updated[idx], description: e.target.value };
                                            setEditData({ ...editData, resources: updated });
                                          }}
                                          className="mb-2"
                                        />
                                        <Input
                                          placeholder="URL"
                                          value={res.url || ''}
                                          onChange={(e) => {
                                            const updated = [...(editData.resources || [])];
                                            updated[idx] = { ...updated[idx], url: e.target.value };
                                            setEditData({ ...editData, resources: updated });
                                          }}
                                        />
                                        <div className="flex justify-end mt-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                              const updated = (editData.resources || []).filter((_: any, i: number) => i !== idx);
                                              setEditData({ ...editData, resources: updated });
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setEditData({ ...editData, resources: [ ...(editData.resources || []), { title: '', description: '', url: '' } ] })}
                                    >
                                      Add Resource
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {lesson.content && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Content:</h4>
                                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{lesson.content}</div>
                                </div>
                              )}
                              {lesson.mediaUrl && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Media:</h4>
                                  <div className="text-sm text-gray-600">
                                    {lesson.type === 'video' ? (
                                      <video src={lesson.mediaUrl} controls className="max-w-full h-auto rounded" />
                                    ) : lesson.type === 'image' ? (
                                      <img src={lesson.mediaUrl} alt={lesson.title} className="max-w-full h-auto rounded" />
                                    ) : (
                                      <a href={lesson.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        View Media File
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                              {lesson.notes && lesson.notes.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h4>
                                  <div className="space-y-2">
                                    {lesson.notes.map((note: any, noteIndex: number) => (
                                      <div key={noteIndex} className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                        <div className="font-medium">{note.title}</div>
                                        <div className="mt-1">{note.content}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {lesson.resources && lesson.resources.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Resources:</h4>
                                  <div className="space-y-2">
                                    {lesson.resources.map((resource: any, resourceIndex: number) => (
                                      <div key={resourceIndex} className="text-sm text-gray-600">
                                        <div className="font-medium">{resource.title}</div>
                                        {resource.description && (
                                          <div className="text-gray-500">{resource.description}</div>
                                        )}
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                          {resource.url}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {lesson.transcript && lesson.transcript.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Transcript:</h4>
                                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                                    {lesson.transcript.map((line: any, transcriptIndex: number) => (
                                      <div key={transcriptIndex} className="mb-1">
                                        <span className="font-medium">{line.speaker ? `${line.speaker}:` : ''}</span> {line.text || line}
                    </div>
                  ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )) || <div className="text-gray-500">No lessons in this module.</div>}
                  </Accordion>
                 {/* Add Lesson Button */}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => openAddLesson(module.id)}
                      className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add Lesson
                    </Button>
                  </div>
                 {/* Quizzes Section */}
                 {module.quizzes && module.quizzes.length > 0 && (
                   <div className="mt-4">
                     <h4 className="text-base font-semibold text-purple-700 mb-2">Quizzes</h4>
                     <Accordion type="single" collapsible className="w-full">
                       {module.quizzes.map((quiz: any) => (
                         <AccordionItem key={quiz.id} value={quiz.id} className="border-b border-gray-100">
                           <AccordionTrigger className="text-sm font-medium hover:no-underline flex justify-between items-start">
                             <div className="flex flex-col items-start">
                               <div>{quiz.title}</div>
                               {quiz.duration !== undefined && (
                                 <div className="text-xs text-gray-500 font-normal">{quiz.duration} minutes</div>
                               )}
                               {quiz.unlockAfter !== undefined && (
                                 <div className="text-xs text-gray-500 font-normal">Unlock After: {quiz.unlockAfter} lessons</div>
                               )}
                             </div>
                           </AccordionTrigger>
                           <AccordionContent className="pl-4 py-2 space-y-3">
                             {quiz.questions && quiz.questions.length > 0 ? (
                               <div>
                                 <h5 className="text-sm font-semibold text-gray-700 mb-2">Questions:</h5>
                                 <ol className="list-decimal list-inside space-y-2">
                                   {quiz.questions.map((q: any, qidx: number) => (
                                     <li key={q.id || qidx}>
                                       <div className="font-medium">{q.prompt}</div>
                                       {q.sampleAnswer && (
                                         <div className="text-xs text-gray-500 mt-1">Sample Answer: {q.sampleAnswer}</div>
                                       )}
                                     </li>
                                   ))}
                                 </ol>
                               </div>
                             ) : <div className="text-gray-500">No questions in this quiz.</div>}
                           </AccordionContent>
                         </AccordionItem>
                       ))}
                     </Accordion>
                   </div>
                 )}
                 {/* Final Assessments Section (at course level, show after lessons/quizzes in first module only) */}
                 {module === course.modules[0] && course.finalAssessments && course.finalAssessments.length > 0 && (
                   <div className="mt-4">
                     <h4 className="text-base font-semibold text-green-700 mb-2">Final Assessments</h4>
                     <Accordion type="single" collapsible className="w-full">
                       {course.finalAssessments.map((fa: any) => (
                         <AccordionItem key={fa.id} value={fa.id} className="border-b border-gray-100">
                           <AccordionTrigger className="text-sm font-medium hover:no-underline flex justify-between items-start">
                             <div className="flex flex-col items-start">
                               <div>{fa.title}</div>
                               {fa.duration !== undefined && (
                                 <div className="text-xs text-gray-500 font-normal">{fa.duration} minutes</div>
                               )}
                               {fa.passingScore !== undefined && (
                                 <div className="text-xs text-gray-500 font-normal">Passing Score: {fa.passingScore}%</div>
                               )}
                             </div>
                           </AccordionTrigger>
                           <AccordionContent className="pl-4 py-2 space-y-3">
                             {fa.questions && fa.questions.length > 0 ? (
                               <div>
                                 <h5 className="text-sm font-semibold text-gray-700 mb-2">Questions:</h5>
                                 <ol className="list-decimal list-inside space-y-2">
                                   {fa.questions.map((q: any, qidx: number) => (
                                     <li key={q.id || qidx}>
                                       <div className="font-medium">{q.prompt}</div>
                                       {q.sampleAnswer && (
                                         <div className="text-xs text-gray-500 mt-1">Sample Answer: {q.sampleAnswer}</div>
                                       )}
                                     </li>
                                   ))}
                                 </ol>
                               </div>
                             ) : <div className="text-gray-500">No questions in this assessment.</div>}
                           </AccordionContent>
                         </AccordionItem>
                       ))}
                     </Accordion>
                   </div>
                 )}
                </AccordionContent>
              </AccordionItem>
            )) || <div className="text-gray-500">No modules available.</div>}
          </Accordion>

          <div className="mt-4">
            <Button variant="outline" onClick={openAddModule} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4" />
              Add Module
            </Button>
          </div>

          <div className="flex justify-center space-x-4 mt-10">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Unpublish Course</Button>
            <Link href={`/course-management/new-module?courseId=${course.id}`}>
              {" "}
              {/* Pass courseId for editing */}
                    <Button variant="outline" className="bg-transparent flex items-center justify-center gap-2">
                <Edit className="h-4 w-4" />
                <span>Edit Course</span>
              </Button>
            </Link>
          </div>
        </section>

        {showAddLessonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="absolute inset-0" onClick={() => { setShowAddLessonModal(false); setLessonModalModuleId(null); }} />
            <div className="relative w-full max-w-4xl rounded-xl shadow-lg z-10 bg-white max-h-[85vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Add Lesson</h3>
              </div>
              <div className="p-6 space-y-3">
                <LessonForm
                  onCancel={() => { setShowAddLessonModal(false); setLessonModalModuleId(null); }}
                  onSubmit={async (payload) => {
                    if (!lessonModalModuleId) return;
                    await handleCreateLesson(lessonModalModuleId, payload);
                    setShowAddLessonModal(false);
                    setLessonModalModuleId(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {showAddModuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="absolute inset-0" onClick={() => setShowAddModuleModal(false)} />
            <div className="relative w-full max-w-lg rounded-xl shadow-lg z-10 bg-white">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Add Module</h3>
              </div>
              <div className="p-6 space-y-3">
                <ModuleForm
                  onCancel={() => setShowAddModuleModal(false)}
                  onSubmit={async (payload) => {
                    await handleCreateModule(payload);
                    setShowAddModuleModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
