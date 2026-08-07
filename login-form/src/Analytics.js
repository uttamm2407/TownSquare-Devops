import React, { useEffect, useState, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import userIcon from "./assets/user_icon.png";
import AdminSidebar from "./AdminSidebar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [complaints, setComplaints] = useState([]);
  const analyticsRef = useRef(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("30"); // Default Last 30 Days
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Dynamic Options for Filters
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolutionRate: 0,
    avgResolutionTime: "3.2 Days"
  });

  const [lineData, setLineData] = useState({
    labels: [],
    datasets: []
  });

  const [barData, setBarData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://13.233.96.62:30080/api/complaints/community-complaints", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (Array.isArray(data)) {
          setComplaints(data);

          const cats = [...new Set(data.map(c => c.category || "Uncategorized"))].filter(Boolean);
          const stats = [...new Set(data.map(c => c.status || "Unknown"))].filter(Boolean);
          setAvailableCategories(cats.sort());
          setAvailableStatuses(stats.sort());
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let filteredData = complaints;

    if (timeFilter !== "All") {
      const daysLimit = parseInt(timeFilter);
      filteredData = filteredData.filter(c => (c.timeAgo || 0) <= daysLimit);
    }

    if (categoryFilter !== "All") {
      filteredData = filteredData.filter(c => c.category === categoryFilter);
    }

    if (statusFilter !== "All") {
      filteredData = filteredData.filter(c => c.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(c =>
        c.priority?.toLowerCase().includes(term) ||
        c.status?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        c.reporter?.toLowerCase().includes(term)
      );
    }

    const total = filteredData.length;
    const open = filteredData.filter(c => c.status?.toLowerCase() !== "resolved" && c.status?.toLowerCase() !== "closed").length;
    const resolved = total - open;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    setStats({ ...stats, total, open, resolutionRate: rate });

    const weekCounts = [0, 0, 0, 0];
    filteredData.forEach(c => {
      const days = c.timeAgo || 0;
      if (days < 7) weekCounts[0]++;
      else if (days < 14) weekCounts[1]++;
      else if (days < 21) weekCounts[2]++;
      else weekCounts[3]++;
    });

    setLineData({
      labels: ["< 7 Days", "7-14 Days", "14-21 Days", "> 21 Days"],
      datasets: [{
        label: "Complaint Volume",
        data: weekCounts,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.1)",
        tension: 0.4,
        borderWidth: 3,
      }]
    });

    const urgencyCounts = {
      "Low": 0, "Medium": 0, "Critical": 0
    };

    filteredData.forEach(c => {
      let u = c.priority ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1).toLowerCase() : "Low";
      if (u === "High" || u === "Urgent") {
        u = "Critical";
      } else if (!["Low", "Medium", "Critical"].includes(u)) {
        u = "Low";
      }
      urgencyCounts[u]++;
    });

    setBarData({
      labels: ["Low", "Medium", "Critical"],
      datasets: [{
        label: "Urgency",
        data: [urgencyCounts["Low"], urgencyCounts["Medium"], urgencyCounts["Critical"]],
        backgroundColor: ["#c7d2fe", "#a5b4fc", "#6366f1"],
        borderRadius: 8,
      }]
    });

  }, [complaints, searchTerm, timeFilter, categoryFilter, statusFilter]);


  const handleExport = () => {
    const input = analyticsRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("analytics_report.pdf");
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter',sans-serif]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-8" ref={analyticsRef}>
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Analytics & <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Reporting</span>
            </h1>
            <p className="text-slate-500 text-lg">Track system performance and complaint trends in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-sm border border-white/40 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <span className="text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search analytics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none text-sm w-64 bg-transparent text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              onClick={handleExport}
            >
              <span>📄</span>
              Export Report
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-3 gap-6 mb-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/40 animate-fade-in-up">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">📅 Time Period</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200/60 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium text-slate-700 hover:bg-white"
            >
              <option value="7">Last 7 days</option>
              <option value="15">Last 15 days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="365">Last Year</option>
              <option value="All">All Time</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">📊 Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200/60 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium text-slate-700 hover:bg-white"
            >
              <option value="All">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">🎯 Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200/60 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium text-slate-700 hover:bg-white"
            >
              <option value="All">All Status</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-6 mb-8 animate-fade-in-up block-entry-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center z-10 text-white shadow-lg shadow-blue-500/30">
              <span className="text-2xl">📊</span>
            </div>
            <div className="z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Complaints</p>
              <h2 className="text-3xl font-bold text-slate-900">{stats.total}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.total > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {stats.total > 0 ? "Active Database" : "No Data"}
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center z-10 text-white shadow-lg shadow-red-500/30">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Open Complaints</p>
              <h2 className="text-3xl font-bold text-slate-900">{stats.open}</h2>
              <span className="text-[10px] text-red-600 font-bold px-2 py-0.5 rounded-full bg-red-50">
                {(stats.open / (stats.total || 1) * 100).toFixed(1)}% Unresolved
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center z-10 text-white shadow-lg shadow-purple-500/30">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Avg Resolution</p>
              <h2 className="text-3xl font-bold text-slate-900">{stats.avgResolutionTime}</h2>
              <span className="text-[10px] text-purple-600 font-bold px-2 py-0.5 rounded-full bg-purple-50">Estimated Time</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-white/40 flex items-center gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center z-10 text-white shadow-lg shadow-emerald-500/30">
              <span className="text-2xl">✅</span>
            </div>
            <div className="z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resolution Rate</p>
              <h2 className="text-3xl font-bold text-slate-900">{stats.resolutionRate}%</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stats.resolutionRate > 80 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                {stats.resolutionRate > 80 ? "Excellent" : "Needs Imp."}
              </span>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-2 gap-8 animate-fade-in-up block-entry-3">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/40">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">📈 Complaint Volume Over Time</h3>
              <p className="text-sm text-slate-500">Track complaint submissions across time periods</p>
            </div>
            <div className="h-72">
              <Line data={lineData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { font: { family: 'Inter' } } } }, scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [5, 5] }, beginAtZero: true } } }} />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/40">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">🎯 Urgency Level Breakdown</h3>
              <p className="text-sm text-slate-500">Distribution of complaints by priority level</p>
            </div>
            <div className="h-72">
              <Bar data={barData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { labels: { font: { family: 'Inter' } } } }, scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [5, 5] }, beginAtZero: true } } }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
