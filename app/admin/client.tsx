"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
    LogOut, 
    Users, 
    Code2, 
    Shield, 
    Activity, 
    Settings,
    ChevronRight,
    Trash2,
    Home
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    image: string | null;
    _count?: {
        snippets: number;
    };
}

interface Stats {
    totalUsers: number;
    totalSnippets: number;
    admins: number;
    recentUsers: number;
}

interface AdminUser {
    name?: string | null;
    email?: string | null;
    role?: string;
    image?: string | null;
}

export function AdminDashboardClient({ user }: { user: AdminUser }) {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalSnippets: 0, admins: 0, recentUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setStats(data.stats || { totalUsers: 0, totalSnippets: 0, admins: 0, recentUsers: 0 });
            }
        } catch (e) {
            console.error('Failed to fetch admin data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (e) {
            console.error('Failed to update role:', e);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (e) {
            console.error('Failed to delete user:', e);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Navigation */}
            <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="font-bold text-xl tracking-tighter flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        ADMIN PANEL
                    </div>
                    <span className="text-xs text-neutral-600">|</span>
                    <Link href="/dashboard" className="text-neutral-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-white">
                            {user.name || "Admin"}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                            {user.email}
                            <span className="bg-red-500 text-white text-[10px] px-1 rounded font-bold">ADMIN</span>
                        </span>
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => signOut()} 
                        className="border-neutral-800 hover:bg-neutral-900 text-white"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-[calc(100vh-56px)] border-r border-neutral-800 bg-neutral-950/50 p-4">
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                                activeTab === 'overview' 
                                    ? 'bg-white text-black' 
                                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                            }`}
                        >
                            <Activity className="w-5 h-5" />
                            <span className="font-medium">Overview</span>
                            <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                                activeTab === 'users' 
                                    ? 'bg-white text-black' 
                                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="font-medium">Users</span>
                            <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                                activeTab === 'settings' 
                                    ? 'bg-white text-black' 
                                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Settings</span>
                            <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                                        <p className="text-neutral-500 mt-1">Monitor your platform&apos;s activity and statistics</p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-neutral-500 text-sm">Total Users</p>
                                                    <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-neutral-500 text-sm">Total Snippets</p>
                                                    <p className="text-3xl font-bold mt-1">{stats.totalSnippets}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                                    <Code2 className="w-6 h-6 text-green-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-neutral-500 text-sm">Admins</p>
                                                    <p className="text-3xl font-bold mt-1">{stats.admins}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                                    <Shield className="w-6 h-6 text-red-500" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-neutral-500 text-sm">New This Week</p>
                                                    <p className="text-3xl font-bold mt-1">{stats.recentUsers}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                                    <Activity className="w-6 h-6 text-yellow-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Users Preview */}
                                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
                                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                                            <h2 className="font-semibold text-lg">Recent Users</h2>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setActiveTab('users')}
                                                className="text-neutral-400 hover:text-white"
                                            >
                                                View All <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                        <div className="divide-y divide-neutral-800">
                                            {users.slice(0, 5).map((u) => (
                                                <div key={u.id} className="p-4 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                                                        {u.image ? (
                                                            <Image src={u.image} alt={u.name || ''} width={40} height={40} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Users className="w-5 h-5 text-neutral-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{u.name || 'Unknown'}</p>
                                                        <p className="text-sm text-neutral-500">{u.email}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                                                        u.role === 'ADMIN' 
                                                            ? 'bg-red-500/20 text-red-400' 
                                                            : 'bg-neutral-800 text-neutral-400'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </div>
                                            ))}
                                            {users.length === 0 && (
                                                <div className="p-8 text-center text-neutral-500">
                                                    No users found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                                        <p className="text-neutral-500 mt-1">Manage all registered users on the platform</p>
                                    </div>

                                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-neutral-800 bg-neutral-900/50">
                                                    <th className="text-left p-4 text-sm font-medium text-neutral-400">User</th>
                                                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Email</th>
                                                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Role</th>
                                                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Snippets</th>
                                                    <th className="text-right p-4 text-sm font-medium text-neutral-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800">
                                                {users.map((u) => (
                                                    <tr key={u.id} className="hover:bg-neutral-800/50 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                                                                    {u.image ? (
                                                                        <Image src={u.image} alt={u.name || ''} width={32} height={32} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Users className="w-4 h-4 text-neutral-500" />
                                                                    )}
                                                                </div>
                                                                <span className="font-medium">{u.name || 'Unknown'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-neutral-400">{u.email}</td>
                                                        <td className="p-4">
                                                            <select
                                                                value={u.role}
                                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                                disabled={u.email === 'abhiisingh240@gmail.com'}
                                                                className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm disabled:opacity-50"
                                                            >
                                                                <option value="USER">USER</option>
                                                                <option value="ADMIN">ADMIN</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-neutral-400">{u._count?.snippets || 0}</td>
                                                        <td className="p-4 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                disabled={u.email === 'abhiisingh240@gmail.com'}
                                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {users.length === 0 && (
                                            <div className="p-8 text-center text-neutral-500">
                                                No users found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                                        <p className="text-neutral-500 mt-1">Configure platform settings</p>
                                    </div>

                                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
                                        <div>
                                            <h3 className="font-semibold mb-2">Admin Email</h3>
                                            <p className="text-sm text-neutral-500 mb-3">
                                                Users with this email will automatically be assigned admin role on signup.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-neutral-800 px-3 py-2 rounded text-sm">
                                                    abhiisingh240@gmail.com
                                                </code>
                                                <span className="text-xs text-green-500">✓ Primary Admin</span>
                                            </div>
                                        </div>

                                        <hr className="border-neutral-800" />

                                        <div>
                                            <h3 className="font-semibold mb-2">Authentication Provider</h3>
                                            <p className="text-sm text-neutral-500 mb-3">
                                                Current authentication method configured for the platform.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium">Google OAuth 2.0</p>
                                                    <p className="text-xs text-neutral-500">Configured via environment variables</p>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-neutral-800" />

                                        <div>
                                            <h3 className="font-semibold mb-2">Database</h3>
                                            <p className="text-sm text-neutral-500 mb-3">
                                                PostgreSQL database hosted on Neon.
                                            </p>
                                            <div className="bg-neutral-800 px-3 py-2 rounded text-sm text-green-400 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                Connected
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
