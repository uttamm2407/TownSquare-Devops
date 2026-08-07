import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import userIcon from "./assets/user_icon.png";
import { useSelector } from "react-redux";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    newToday: 0,
    inProgress: 0,
    resolved: 0
  });

  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch("http://13.233.96.62:30080/api/complaints/community-complaints", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (Array.isArray(data)) {
          setComplaints(data);

          const newStats = {
            total: data.length,
            newToday: data.filter(c => c.timeAgo === 0).length,
            inProgress: data.filter(c => c.status?.toLowerCase() === "in progress" || c.status?.toLowerCase() === "in-progress").length,
            resolved: data.filter(c => c.status?.toLowerCase() === "resolved").length
          };
          setStats(newStats);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    if (token) {
      fetchComplaints();
    }
  }, [token]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInHours = Math.floor(diffInSeconds / 3600);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} days ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hours ago`;
    } else {
      return "Just now";
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.category?.toLowerCase().includes(term) ||
      c.reporter?.toLowerCase().includes(term) ||
      c.status?.toLowerCase().includes(term) ||
      c.id?.toLowerCase().includes(term)
    );
  });

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`http://13.233.96.62:30080/api/complaints/complaint/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });

      if (response.ok) {
        setComplaints(prev => prev.map(c =>
          (c._id === id || c.id === id) ? { ...c, status: newStatus.toLowerCase() } : c
        ));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter',sans-serif]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Complaint <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">System</span>
            </h1>
            <p className="text-slate-500 text-lg">Overview of community reports and status.</p>
          </div>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-sm border border-white/40 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <FiSearch className="text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none text-sm w-64 bg-transparent text-slate-700 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total</h4>
              <h1 className="text-3xl font-bold text-slate-900">{stats.total}</h1>
              <p className="text-xs text-slate-400 font-medium">All time reports</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 block-entry-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Today</h4>
              <h1 className="text-3xl font-bold text-slate-900">{stats.newToday}</h1>
              <p className="text-xs text-emerald-600 font-bold">+ Recently added</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 block-entry-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <span className="text-2xl">⏳</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">In Progress</h4>
              <h1 className="text-3xl font-bold text-slate-900">{stats.inProgress}</h1>
              <p className="text-xs text-orange-600 font-bold">Active cases</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 block-entry-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-500/30">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resolved</h4>
              <h1 className="text-3xl font-bold text-slate-900">{stats.resolved}</h1>
              <p className="text-xs text-slate-400 font-medium">Completed cases</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/40 flex flex-col gap-6 animate-fade-in-up block-entry-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Recent Complaints</h3>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">View All &rarr;</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60">
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitter</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Urgency</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((c, i) => (
                    <tr key={i} className="group border-b border-slate-100 hover:bg-blue-50/50 transition-all">
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-700">{c.category}</span>
                        <div className="text-xs text-slate-400 hidden group-hover:block">{c.email}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600 font-medium">{c.reporter || "Anonymous"}</td>
                      <td className="py-4 px-4 text-sm text-slate-500">{formatTimeAgo(c.createdAt)}</td>
                      <td className="py-4 px-4">
                        <div className="relative">
                          <select
                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer transition-all hover:scale-105 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/20 outline-none ${c.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                              c.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                c.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                  c.status === 'closed' ? 'bg-slate-100 text-slate-700' :
                                    'bg-purple-100 text-purple-700'
                              }`}
                            value={c.status}
                            onChange={(e) => handleStatusUpdate(c._id || c.id, e.target.value)}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                            <option value="under review">Under Review</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-current">
                            <svg className="fill-current h-3 w-3 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${c.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-100' :
                          c.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link to={`/admin/complaint/${c._id || c.id}`} className="text-blue-600 font-bold text-xs hover:text-blue-800 hover:underline flex items-center gap-1">
                          View Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="text-4xl mb-2">🔍</span>
                        <p className="font-medium">No complaints found matching "{searchTerm}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
