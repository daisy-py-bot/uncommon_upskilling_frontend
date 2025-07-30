"use client"

import type React from "react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { File, Trash, ImageIcon, Video, FileText, Plus, Minus, X } from "lucide-react" // Import X icon for delete
import { buildApiUrl } from "@/lib/utils"
import { supabase } from '@/lib/superbase'

interface LessonBlockProps {
  lessonNumber: number;
  lesson: any;
  onChange: (updatedLesson: any) => void;
  onDelete: () => void;
}

export function LessonBlock({ lessonNumber, lesson, onChange, onDelete }: LessonBlockProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Upload file to Supabase and return the URL
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `lesson-media/${fileName}`

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (error) throw error

    const { data: publicUrl } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return publicUrl.publicUrl
  }

  // Handle URL input submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const url = urlInput.trim();
    
    // Determine file type from URL
    let fileType = 'other';
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) fileType = 'image';
    else if (url.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) fileType = 'video';
    else if (url.match(/\.pdf$/i)) fileType = 'pdf';
    else if (url.match(/\.(doc|docx)$/i)) fileType = 'doc';

    // Update lesson with URL
    onChange({
      ...lesson,
      fileName: `External Media (${fileType})`,
      fileSize: 'External',
      fileType,
      type: fileType === 'other' ? (lesson.type || 'video') : fileType,
      filePreviewUrl: url,
      mediaUrl: url,
      file: null,
    });

    setUrlInput('');
    setShowUrlInput(false);
  };

  // Controlled fields from parent
  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...lesson, [field]: value });
  };

  // Media fields with file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Create temporary blob URL for immediate preview
      const tempUrl = URL.createObjectURL(file);
      let fileType = 'other';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type.startsWith('video/')) fileType = 'video';
      else if (file.type === 'application/pdf') fileType = 'pdf';
      else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') fileType = 'doc';
      
      // Update lesson with temporary preview
      onChange({
        ...lesson,
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(1) + 'MB',
        fileType,
        type: fileType === 'other' ? (lesson.type || 'video') : fileType,
        filePreviewUrl: tempUrl,
        file: file, // Store the actual file for upload
      });

      // Upload file to backend
      try {
        setUploading(true);
        const uploadedUrl = await uploadFile(file);
        
        // Update lesson with the actual uploaded URL
        onChange({
          ...lesson,
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(1) + 'MB',
          fileType,
          type: fileType === 'other' ? (lesson.type || 'video') : fileType,
          filePreviewUrl: uploadedUrl, // Use the uploaded URL instead of blob URL
          mediaUrl: uploadedUrl, // Store the actual media URL
          file: null, // Clear the file object
        });
        
        // Clean up the temporary blob URL
        URL.revokeObjectURL(tempUrl);
      } catch (error: any) {
        console.error('Upload failed:', error);
        // Revert to no file if upload fails
        onChange({
          ...lesson,
          fileName: null,
          fileSize: null,
          fileType: null,
          filePreviewUrl: null,
          mediaUrl: null,
          file: null,
        });
        URL.revokeObjectURL(tempUrl);
        alert(`Upload failed: ${error.message}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteMedia = () => {
    if (lesson.filePreviewUrl) {
      URL.revokeObjectURL(lesson.filePreviewUrl);
    }
    onChange({
      ...lesson,
      fileName: null,
      fileSize: null,
      fileType: null,
      filePreviewUrl: null,
    });
  };

  const renderMediaPreview = () => {
    if (!lesson.filePreviewUrl) {
      return (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      );
    }
    switch (lesson.fileType) {
      case 'image':
        return (
          <img
            src={lesson.filePreviewUrl || "/placeholder.svg"}
            alt="Media Preview"
            className="max-h-full max-w-full object-contain"
          />
        );
      case 'video':
        return (
          <video controls src={lesson.filePreviewUrl} className="max-h-full max-w-full object-contain">
            Your browser does not support the video tag.
          </video>
        );
      case 'pdf':
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
            <FileText className="h-16 w-16 mb-2" />
            <p>PDF Preview (not directly supported in browser)</p>
            <p className="text-sm">{lesson.fileName}</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
            <File className="h-16 w-16 mb-2" />
            <p>File Preview</p>
            <p className="text-sm">{lesson.fileName}</p>
          </div>
        );
    }
  };

  // Additional resources
  const handleAddResource = () => {
    onChange({ ...lesson, additionalResources: [...(lesson.additionalResources || [{ title: '', link: '' }]), { title: '', link: '' }] });
  };
  const handleRemoveResource = (index: number) => {
    onChange({ ...lesson, additionalResources: (lesson.additionalResources || []).filter((_: any, i: number) => i !== index) });
  };
  const handleResourceChange = (index: number, field: 'title' | 'link', value: string) => {
    const newResources = [...(lesson.additionalResources || [{ title: '', link: '' }])];
    newResources[index] = { ...newResources[index], [field]: value };
    onChange({ ...lesson, additionalResources: newResources });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Lesson {lessonNumber}</CardTitle>
        <Button variant="outline"  onClick={onDelete} className="text-red-500 hover:bg-red-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Delete Lesson</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Lesson Details */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <label htmlFor={`lesson-title-${lessonNumber}`} className="text-sm font-medium">
                Lesson Title
              </label>
              <Input
                id={`lesson-title-${lessonNumber}`}
                placeholder="Enter lesson title"
                className="w-full"
                value={lesson.title || ''}
                onChange={e => handleFieldChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={`lesson-type-${lessonNumber}`} className="text-sm font-medium">
                Lesson Type
              </label>
              <select
                id={`lesson-type-${lessonNumber}`}
                className="w-full border rounded px-2 py-1"
                value={lesson.type || 'video'}
                onChange={e => handleFieldChange('type', e.target.value)}
              >
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor={`lesson-notes-${lessonNumber}`} className="text-sm font-medium">
                Lesson Notes
              </label>
              <Textarea
                id={`lesson-notes-${lessonNumber}`}
                placeholder="Add detailed notes for this lesson."
                className="min-h-[100px] w-full"
                value={lesson.notes || ''}
                onChange={e => handleFieldChange('notes', e.target.value)}
              />
            </div>
            {/* Additional Resources Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Resources</label>
              {lesson.additionalResources?.map((resource: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Resource Title"
                    value={resource.title}
                    onChange={(e) => handleResourceChange(index, "title", e.target.value)}
                    className="flex-1 w-full"
                  />
                  <Input
                    placeholder="Resource Link (URL)"
                    value={resource.link}
                    onChange={(e) => handleResourceChange(index, "link", e.target.value)}
                    className="flex-1 w-full"
                  />
                  {lesson.additionalResources?.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveResource(index)}
                      className="text-red-500 hover:bg-red-100"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Remove resource</span>
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={handleAddResource} className="w-full mt-2 bg-transparent flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Resource</span>
              </Button>
            </div>
            <div className="space-y-2">
              <label htmlFor={`lesson-duration-${lessonNumber}`} className="text-sm font-medium">
                Lesson Duration (minutes)
              </label>
              <Input
                id={`lesson-duration-${lessonNumber}`}
                type="number"
                placeholder="e.g., 30"
                min="0"
                className="w-full"
                value={lesson.duration || ''}
                onChange={e => handleFieldChange('duration', e.target.value)}
              />
            </div>
          </div>
          {/* Right: Lesson Media */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="space-y-2 w-full">
              <h3 className="text-base font-semibold">Lesson Media</h3>
              <p className="text-sm text-muted-foreground">
                Add your course media below. This could be a PDF, video, or image.
              </p>
              {lesson.fileName ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg h-[350px] text-center relative overflow-hidden w-full">
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      {renderMediaPreview()}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/80 backdrop-blur-sm p-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {lesson.fileType === "image" && <ImageIcon className="h-4 w-4 text-gray-600" />}
                          {lesson.fileType === "video" && <Video className="h-4 w-4 text-gray-600" />}
                          {lesson.fileType === "pdf" && <FileText className="h-4 w-4 text-gray-600" />}
                          {lesson.fileType === "other" && <File className="h-4 w-4 text-gray-600" />}
                          <div>
                            <p className="font-medium text-sm">{lesson.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.fileSize === 'External' ? 'External URL' : lesson.fileSize}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" onClick={handleDeleteMedia} className="text-red-500 hover:bg-red-100">
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete Media</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg h-[350px] text-center w-full">
                  {showUrlInput ? (
                    <div className="w-full max-w-md">
                      <form onSubmit={handleUrlSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Media URL</label>
                          <Input
                            type="url"
                            placeholder="https://example.com/media.mp4"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="w-full"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            Add URL
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowUrlInput(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drop your media here, or{" "}
                        <label htmlFor={`file-upload-${lessonNumber}`} className="text-blue-600 hover:underline cursor-pointer">
                          click to browse
                        </label>
                        , or{" "}
                        <button 
                          type="button"
                          onClick={() => setShowUrlInput(true)}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          paste a URL
                        </button>
                        . Supported formats: .png, .jpg, .mp4, .pdf, up to 5MB.
                      </p>
                      <Input id={`file-upload-${lessonNumber}`} type="file" className="hidden" onChange={handleFileChange} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
