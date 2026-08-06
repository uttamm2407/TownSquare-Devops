import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiHome, FiBarChart2, FiUsers, FiSettings } from "react-icons/fi";
import userIcon from "./assets/user_icon.png";

const AdminSidebar = () => {
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: "/admin-dashboard", label: "Dashboard", icon: <FiHome size={20} /> },
        { path: "/analytics", label: "Analytics", icon: <FiBarChart2 size={20} /> },
        { path: "/user-management", label: "User Management", icon: <FiUsers size={20} /> },
        { path: "/setting", label: "Settings", icon: <FiSettings size={20} /> },
    ];

    return (
        <aside className="w-72 bg-[#0f172a] text-white fixed h-screen overflow-y-auto z-50 flex flex-col shadow-2xl font-['Inter',sans-serif]">
            {/* HEADER */}
            <div className="p-8 pb-4">
                <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-3 text-white">
                    <span className="text-3xl bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-indigo-500">
                        🏛️
                    </span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        TownSquare
                    </span>
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2 ml-1">
                    Admin Portal
                </p>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden
              ${isActive(item.path)
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {/* Active Indicator Line */}
                        {isActive(item.path) && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
                        )}

                        <span className={`transition-transform duration-300 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"}`}>
                            {item.icon}
                        </span>
                        <span className="font-semibold tracking-wide text-sm">{item.label}</span>

                        {/* Chevron for active state */}
                        {isActive(item.path) && (
                            <div className="ml-auto opacity-50">
                                <span className="text-xs">▶</span>
                            </div>
                        )}
                    </Link>
                ))}
            </nav>

            {/* USER PROFILE */}
            <div className="p-4 mx-4 mb-6">
                <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform cursor-default">
                    <div className="relative">
                        <img
                            src={user?.profileImageUrl || userIcon}
                            alt="Profile"
                            onError={(e) => { e.target.onerror = null; e.target.src = userIcon; }}
                            className="w-10 h-10 rounded-full bg-indigo-500/20 object-cover border-2 border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                            {user?.name || "Admin"}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">
                                {user?.role || "Administrator"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
