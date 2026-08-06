import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiThumbsUp,
  FiMessageCircle,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

const getDaysAgo = (createdAt) => {
  if (!createdAt) return "";
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (Number.isNaN(days) || days < 0) return "";
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const ComplaintDetails = () => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const { id } = useParams();
  const [detailData, setDetailData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/complaints/complaint/${id}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }

        const data = await response.json();
        setDetailData(data);
      } catch (err) {
        console.log(err);
      }
    };

    if (id) {
      fetchComplaints();
    }
  }, [id]);

  const hasCoords =
    detailData &&
    typeof detailData.latitude === "number" &&
    typeof detailData.longitude === "number";

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 ${selectedMedia ? "blur-sm" : ""}`}>
        <main className="max-w-5xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate("/community")}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:shadow-md transition-all"
            >
              <FiArrowLeft /> <span>Back</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-slate-900">{detailData?.title || "Loading..."}</h1>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              ID: <strong className="text-slate-900">{detailData?._id || "—"}</strong> • Submitted:{" "}
              <strong className="text-slate-900">{getDaysAgo(detailData?.createdAt) || "—"}</strong>
            </p>

            <div className="flex gap-2 mb-6">
              {detailData?.urgency && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${detailData.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                    detailData.urgency === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                  }`}>
                  {detailData.urgency.toUpperCase()}
                </span>
              )}
              {detailData?.status && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                  {detailData.status.toUpperCase()}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-700 mb-4">
              {detailData?.description || "No description available."}
            </p>

            <p className="flex items-center gap-2 text-sm text-slate-600">
              <FiMapPin className="text-blue-500" />
              {hasCoords
                ? `${detailData.latitude}° N, ${detailData.longitude}° E`
                : "Location not available"}
            </p>
          </div>

          {/* MEDIA */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Photos / Videos</h3>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {detailData?.files && detailData.files.length > 0 ? (
                detailData.files.map((item) => (
                  <div
                    key={item._id}
                    className="flex-shrink-0 w-40 h-40 rounded-xl overflow-hidden cursor-pointer border-2 border-slate-200 hover:border-blue-500 transition-all hover:shadow-lg"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.mimetype?.includes("image") ? (
                      <img
                        src={`${BASE_URL}/${item.path.replace(/\\/g, "/")}`}
                        alt={item.filename || "media"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={`${BASE_URL}/${item.path.replace(/\\/g, "/")}`}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No media uploaded.</p>
              )}
            </div>
          </div>

          {/* MAP */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Location</h3>

            {hasCoords && (
              <div className="rounded-xl overflow-hidden border-2 border-slate-200 mb-4" style={{ height: "400px" }}>
                <MapContainer
                  center={[detailData.latitude, detailData.longitude]}
                  zoom={14}
                  scrollWheelZoom
                  className="w-full h-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[detailData.latitude, detailData.longitude]}
                  />
                </MapContainer>
              </div>
            )}

            <p className="text-slate-700">
              {detailData?.locationName || ""}
            </p>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {selectedMedia && selectedMedia.path && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8" onClick={() => setSelectedMedia(null)}>
          <div className="relative max-w-6xl max-h-[90vh] bg-white rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <FiX className="absolute top-4 right-4 text-3xl text-slate-700 cursor-pointer hover:text-slate-900 bg-white rounded-full p-2 shadow-lg" onClick={() => setSelectedMedia(null)} />
            {selectedMedia.mimetype?.includes("image") ? (
              <img
                src={`${BASE_URL}/${selectedMedia.path.replace(/\\/g, "/")}`}
                alt="full"
                className="max-w-full max-h-[85vh] rounded-xl"
              />
            ) : (
              <video
                src={`${BASE_URL}/${selectedMedia.path.replace(/\\/g, "/")}`}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ComplaintDetails;
