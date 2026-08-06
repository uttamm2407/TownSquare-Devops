import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import userIcon from "./assets/user_icon.png";
import UserSidebar from "./UserSidebar";

// Helper debounce function
function debounceFn(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/* -------- CUSTOM RED MAP MARKER -------- */
const redMarker = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [28, 45],
  iconAnchor: [14, 45],
});

/* -------- CATEGORY & URGENCY DATA -------- */
const categories = [
  { id: "pothole", label: "Pothole", icon: "🚧" },
  { id: "streetlight", label: "Streetlight", icon: "💡" },
  { id: "garbage", label: "Garbage", icon: "🗑️" },
  { id: "sewage", label: "Sewage", icon: "🚰" },
  { id: "water", label: "Water", icon: "💧" },
  { id: "electricity", label: "Electricity", icon: "⚡" },
  { id: "other", label: "Other", icon: "❓" },
];

const urgencyLevels = [
  { id: "low", label: "Low", color: "#1A73E8" },
  { id: "medium", label: "Medium", color: "#EAB308" },
  { id: "critical", label: "Critical", color: "#DC2626" },
];

/* -------- MAP LOCATION MARKER COMPONENT -------- */
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={redMarker} /> : null;
}

/* -------- MAP UPDATER COMPONENT -------- */
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

/* -------- DRAG & DROP UPLOAD COMPONENT -------- */
function FileUpload({ files, setFiles }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
    [setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group
          ${isDragActive
            ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
          }`}
      >
        <input {...getInputProps()} />
        <div className={`text-6xl mb-4 transition-transform duration-300 ${isDragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          ☁️
        </div>
        <p className="text-lg font-semibold text-slate-700 mb-2">
          {isDragActive ? "Drop files now!" : "Click or drag files here"}
        </p>
        <p className="text-sm text-slate-500">
          Supports JPG, PNG, MP4 (Max 10MB)
        </p>
      </div>

      {/* PREVIEW */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {files.map((file, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                type="button"
              >
                ✕
              </button>
              {file.type.startsWith("image") ? (
                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-32 object-cover" />
              ) : (
                <video src={URL.createObjectURL(file)} className="w-full h-32 object-cover" />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] p-1 truncate text-center backdrop-blur-sm">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------- MAIN PAGE COMPONENT -------- */
export default function SubmitComplaint({ onLogout }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [markerPos, setMarkerPos] = useState(null);
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null); // separate state to control map flying

  // Search & Autocomplete State
  const [locationName, setLocationName] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    road: "",
    neighborhood: "",
    city: "",
    state: "",
    postcode: ""
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const user = useSelector((state) => state.auth.user);

  // Create a ref for the provider to persist it
  const providerRef = useRef(new OpenStreetMapProvider());

  // Debounced Search Function
  const debouncedSearch = useCallback(
    debounceFn(async (query) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await providerRef.current.search({ query });
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 500),
    []
  );

  // Auto-detect current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);
          setMarkerPos(location);
          setMapCenter(location);
          getLocationName(latitude, longitude);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        }
      );
    }
  }, []);

  // Get location name from coordinates
  // updateLabel: true  → also update the text input (map click)
  //              false → only update the road/area/city chips (search select)
  const getLocationName = async (lat, lng, updateLabel = true) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/location-name?lat=${lat}&lon=${lng}`,
        { method: "GET" }
      );

      if (!response.ok) {
        console.warn("Nominatim API error:", response.status);
        if (updateLabel) setLocationName("Location selected");
        return;
      }

      const data = await response.json();
      const addr = data.address || {};

      // Always update granular address details
      setAddressDetails({
        road: addr.road || addr.pedestrian || addr.street || "",
        neighborhood: addr.suburb || addr.neighbourhood || addr.residential || "",
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || "",
        postcode: addr.postcode || ""
      });

      // Only overwrite the location name label for map clicks
      if (updateLabel) {
        const parts = [
          addr.road,
          addr.residential,
          addr.village,
          addr.town,
          addr.city,
          addr.state,
          addr.county,
          addr.country,
        ].filter(Boolean);
        const address = parts.length > 0 ? parts.join(", ") : "Location selected";
        setLocationName(address);
      }
    } catch (error) {
      console.warn("Geocoding error:", error.message);
      if (updateLabel) setLocationName("Location selected");
    }
  };

  // Only reverse-geocode when marker is moved by map click (not when set by search suggestion)
  const isSearchSelect = useRef(false);
  useEffect(() => {
    if (markerPos) {
      // For search selects: update address details chips only (don't overwrite the label)
      // For map clicks: update both the label and chips
      getLocationName(markerPos.lat, markerPos.lng, !isSearchSelect.current);
    }
    isSearchSelect.current = false;
  }, [markerPos]);

  // Handle Input Change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocationName(value);
    debouncedSearch(value);
  };

  // Handle Suggestion Selection
  const handleSuggestionSelect = (result) => {
    const { x, y, label } = result;
    const latlng = { lat: parseFloat(y), lng: parseFloat(x) };

    // Prevent the markerPos useEffect from overwriting the label
    isSearchSelect.current = true;
    setMarkerPos(latlng);
    setMapCenter(latlng);  // fly the map to the searched location
    setLocationName(label);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a title for the complaint");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!selectedCategory) {
      setMessage("Please select a category");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!urgency) {
      setMessage("Please select a Urgency");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (!markerPos) {
      setMessage("Please select a location on the map");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (description.trim().length < 10) {
      setMessage("Description must be at least 10 characters");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("userId", user ? user._id : "");
      formData.append("title", title);
      formData.append("category", selectedCategory);
      formData.append("urgency", urgency);
      formData.append("description", description);
      formData.append("latitude", markerPos.lat);
      formData.append("longitude", markerPos.lng);
      formData.append("locationName", locationName || "Unknown Location");

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        "http://localhost:5000/api/complaints/submit-complaint",
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMessage("✅ Complaint submitted successfully!");

      // Reset form
      setTimeout(() => {
        setTitle("");
        setSelectedCategory("pothole");
        setUrgency("");
        setMarkerPos(currentLocation);
        setFiles([]);
        setDescription("");
        setLocationName("");
        setAddressDetails({ road: "", neighborhood: "", city: "", state: "", postcode: "" });
        setSuggestions([]);
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("❌ Failed to submit complaint. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter',sans-serif]">
      <UserSidebar />

      {/* -------- MAIN MOTION CONTAINER -------- */}
      <main className="ml-72 p-8 w-full">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Submit a <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Complaint</span>
          </h1>
          <p className="text-slate-500 text-lg">Help us improve your community by reporting issues.</p>
        </header>

        {message && (
          <div
            className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-[100] animate-fade-in-up flex items-center gap-3 border ${message.includes("✅")
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'}`}
          >
            <span className="text-2xl">{message.includes("✅") ? "🎉" : "⚠️"}</span>
            <span className="font-semibold">{message.replace(/✅|❌/, "")}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl shadow-slate-200/50 p-8 w-full animate-fade-in-up">

          {/* TITLE SECTION */}
          <section className="mb-12">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Issue Title</label>
            <input
              type="text"
              placeholder="e.g., Deep pothole on 5th Avenue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-4 text-lg bg-white/50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

            {/* CATEGORY SECTION */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏷️</span>
                <label className="text-lg font-bold text-slate-900">Category</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                      ${selectedCategory === cat.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-[1.02]'
                        : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50'}`}
                  >
                    <span className="text-3xl filter drop-shadow-sm">{cat.icon}</span>
                    <span className="text-sm font-semibold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* URGENCY SECTION */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚨</span>
                <label className="text-lg font-bold text-slate-900">Urgency</label>
              </div>
              <div className="flex flex-col gap-3">
                {urgencyLevels.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id)}
                    className={`relative overflow-hidden p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4 group
                      ${urgency === u.id
                        ? 'border-transparent ring-2 ring-offset-1 ring-blue-500 shadow-md'
                        : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    style={{
                      backgroundColor: urgency === u.id ? `${u.color}15` : ''
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110
                        ${urgency === u.id ? 'scale-110' : ''}`}
                      style={{ backgroundColor: `${u.color}20`, color: u.color }}
                    >
                      {u.id === 'low' ? '🟢' : u.id === 'medium' ? '🟡' : '🔴'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{u.label} Priority</h4>
                      <p className="text-xs text-slate-500">
                        {u.id === 'low' ? 'Non-critical issue, fix when possible'
                          : u.id === 'medium' ? 'Needs attention within 7 days'
                            : 'Immediate hazard, requires urgent action'}
                      </p>
                    </div>
                    {urgency === u.id && (
                      <div className="absolute right-4 text-blue-600 font-bold text-xl animate-fade-in">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* DESCRIPTION SECTION */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📝</span>
              <label className="text-lg font-bold text-slate-900">Details</label>
            </div>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail... Who, what, when, where?"
                className="w-full min-h-[160px] p-6 bg-white/50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-y text-base"
              />
              <div className={`absolute bottom-4 right-4 text-xs font-semibold px-2 py-1 rounded bg-white/80 backdrop-blur ${description.length < 10 ? 'text-red-500' : 'text-green-600'}`}>
                {description.length} chars
              </div>
            </div>
            {description.length > 0 && description.length < 10 && (
              <p className="text-red-500 text-sm mt-2 font-medium">⚠️ Minimum 10 characters required</p>
            )}
          </section>

          {/* MEDIA UPLOAD SECTION */}
          <section className="mb-12 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📸</span>
              <label className="text-lg font-bold text-slate-900">Evidence</label>
            </div>
            <FileUpload files={files} setFiles={setFiles} />
          </section>

          {/* MAP SECTION */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📍</span>
              <label className="text-lg font-bold text-slate-900">Location</label>
            </div>

            <div className="bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm">
              <div className="h-[400px] rounded-xl overflow-hidden relative z-0">
                <MapContainer
                  center={markerPos || [20.5937, 78.9629]}
                  zoom={markerPos ? 15 : 5}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationMarker
                    position={markerPos}
                    setPosition={(pos) => {
                      isSearchSelect.current = false;
                      setMarkerPos(pos);
                      setMapCenter(pos);
                    }}
                  />
                  <MapUpdater center={mapCenter} />
                </MapContainer>

                {!markerPos && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-[400]">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg font-medium text-slate-700 animate-bounce">
                      👇 Click to pin location
                    </div>
                  </div>
                )}
              </div>

              {/* ADDRESS SEARCH & DISPLAY */}
              <div className="mt-4 p-4 bg-slate-50 rounded-xl relative">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">🔍</span>
                  <input
                    type="text"
                    value={locationName}
                    onChange={handleInputChange}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search for an area or street..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-400"
                  />
                  {markerPos && (
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                      {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* GRANULAR LOCATION DETAILS */}
                {Object.values(addressDetails).some(Boolean) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                    <div className="bg-white border border-slate-200 p-2 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Road</p>
                      <p className="text-sm font-medium text-slate-800 truncate" title={addressDetails.road || "N/A"}>{addressDetails.road || "N/A"}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Area</p>
                      <p className="text-sm font-medium text-slate-800 truncate" title={addressDetails.neighborhood || "N/A"}>{addressDetails.neighborhood || "N/A"}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase font-semibold">City</p>
                      <p className="text-sm font-medium text-slate-800 truncate" title={addressDetails.city || "N/A"}>{addressDetails.city || "N/A"}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase font-semibold">State</p>
                      <p className="text-sm font-medium text-slate-800 truncate" title={addressDetails.state || "N/A"}>{addressDetails.state || "N/A"}</p>
                    </div>
                  </div>
                )}

                {/* SUGGESTIONS DROPDOWN */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-50">
                    {suggestions.map((item, index) => (
                      <li
                        key={index}
                        onMouseDown={() => handleSuggestionSelect(item)}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setSelectedCategory("");
                setUrgency("");
                setMarkerPos(currentLocation);
                setFiles([]);
                setDescription("");
                setLocationName("");
                setAddressDetails({ road: "", neighborhood: "", city: "", state: "", postcode: "" });
                setMessage("");
              }}
              className="px-6 py-3 text-slate-500 font-semibold hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform transition-all 
                ${loading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 active:scale-95'}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Complaint"
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
