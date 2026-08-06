import React, { useState, useEffect } from "react";
import { FiUsers, FiSettings, FiSend, FiList, FiMap, FiMessageCircle, FiThumbsUp, FiSearch, FiChevronRight } from "react-icons/fi";
import { IoTodayOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSelector } from "react-redux";
import userIcon from "./assets/user_icon.png";

import UserSidebar from "./UserSidebar";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different priority levels
const getPriorityIcon = (priority) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${priority === "critical" ? "red" : priority === "medium" ? "orange" : "green"
      }.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Component to update map view
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Function to format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return "Unknown time";
  const now = new Date();
  const past = new Date(dateString);
  if (isNaN(past.getTime())) return "Invalid date";

  const diffInMs = now - past;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInSeconds < 60) return "just now";
  else if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "min" : "mins"} ago`;
  else if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  else if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  else {
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }
};

const CommunityView = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();



  const [viewMode, setViewMode] = useState("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/complaints/community-complaints",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch complaints");
        const data = await response.json();
        setComplaints(data);
      } catch (error) {
        console.error("Error fetching community complaints:", error);
      }
    };

    fetchComplaints();
    const intervalId = setInterval(fetchComplaints, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUpvote = (id) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id
          ? {
            ...complaint,
            upvotes: complaint.isUpvoted ? complaint.upvotes - 1 : complaint.upvotes + 1,
            isUpvoted: !complaint.isUpvoted,
          }
          : complaint
      )
    );
  };

  const handleCardClick = (complaint) => {
    setSelectedComplaint(complaint);
    if (viewMode === "list") setViewMode("map");
  };

  const filteredComplaints = complaints.filter(
    (complaint) =>
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMapCenter = () => {
    if (selectedComplaint) {
      return [selectedComplaint.latitude, selectedComplaint.longitude];
    }
    return [19.0760, 72.8777];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter',sans-serif]">
      <div className="flex">
        {/* Sidebar */}
        <UserSidebar />

        {/* Main */}
        <main className="flex-1 ml-72 p-8">
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Community <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">View</span>
            </h1>

            <div className="flex gap-2 bg-white/50 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-slate-200/60">
              <button
                className={`py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${viewMode === "map" ? "bg-white shadow-md text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
                onClick={() => setViewMode("map")}
              >
                <FiMap /> Map
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_400px] gap-8 animate-fade-in-up">
            {/* Map Box */}
            {viewMode === "map" && (
              <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-slate-200/50 p-6 flex flex-col gap-4">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search by location or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex-1 min-h-[500px]">
                  <MapContainer
                    center={getMapCenter()}
                    zoom={selectedComplaint ? 15 : 12}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    style={{ height: "100%", minHeight: "500px" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <MapUpdater center={getMapCenter()} zoom={selectedComplaint ? 14 : 12} />

                    {filteredComplaints.map((complaint) => (
                      <Marker
                        key={complaint.id}
                        position={[complaint.latitude, complaint.longitude]}
                        icon={getPriorityIcon(complaint.priority)}
                        eventHandlers={{
                          click: () => setSelectedComplaint(complaint),
                        }}
                      >
                        {selectedComplaint?.id === complaint.id && (
                          <Popup>
                            <div className="min-w-[200px] p-1">
                              <h3 className="m-0 mb-1 text-sm font-bold text-slate-900">{complaint.title}</h3>
                              <span className={`inline-block mb-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${complaint.priority === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                {complaint.priority}
                              </span>
                              <p className="my-1 text-xs text-slate-500 line-clamp-2">{complaint.description}</p>
                              <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                                <span>👍 {complaint.upvotes}</span>
                                <span>💬 {complaint.comments}</span>
                              </div>
                            </div>
                          </Popup>
                        )}
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Right Complaint Cards */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 custom-scrollbar">
              {filteredComplaints.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-sm text-center">
                  <p className="text-slate-500 font-medium">No complaints found matching your search.</p>
                </div>
              ) : (
                filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl p-5 border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 ${selectedComplaint?.id === complaint.id
                      ? "border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500"
                      : "border-white/50 hover:border-blue-300"
                      }`}
                    onClick={() => handleCardClick(complaint)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-bold text-slate-900 m-0 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {complaint.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${complaint.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-100' :
                        complaint.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {complaint.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                      <FiUsers className="text-slate-300" /> {complaint.reporter}
                    </p>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {complaint.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        complaint.status === 'InProgress' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {complaint.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <button
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${complaint.isUpvoted ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(complaint.id);
                        }}
                      >
                        <FiThumbsUp className={complaint.isUpvoted ? "fill-current" : ""} />
                        {complaint.upvotes}
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <IoTodayOutline /> {formatTimeAgo(complaint.createdAt || complaint.created_at || complaint.timestamp || complaint.date)}
                        </span>
                        <Link to={`/complaint/${complaint.id}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                          View <FiChevronRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityView;
