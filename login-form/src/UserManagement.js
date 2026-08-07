import React, { useState, useEffect } from "react";
import { FiSearch, FiTrash2, FiEye, FiCheck, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import userIcon from "./assets/user_icon.png";
import AdminSidebar from "./AdminSidebar";

const BASE_URL = "http://13.233.96.62:30080";

const UserManagement = () => {
    // State Management
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Filter States
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        admins: 0,
        newThisMonth: 0
    });

    const currentUser = useSelector((state) => state.auth.user);
    const [allUsers, setAllUsers] = useState([]); // Store all users from API

    // Fetch users from API on mount
    useEffect(() => {
        fetchUsersFromAPI();
    }, []);

    // Apply filters whenever they change
    useEffect(() => {
        applyFilters();
    }, [allUsers, search, roleFilter, statusFilter, sortBy]);

    const fetchUsersFromAPI = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`${BASE_URL}/api/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Handle different response formats
                const usersList = Array.isArray(data) ? data : (data.users || []);
                setAllUsers(usersList);
                setUsers(usersList);
                calculateStats(usersList);
            } else {
                console.error("Failed to fetch users:", response.status);
                setAllUsers([]);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setAllUsers([]);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allUsers];

        // Search filter
        if (search) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(search.toLowerCase()) ||
                user.email?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== "all") {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== "all") {
            const isActive = statusFilter === "active";
            filtered = filtered.filter(user => user.isActive === isActive);
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return (a.name || "").localeCompare(b.name || "");
                case "-name":
                    return (b.name || "").localeCompare(a.name || "");
                case "email":
                    return (a.email || "").localeCompare(b.email || "");
                case "-createdAt":
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case "createdAt":
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case "-lastLogin":
                    return new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0);
                default:
                    return 0;
            }
        });

        setUsers(filtered);
        calculateStats(filtered);
    };

    const calculateStats = (userList) => {
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

        setStats({
            total: userList.length,
            active: userList.filter(u => u.isActive).length,
            admins: userList.filter(u => u.role === 'admin').length,
            newThisMonth: userList.filter(u => new Date(u.createdAt) > oneMonthAgo).length
        });
    };

    // Bulk Actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.map(u => u._id || u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleBulkActivate = async () => {
        if (!window.confirm(`Activate ${selectedUsers.length} users?`)) return;

        try {
            const token = localStorage.getItem("token");

            // Update each user individually
            const promises = selectedUsers.map(userId =>
                fetch(`${BASE_URL}/api/users/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ isActive: true })
                })
            );

            await Promise.all(promises);
            setSelectedUsers([]);
            fetchUsersFromAPI(); // Refresh the list
            alert(`${selectedUsers.length} users activated successfully!`);
        } catch (error) {
            console.error("Error activating users:", error);
            alert("Failed to activate users. Please try again.");
        }
    };

    const handleBulkDeactivate = async () => {
        if (!window.confirm(`Deactivate ${selectedUsers.length} users?`)) return;

        try {
            const token = localStorage.getItem("token");

            const promises = selectedUsers.map(userId =>
                fetch(`${BASE_URL}/api/users/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ isActive: false })
                })
            );

            await Promise.all(promises);
            setSelectedUsers([]);
            fetchUsersFromAPI();
            alert(`${selectedUsers.length} users deactivated successfully!`);
        } catch (error) {
            console.error("Error deactivating users:", error);
            alert("Failed to deactivate users. Please try again.");
        }
    };

    const handleBulkDelete = async () => {
        // Check if any selected users are admins
        const selectedUserObjects = allUsers.filter(u => selectedUsers.includes(u._id || u.id));
        const adminCount = selectedUserObjects.filter(u => u.role === 'admin').length;

        if (adminCount > 0) {
            alert(`Cannot delete admin accounts! ${adminCount} admin(s) selected. Please deselect admin users before deleting.`);
            return;
        }

        if (!window.confirm(`Delete ${selectedUsers.length} users? This cannot be undone!`)) return;

        try {
            const token = localStorage.getItem("token");

            const promises = selectedUsers.map(userId =>
                fetch(`${BASE_URL}/api/users/${userId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            await Promise.all(promises);
            setSelectedUsers([]);
            fetchUsersFromAPI();
            alert(`${selectedUsers.length} users deleted successfully!`);
        } catch (error) {
            console.error("Error deleting users:", error);
            alert("Failed to delete users. Please try again.");
        }
    };

    // Individual Actions
    const handleDeleteUser = async (userId) => {
        // Check if user is an admin
        const user = allUsers.find(u => (u._id || u.id) === userId);
        if (user && user.role === 'admin') {
            alert("Cannot delete admin accounts! Admin users cannot be deleted for security reasons.");
            return;
        }

        if (!window.confirm("Delete this user? This cannot be undone!")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchUsersFromAPI();
                alert("User deleted successfully!");
            } else {
                alert("Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user. Please try again.");
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (response.ok) {
                fetchUsersFromAPI();
            } else {
                alert("Failed to update user status.");
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update user status. Please try again.");
        }
    };

    const openUserProfile = (user) => {
        setSelectedUser(user);
        setShowProfileModal(true);
    };

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("all");
        setStatusFilter("all");
        setSortBy("name");
    };


    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatLastLogin = (date) => {
        if (!date) return "Never";
        const now = new Date();
        const loginDate = new Date(date);
        const diffMs = now - loginDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter',sans-serif]">
            {/* SIDEBAR */}
            <AdminSidebar />

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-72 p-8">
                <div className="flex justify-between items-center mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                            User <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Management</span>
                        </h1>
                        <p className="text-slate-500 text-lg">Manage system users, roles, and permissions.</p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-6 mb-8 animate-fade-in-up">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <span className="text-2xl">👥</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Users</p>
                            <h2 className="text-3xl font-bold text-slate-900">{stats.total}</h2>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 block-entry-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <span className="text-2xl">✨</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Users</p>
                            <h2 className="text-3xl font-bold text-slate-900">{stats.active}</h2>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 block-entry-2">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Admins</p>
                            <h2 className="text-3xl font-bold text-slate-900">{stats.admins}</h2>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 block-entry-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                            <span className="text-2xl">📅</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">New (Month)</p>
                            <h2 className="text-3xl font-bold text-slate-900">{stats.newThisMonth}</h2>
                        </div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 mb-8 animate-fade-in-up block-entry-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 flex gap-4">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-3 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium text-slate-700 hover:bg-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium text-slate-700 hover:bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Bulk Actions */}
                        {selectedUsers.length > 0 && (
                            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-fade-in">
                                <span className="text-sm font-semibold text-blue-700">{selectedUsers.length} selected</span>
                                <div className="h-4 w-px bg-blue-200 mx-2"></div>
                                <button onClick={handleBulkActivate} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Activate Selected">
                                    <FiCheck />
                                </button>
                                <button onClick={handleBulkDeactivate} className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors" title="Deactivate Selected">
                                    <FiX />
                                </button>
                                <button onClick={handleBulkDelete} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete Selected">
                                    <FiTrash2 />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white/40 overflow-hidden animate-fade-in-up block-entry-5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200/60">
                                    <th className="p-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={users.length > 0 && selectedUsers.length === users.length}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setSortBy(sortBy === 'name' ? '-name' : 'name')}>
                                        User {sortBy === 'name' && '↑'} {sortBy === '-name' && '↓'}
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setSortBy(sortBy === 'email' ? '-email' : 'email')}>
                                        Email {sortBy === 'email' && '↑'} {sortBy === '-email' && '↓'}
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setSortBy(sortBy === 'createdAt' ? '-createdAt' : 'createdAt')}>
                                        Joined {sortBy === 'createdAt' && '↑'} {sortBy === '-createdAt' && '↓'}
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                <p>Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user._id || user.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition-all group">
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user._id || user.id)}
                                                    onChange={() => handleSelectUser(user._id || user.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{user.name}</p>
                                                        <p className="text-xs text-slate-500 md:hidden">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 hidden md:table-cell">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${user.role === 'admin'
                                                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleToggleStatus(user._id || user.id, user.isActive)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${user.isActive
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                        : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                                        }`}
                                                >
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openUserProfile(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Profile">
                                                        <FiEye />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(user._id || user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-4xl mb-2">🔍</span>
                                                <p className="font-medium">No users found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.length > 0 && (
                        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 flex justify-between items-center">
                            <span className="text-sm text-slate-500">Showing {users.length} users</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                                <button className="px-3 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Profile Modal */}
            {showProfileModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                                <p className="text-blue-100 text-sm">{selectedUser.email}</p>
                            </div>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                            >
                                <FiX />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Role</p>
                                    <p className="font-semibold text-slate-900">{selectedUser.role}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Status</p>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Joined</p>
                                    <p className="font-semibold text-slate-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">User ID</p>
                                    <p className="font-mono text-xs text-slate-600 truncate" title={selectedUser._id || selectedUser.id}>
                                        {(selectedUser._id || selectedUser.id).substring(0, 12)}...
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    handleDeleteUser(selectedUser._id || selectedUser.id);
                                    setShowProfileModal(false);
                                }}
                                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Delete User
                            </button>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
