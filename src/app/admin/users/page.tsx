"use client"

import React, { useEffect, useState } from 'react';
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, Plus, MoreHorizontal, ArrowLeft, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from '@/components/ui/label';
import { decodeJWT, buildApiUrl } from '@/lib/utils';
import { useRef } from 'react';

const ADMIN_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

function AdminRegisterModal({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess?: () => void }) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  if (!open) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const trimmedFirstname = firstname.trim();
    const trimmedLastname = lastname.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedFirstname || !trimmedLastname || !trimmedEmail || !trimmedPassword || !role) {
      setError('Please fill all fields (no leading/trailing spaces)');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(buildApiUrl('auth/bootstrap-super-admin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: trimmedFirstname,
          lastname: trimmedLastname,
          email: trimmedEmail,
          password: trimmedPassword,
          role,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Admin registered successfully!');
        setTimeout(() => {
          setSuccess('');
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } else {
        setError(data.message || 'Registration failed');
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
          <h2 className="text-2xl font-bold mb-2 text-center">Register New Admin</h2>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="firstname">First name</Label>
              <Input id="firstname" placeholder="Jane" required value={firstname} onChange={e => setFirstname(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastname">Last name</Label>
              <Input id="lastname" placeholder="Doe" required value={lastname} onChange={e => setLastname(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@company.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select id="role" className="border rounded px-3 py-2" value={role} onChange={e => setRole(e.target.value)} required>
                {ADMIN_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <Button type="submit" className="w-full bg-v0-purple hover:bg-v0-purple/90 text-white" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function UserProfileModal({ open, onClose, userId, userRole }: { open: boolean, onClose: () => void, userId: string | null, userRole: string | null }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setError('');
    let endpoint = '';
    if (userRole && (normalize(userRole) === 'admin' || normalize(userRole) === 'superadmin')) {
      endpoint = buildApiUrl(`admins/profile/${userId}`);
    } else {
      endpoint = buildApiUrl(`users/${userId}`);
    }
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user profile');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setError('Failed to fetch user profile'))
      .finally(() => setLoading(false));
  }, [open, userId, userRole]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl shadow-lg z-10 bg-white p-8">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>
        {loading ? <div className="text-center text-gray-500">Loading...</div> : error ? <div className="text-center text-red-500">{error}</div> : user ? (
          <div className="flex flex-col items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullname || user.firstname || user.name || 'User'} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                {user.fullname ? user.fullname[0] : (user.firstname ? user.firstname[0] : '?')}
              </div>
            )}
            <div className="text-lg font-semibold">{user.fullname || (user.firstname ? `${user.firstname} ${user.lastname}` : user.name)}</div>
            <div className="text-gray-600">{user.email}</div>
            {user.role && <div className="text-sm text-blue-700 bg-blue-100 rounded px-2 py-1 mt-1">{user.role}</div>}
            {user.status && <div className="text-xs text-gray-400 mt-1">Status: {user.status}</div>}
            {user.joinedDate && <div className="text-xs text-gray-400 mt-1">Joined: {user.joinedDate}</div>}
            {user.lastActive && <div className="text-xs text-gray-400 mt-1">Last Active: {user.lastActive}</div>}
            {user.tagline && <div className="text-sm text-gray-500 mt-2">{user.tagline}</div>}
          </div>
        ) : <div className="text-center text-gray-500">No user info available.</div>}
      </div>
    </div>
  );
}

// Utility to normalize role strings (case-insensitive, space-insensitive)
function normalize(str: string) {
  return str.toLowerCase().replace(/\s+|_+/g, '');
}

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const usersPerPage = 10;
  const totalPages = Math.ceil(users.length / usersPerPage);
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [promoteLoadingId, setPromoteLoadingId] = useState<string | null>(null);
  const [promoteMessage, setPromoteMessage] = useState('');
  const [showPromoteToast, setShowPromoteToast] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<string | null>(null);
  const [deactivateLoadingId, setDeactivateLoadingId] = useState<string | null>(null);
  const [deactivateMessage, setDeactivateMessage] = useState('');
  const [showDeactivateToast, setShowDeactivateToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, role: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  // Filtering logic
  const filteredUsers = users.filter((user) => {
    // Search by name
    const matchesName = user.fullname.toLowerCase().includes(searchTerm.toLowerCase());
    // Role filter (case-insensitive, space-insensitive)
    const matchesRole = selectedRole
      ? normalize(user.role) === normalize(selectedRole)
      : true;
    // Status filter
    const matchesStatus = selectedStatus ? user.status === selectedStatus : true;
    return matchesName && matchesRole && matchesStatus;
  });

  // Sort by joined date if selected
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!selectedDateRange) return 0;
    if (!a.joinedDate || !b.joinedDate) return 0;
    
    const dateA = new Date(a.joinedDate);
    const dateB = new Date(b.joinedDate);
    
    if (selectedDateRange === 'Most Recent') {
      return dateB.getTime() - dateA.getTime(); // Newest first
    } else if (selectedDateRange === 'Oldest') {
      return dateA.getTime() - dateB.getTime(); // Oldest first
    }
    return 0;
  });

  const totalFilteredPages = Math.ceil(sortedUsers.length / usersPerPage);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    setError('');
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      setError('No admin token found');
      setLoading(false);
      return;
    }
    
    fetch(buildApiUrl('admins/user-management'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(() => setError('Failed to fetch users'))
      .finally(() => setLoading(false));
      
    // Fetch current admin profile for role
    try {
      const decoded = decodeJWT(token);
      if (decoded?.id) {
        fetch(buildApiUrl(`admins/profile/${decoded.id}`), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.role) setCurrentUserRole(data.role);
          })
          .catch(() => {
            // Silently fail for profile fetch
            console.warn('Failed to fetch admin profile');
          });
      }
    } catch (error) {
      console.warn('Failed to decode admin token:', error);
    }
  }, []);

  useEffect(() => {
    if (promoteMessage) {
      setShowPromoteToast(true);
      const timer = setTimeout(() => {
        setShowPromoteToast(false);
        setPromoteMessage('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [promoteMessage]);

  useEffect(() => {
    if (deactivateMessage) {
      setShowDeactivateToast(true);
      const timer = setTimeout(() => {
        setShowDeactivateToast(false);
        setDeactivateMessage('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [deactivateMessage]);

  useEffect(() => {
    if (deleteMessage) {
      setShowDeleteToast(true);
      const timer = setTimeout(() => {
        setShowDeleteToast(false);
        setDeleteMessage('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [deleteMessage]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-lg font-semibold text-gray-500">User management</h2>
        </header>

        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Manage all users in one place. Control access, assign roles, monitor activity across you platform
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    Role <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => { setSelectedRole('Admin'); setCurrentPage(1); }}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setSelectedRole('Super Admin'); setCurrentPage(1); }}>Super Admin</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setSelectedRole('Student'); setCurrentPage(1); }}>Student</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setSelectedRole(''); setCurrentPage(1); }}>All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    Status <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => { setSelectedStatus('Active'); setCurrentPage(1); }}>Active</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setSelectedStatus('Inactive'); setCurrentPage(1); }}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setSelectedStatus(''); setCurrentPage(1); }}>All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    Date Joined<ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => { setSelectedDateRange('Most Recent'); setCurrentPage(1); }}>Most Recent</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setSelectedDateRange('Oldest'); setCurrentPage(1); }}>Oldest</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setSelectedDateRange(''); setCurrentPage(1); }}>Default</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-[#0747A1] hover:bg-[#05316e] text-white flex items-center justify-center" onClick={() => setShowRegisterModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Fullname</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined date</TableHead>
                      <TableHead>Last active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullname}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={`px-2 py-0.5 rounded-full text-xs font-normal ${
                              user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.joinedDate}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastActive ? user.lastActive : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedUserId(user.id); setSelectedUserRole(user.role); setShowUserProfileModal(true); }}>View</DropdownMenuItem>
                              {normalize(currentUserRole) === 'superadmin' && normalize(user.role) === 'admin' && (
                                <DropdownMenuItem
                                  disabled={promoteLoadingId === user.id}
                                  onClick={async () => {
                                    setPromoteLoadingId(user.id);
                                    setPromoteMessage('');
                                    try {
                                      const adminToken = localStorage.getItem('admin_token');
                                      const res = await fetch(buildApiUrl(`admins/change-role/${user.id}`), {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${adminToken}`
                                        },
                                        body: JSON.stringify({ role: 'super_admin' })
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        setPromoteMessage('User promoted to Super Admin!');
                                        // Update users state
                                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 'Super Admin' } : u));
                                      } else {
                                        setPromoteMessage(data.message || 'Failed to promote user.');
                                      }
                                    } catch {
                                      setPromoteMessage('Network error.');
                                    } finally {
                                      setPromoteLoadingId(null);
                                      setTimeout(() => setPromoteMessage(''), 2000);
                                    }
                                  }}
                                >
                                  {promoteLoadingId === user.id ? 'Promoting...' : 'Make Super Admin'}
                                </DropdownMenuItem>
                              )}
                              {((normalize(user.role) === 'admin' || normalize(user.role) === 'superadmin')
                                ? (user.active === false || user.status === 'Inactive' || user.status === 'INACTIVE')
                                : (user.status === 'Inactive' || user.status === 'INACTIVE')) ? (
                                <DropdownMenuItem
                                  disabled={deactivateLoadingId === user.id}
                                  onClick={async () => {
                                    setDeactivateLoadingId(user.id);
                                    setDeactivateMessage('');
                                    try {
                                      const adminToken = localStorage.getItem('admin_token');
                                      let endpoint = '';
                                      if (normalize(user.role) === 'admin' || normalize(user.role) === 'superadmin') {
                                        endpoint = buildApiUrl(`admins/reactivate-admin/${user.id}`);
                                      } else {
                                        endpoint = buildApiUrl(`admins/reactivate-user/${user.id}`);
                                      }
                                      const res = await fetch(endpoint, {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${adminToken}`
                                        }
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        setDeactivateMessage('User reactivated!');
                                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Active', active: true } : u));
                                      } else {
                                        setDeactivateMessage(data.message || 'Failed to reactivate user.');
                                      }
                                    } catch {
                                      setDeactivateMessage('Network error.');
                                    } finally {
                                      setDeactivateLoadingId(null);
                                    }
                                  }}
                                >
                                  {deactivateLoadingId === user.id ? 'Reactivating...' : 'Reactivate'}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled={deactivateLoadingId === user.id}
                                  onClick={async () => {
                                    setDeactivateLoadingId(user.id);
                                    setDeactivateMessage('');
                                    try {
                                      const adminToken = localStorage.getItem('admin_token');
                                      let endpoint = '';
                                      if (normalize(user.role) === 'admin' || normalize(user.role) === 'superadmin') {
                                        endpoint = buildApiUrl(`admins/deactivate-admin/${user.id}`);
                                      } else {
                                        endpoint = buildApiUrl(`admins/deactivate-user/${user.id}`);
                                      }
                                      const res = await fetch(endpoint, {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${adminToken}`
                                        }
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        setDeactivateMessage('User deactivated!');
                                        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Inactive', active: false } : u));
                                      } else {
                                        setDeactivateMessage(data.message || 'Failed to deactivate user.');
                                      }
                                    } catch {
                                      setDeactivateMessage('Network error.');
                                    } finally {
                                      setDeactivateLoadingId(null);
                                    }
                                  }}
                                >
                                  {deactivateLoadingId === user.id ? 'Deactivating...' : 'Deactivate'}
                                </DropdownMenuItem>
                              )}
                              {normalize(currentUserRole) === 'superadmin' && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setDeleteTarget({ id: user.id, role: user.role });
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <div className="flex items-center justify-between p-4 border-t">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                className="flex items-center justify-center gap-2"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ArrowLeft className="h-4 w-5" />
                <span>Previous</span>
              </Button>
              <div className="flex items-center gap-2">
                Page {currentPage} of {totalFilteredPages}
              </div>
              <Button
                variant="outline"
                disabled={currentPage === totalFilteredPages || filteredUsers.length === 0}
                className="flex items-center justify-center gap-2"
                onClick={() => setCurrentPage((p) => Math.min(totalFilteredPages, p + 1))}
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-5" />
              </Button>
            </div>
          </Card>
        </section>
      </main>
      <AdminRegisterModal open={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      <UserProfileModal open={showUserProfileModal} onClose={() => setShowUserProfileModal(false)} userId={selectedUserId} userRole={selectedUserRole} />
      {/* Promote Toast Popup */}
      {showPromoteToast && promoteMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {promoteMessage}
        </div>
      )}
      {/* Deactivate/Reactivate Toast Popup */}
      {showDeactivateToast && deactivateMessage && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {deactivateMessage}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md rounded-xl shadow-lg z-10 bg-white p-8">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowDeleteModal(false)} aria-label="Close">✕</button>
            <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Confirm Delete</h2>
            <p className="text-center mb-6">Are you sure you want to delete this {normalize(deleteTarget.role)}? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteMessage('');
                  try {
                    const adminToken = localStorage.getItem('admin_token');
                    let endpoint = '';
                    if (normalize(deleteTarget.role) === 'admin' || normalize(deleteTarget.role) === 'superadmin') {
                      endpoint = buildApiUrl(`admins/${deleteTarget.id}`);
                    } else {
                      endpoint = buildApiUrl(`users/${deleteTarget.id}`);
                    }
                    const res = await fetch(endpoint, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${adminToken}`
                      }
                    });
                    if (res.ok) {
                      setDeleteMessage('User deleted successfully!');
                      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
                      setShowDeleteModal(false);
                    } else {
                      const data = await res.json();
                      setDeleteMessage(data.message || 'Failed to delete user.');
                    }
                  } catch {
                    setDeleteMessage('Network error.');
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Toast Popup */}
      {showDeleteToast && deleteMessage && (
        <div className="fixed top-32 right-6 z-50 bg-red-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {deleteMessage}
        </div>
      )}
    </div>
  )
}
