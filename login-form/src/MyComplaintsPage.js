import React, { useEffect, useState } from "react";
import { FiSearch, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UserSidebar from "./UserSidebar";

export default function MyComplaintsPage() {
  const [complaintData, setComplaintData] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const user = useSelector((state) => state.auth.user);

  const navigate = useNavigate();



  const handleUrgencyFilter = (value) => {
    if (value === "all") {
      setFilteredComplaints(complaintData);
    }
    else {
      const filtered = complaintData.filter(c => c.urgency.toLowerCase() === value);
      setFilteredComplaints(filtered);
    }
    setPage(1);
  }

  const handleSortBy = (value) => {
    let sortedComplaints = [...filteredComplaints];
    if (value === "Newest to Oldest") {
      sortedComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    else {
      sortedComplaints.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    setFilteredComplaints(sortedComplaints);
    setPage(1);
  }

  const handleStatus = (value) => {
    if (value === 'All') {
      setFilteredComplaints(complaintData);
    }
    else {
      const filtered = complaintData.filter(c => c.status.toLowerCase() === value.toLowerCase());
      setFilteredComplaints(filtered);
    }
    setPage(1);
  }

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/complaints/all-complaints",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setComplaintData(data);
        setFilteredComplaints(data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter',sans-serif]">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 overflow-hidden">
        <header className="mb-8 flex justify-between items-end animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              My <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Complaints</span>
            </h1>
            <p className="text-slate-500 text-lg">View and track all complaints you have submitted.</p>
          </div>

          <Link to="/submit-complaint" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40">
            <FaPlus /> File a New Complaint
          </Link>
        </header>

        <div className="grid grid-cols-[3fr_1fr] gap-8 relative animate-fade-in-up">
          {/* Table */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-slate-200/50 p-8 overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Complaint</th>
                  <th className="text-left py-4 px-4 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Urgency</th>
                  <th className="text-left py-4 px-4 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">Status</th>
                  <th className="text-left py-4 px-4 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200"></th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(filteredComplaints) && filteredComplaints.length > 0 ? (
                  filteredComplaints
                    .slice((page - 1) * 5, page * 5)
                    .map((c, i) => (
                      <tr key={c._id} className="group transition-all duration-200 hover:bg-white hover:shadow-md rounded-xl">
                        <td className="py-5 px-4 border-b border-slate-100 group-hover:border-transparent rounded-l-xl align-middle">
                          <p className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">
                            {c.title}
                          </p>
                          <span className="text-xs text-slate-400 font-medium">
                            #{c._id.slice(-6).toUpperCase()} • {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-5 px-4 border-b border-slate-100 group-hover:border-transparent align-middle">
                          <span className={`py-1 px-3 text-[10px] rounded-full font-bold uppercase tracking-wide border ${c.urgency === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
                            c.urgency === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                            {c.urgency}
                          </span>
                        </td>

                        <td className="py-5 px-4 border-b border-slate-100 group-hover:border-transparent align-middle">
                          <span className={`py-1 px-3 text-[10px] rounded-full font-bold uppercase tracking-wide border ${c.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            c.status === 'InProgress' || c.status.includes('progress') ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            {c.status}
                          </span>
                        </td>

                        <td className="py-5 px-4 border-b border-slate-100 group-hover:border-transparent rounded-r-xl align-middle text-right">
                          <Link to={`/complaint/${c._id}`} className="text-blue-600 font-semibold text-sm hover:underline">View</Link>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

            {/* Pagination */
              Array.isArray(filteredComplaints) && filteredComplaints.length > 5 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-600 transition-colors flex items-center gap-1"
                    disabled={page === 1}
                  >
                    <FiChevronLeft /> Previous
                  </button>
                  <span className="text-sm text-slate-500 font-medium">
                    Page {page} of {Math.ceil(filteredComplaints.length / 5)}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-slate-600 transition-colors flex items-center gap-1"
                    disabled={page === Math.ceil(filteredComplaints.length / 5)}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
          </div>

          {/* Filters & Summary */}
          <div className="flex flex-col gap-6">
            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-slate-200/50 p-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">Filters</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
                  <select onChange={(e) => handleStatus(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all">
                    <option>All</option>
                    <option>Submitted</option>
                    <option>In-progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                    <option>Under Review</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Urgency</label>
                  <select onChange={(e) => handleUrgencyFilter(e.target.value.toLowerCase())} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all">
                    <option>All</option>
                    <option>Critical</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sort by</label>
                  <select onChange={(e) => handleSortBy(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all">
                    <option>Newest to Oldest</option>
                    <option>Oldest to Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-500/30 p-6 text-white">
              <h3 className="mb-6 text-lg font-bold flex items-center gap-2">Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-blue-100 text-sm">Total</span>
                  <span className="text-xl font-bold">{complaintData.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-blue-100 text-sm">Resolved</span>
                  <span className="text-xl font-bold">{user?.stats?.resolved || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-blue-100 text-sm">Pending</span>
                  <span className="text-xl font-bold">{(user?.stats?.submitted || 0) + (user?.stats?.inProgress || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
