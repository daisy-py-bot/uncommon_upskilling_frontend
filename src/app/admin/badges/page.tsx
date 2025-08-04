"use client"

import React, { useEffect, useState } from 'react';
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Edit, Trash, MoreHorizontal, Award } from "lucide-react"
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { buildApiUrl } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  createdAt: string;
}

function AddBadgeModal({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess?: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
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
    const trimmedIconUrl = iconUrl.trim();

    if (!trimmedName || !trimmedDescription) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl('badges'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
          iconUrl: trimmedIconUrl || undefined,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Badge created successfully!');
        setTimeout(() => {
          setSuccess('');
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setError(data.message || 'Failed to create badge');
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
          <h2 className="text-2xl font-bold mb-2 text-center">Add New Badge</h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Badge Name *</Label>
              <Input 
                id="name" 
                placeholder="e.g., Course Completion" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what this badge represents..." 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iconUrl">Icon URL (optional)</Label>
              <Input 
                id="iconUrl" 
                placeholder="https://example.com/icon.png" 
                value={iconUrl} 
                onChange={e => setIconUrl(e.target.value)} 
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Badge'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditBadgeModal({ open, onClose, badge, onSuccess }: { 
  open: boolean, 
  onClose: () => void, 
  badge: Badge | null, 
  onSuccess?: () => void 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (badge) {
      setName(badge.name);
      setDescription(badge.description);
      setIconUrl(badge.iconUrl || '');
    }
  }, [badge]);

  if (!open || !badge) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedIconUrl = iconUrl.trim();

    if (!trimmedName || !trimmedDescription) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(`admin/badges/${badge.id}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmedName,
          description: trimmedDescription,
          iconUrl: trimmedIconUrl || undefined,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Badge updated successfully!');
        setTimeout(() => {
          setSuccess('');
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setError(data.message || 'Failed to update badge');
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
          <h2 className="text-2xl font-bold mb-2 text-center">Edit Badge</h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Badge Name *</Label>
              <Input 
                id="edit-name" 
                placeholder="e.g., Course Completion" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea 
                id="edit-description" 
                placeholder="Describe what this badge represents..." 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-iconUrl">Icon URL (optional)</Label>
              <Input 
                id="edit-iconUrl" 
                placeholder="https://example.com/icon.png" 
                value={iconUrl} 
                onChange={e => setIconUrl(e.target.value)} 
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Update Badge'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BadgesManagement() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl('badges'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setBadges(data);
      } else {
        console.error('Failed to fetch badges');
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(buildApiUrl(`admin/badges/${badgeId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setBadges(badges.filter(badge => badge.id !== badgeId));
      } else {
        alert('Failed to delete badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Network error');
    }
  };

  const handleEditBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowEditModal(true);
  };

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading badges...</div>
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
          <h1 className="text-3xl font-bold mb-2 text-center">Badge Management</h1>
          <p className="text-sm text-muted-foreground mb-6 text-center">Create, edit and manage platform badges</p>

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search badges..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-4 py-2" 
              onClick={() => setShowAddModal(true)}
            >
              <span className="flex items-center">New Badge <Plus className="h-4 w-4 ml-2" /></span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Badge</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Icon URL</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBadges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No badges found matching your search.' : 'No badges created yet.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBadges.map((badge) => (
                      <TableRow key={badge.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Award className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{badge.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={badge.description}>
                            {badge.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={badge.iconUrl}>
                            {badge.iconUrl || '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(badge.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditBadge(badge)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBadge(badge.id)}
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

      <AddBadgeModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={fetchBadges}
      />

      <EditBadgeModal 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        badge={selectedBadge}
        onSuccess={fetchBadges}
      />
    </div>
  );
}
