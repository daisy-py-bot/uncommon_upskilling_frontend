'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Home,
  Users,
  GraduationCap,
  MessageCircle,
  User,
  Plus,
  FileText,
  CheckCircle,
  TrendingUp,
  Eye,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AdminSidebar from '@/components/AdminSidebar'
import { useEffect, useState } from 'react';
import { decodeJWT, buildApiUrl } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

type DashboardCardProps = {
  title: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
};

// Custom component for Dashboard Cards
function DashboardCard({ title, value, change, icon: Icon }: DashboardCardProps) {
  let badgeColor = "bg-gray-200 text-gray-700";
  if (change.includes("-")) badgeColor = "bg-red-100 text-red-600";
  else if (change.includes("+")) badgeColor = "bg-green-100 text-green-600";
  return (
    <Card className="flex-1 min-w-[280px] border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${badgeColor}`}>{change}</span>
      </CardContent>
    </Card>
  )
}

type RecentActivityItemProps = {
  name: string;
  avatar?: string;
  type: string;
  time: string;
  role?: string;
};

// Custom component for Recent Activity Items
function RecentActivityItem({ name, avatar, type, time, role, onView }: RecentActivityItemProps & { onView?: () => void }) {
  const typeColor = type === "signup" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
  // Format time as "time ago"
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-3">
        <Avatar className="h-9 w-9">
          {avatar ? (
            <img src={avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <AvatarFallback>
              {name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium">
            {name}
            {role && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${role === 'admin' || role === 'super_admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {role === 'super_admin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Badge className={`${typeColor} px-2 py-0.5 rounded-full text-xs font-normal`}>{type}</Badge>
            <span>{getTimeAgo(time)}</span>
          </div>
        </div>
      </div>
      <Eye className="h-5 w-5 text-gray-400 cursor-pointer" onClick={onView} />
    </div>
  )
}

function UserInfoModal({ open, onClose, userId, userInfo }: { open: boolean, onClose: () => void, userId?: string, userInfo?: any }) {
  const [user, setUser] = useState<any>(userInfo || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    if (userInfo) { setUser(userInfo); return; }
    if (!userId) return;
    setLoading(true);
    setError('');
          fetch(buildApiUrl(`users/${userId}`))
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setError('Failed to fetch user info'))
      .finally(() => setLoading(false));
  }, [open, userId, userInfo]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl shadow-lg z-10 bg-white p-8">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="text-2xl font-bold mb-4 text-center">User Information</h2>
        {loading ? <div className="text-center text-gray-500">Loading...</div> : error ? <div className="text-center text-red-500">{error}</div> : user ? (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.firstname || user.name || 'User'} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <AvatarFallback>{user.firstname?.[0] || user.name?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            <div className="text-lg font-semibold">{user.firstname ? `${user.firstname} ${user.lastname}` : user.name}</div>
            <div className="text-gray-600">{user.email}</div>
            {user.role && <div className="text-sm text-blue-700 bg-blue-100 rounded px-2 py-1 mt-1">{user.role === 'super_admin' ? 'Super Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>}
            {user.tagline && <div className="text-sm text-gray-500 mt-2">{user.tagline}</div>}
            {user.status && <div className="text-xs text-gray-400 mt-1">Status: {user.status}</div>}
          </div>
        ) : <div className="text-center text-gray-500">No user info available.</div>}
      </div>
    </div>
  );
}

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
      const res = await fetch(buildApiUrl('auth/admin/register'), {
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

export default function Dashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [visibleActivities, setVisibleActivities] = useState<number>(5);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [selectedUserInfo, setSelectedUserInfo] = useState<any>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const adminInfo = decodeJWT(token);
    if (!adminInfo?.id) {
      setError('Missing admin information.');
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(buildApiUrl(`admins/profile/${adminInfo.id}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch admin profile.');
          return res.json();
        }),
      fetch(buildApiUrl('admins/dashboard-stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch dashboard stats.');
          return res.json();
        }),
      fetch(buildApiUrl('activity-logs/recent'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch activity logs.');
          return res.json();
        })
    ])
      .then(([adminData, statsData, activityData]) => {
        setAdmin(adminData);
        setStats(statsData);
        setActivityLogs(activityData);
      })
      .catch(() => setError('Failed to fetch admin profile, stats, or activity logs.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h2 className="text-lg font-semibold text-gray-500">Admin dashboard</h2>
        </header>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {admin?.avatar ? (
                <Avatar className="h-14 w-14">
                  <img src={admin.avatar} alt={admin.firstname || 'Admin'} className="h-14 w-14 rounded-full object-cover" />
                </Avatar>
              ) : (
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{admin?.firstname?.[0] || '?'}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-1">{admin ? `Welcome back, ${admin.firstname} ${admin.lastname}` : 'Welcome back'}</h1>
                <p className="text-sm text-muted-foreground">
                  {admin?.role}
                  {admin?.role && admin?.lastLogin && <span className="mx-2">&bull;</span>}
                  {admin?.lastLogin && `Last Login: ${new Date(admin.lastLogin).toLocaleString()}`}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button className="bg-[#0747A1] hover:bg-[#05316e] text-white flex items-center justify-center" onClick={() => setShowRegisterModal(true)}>
                <User className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
              <Button 
                className="bg-[#0747A1] hover:bg-[#05316e] text-white flex items-center justify-center"
                onClick={() => router.push('/admin/course-management/new-course')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Course
              </Button>
            </div>
          </div>
          <Separator className="my-6" />
          {loading && <div className="text-gray-500">Loading admin profile...</div>}
          {error && <div className="text-red-500">{error}</div>}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat: any, idx: number) => {
            let icon = Users;
            if (stat.title.toLowerCase().includes('signup')) icon = Plus;
            else if (stat.title.toLowerCase().includes('certificate')) icon = FileText;
            else if (stat.title.toLowerCase().includes('course') && stat.title.toLowerCase().includes('completion')) icon = TrendingUp;
            else if (stat.title.toLowerCase().includes('course')) icon = GraduationCap;
            else if (stat.title.toLowerCase().includes('enroll')) icon = CheckCircle;
            return (
              <DashboardCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={icon}
              />
            );
          })}
        </section>

        <section>
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">Latest platform activities and user interactions</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {activityLogs.slice(0, visibleActivities).map((log: any, idx: number) => (
                <div key={idx}>
                  <RecentActivityItem
                    name={log.name}
                    avatar={log.avatar}
                    type={log.type}
                    time={log.time}
                    role={log.role}
                    onView={() => {
                      setSelectedUserId(log.userId);
                      setSelectedUserInfo(null); // Always fetch fresh data
                      setShowUserModal(true);
                    }}
                  />
                  {idx < Math.min(visibleActivities, activityLogs.length) - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
            
            {activityLogs.length > visibleActivities && (
              <div className="p-6 pt-0 flex justify-center">
                <Button variant="outline" className="w-full max-w-xs bg-transparent" onClick={() => setVisibleActivities(v => v + 5)}>
                  View more
                </Button>
              </div>
            )}
            {visibleActivities > 5 && (
              <div className="p-6 pt-0 flex justify-center">
                <Button variant="outline" className="w-full max-w-xs bg-transparent" onClick={() => setVisibleActivities(v => Math.max(5, v - 5))}>
                  View less
                </Button>
              </div>
            )}
          </Card>
        </section>
      </main>
      <AdminRegisterModal open={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      <UserInfoModal open={showUserModal} onClose={() => setShowUserModal(false)} userId={selectedUserId} userInfo={selectedUserInfo} />
    </div>
  )
}