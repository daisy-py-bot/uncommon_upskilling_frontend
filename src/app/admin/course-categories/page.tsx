"use client"

import React, { useEffect, useState } from 'react';
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Edit, Trash, MoreHorizontal, FolderOpen, CheckCircle, XCircle } from "lucide-react"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { buildApiUrl } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function AddCategoryModal({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess?: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl('categories'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
          isActive,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Category created successfully!');
        setTimeout(() => {
          setSuccess('');
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setError(data.message || 'Failed to create category');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl shadow-lg z-10 bg-white">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">✕</button>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Add New Category</h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input 
                id="name" 
                placeholder="e.g., Technical Skills" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what this category represents..." 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditCategoryModal({ open, onClose, category, onSuccess }: { 
  open: boolean, 
  onClose: () => void, 
  category: Category | null, 
  onSuccess?: () => void 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setIsActive(category.isActive);
    }
  }, [category]);

  if (!open || !category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(`categories/${category.id}`), {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
          isActive,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Category updated successfully!');
        setTimeout(() => {
          setSuccess('');
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setError(data.message || 'Failed to update category');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl shadow-lg z-10 bg-white">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">✕</button>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Edit Category</h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input 
                id="edit-name" 
                placeholder="e.g., Technical Skills" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea 
                id="edit-description" 
                placeholder="Describe what this category represents..." 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Update Category'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CourseCategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl('categories/all'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(`categories/${categoryId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setCategories(categories.filter(category => category.id !== categoryId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Network error');
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleSeedCategories = async () => {
    if (!confirm('This will create default categories. Continue?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl('categories/seed'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Default categories seeded successfully!');
        fetchCategories(); // Refresh the list
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to seed categories');
      }
    } catch (error) {
      console.error('Error seeding categories:', error);
      alert('Network error');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading categories...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Course Categories Management</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">Create, edit and manage course categories</p>

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleSeedCategories}
                className="flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Seed Default
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-4 py-2" 
                onClick={() => setShowAddModal(true)}
              >
                <span className="flex items-center">New Category <Plus className="h-4 w-4 ml-2" /></span>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No categories found matching your search.' : 'No categories created yet.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FolderOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={category.description}>
                            {category.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {category.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={category.isActive ? 'text-green-600' : 'text-red-600'}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(category.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(category.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>

      <AddCategoryModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={fetchCategories}
      />

      <EditCategoryModal 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        category={selectedCategory}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
