import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "./store/userSlice";
import { FiUser, FiLock, FiSave, FiLogOut, FiSettings, FiCamera, FiUpload } from "react-icons/fi";
import userIcon from "./assets/user_icon.png";
import UserSidebar from "./UserSidebar";

const BASE_URL = "http://13.233.96.62:30080";



const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [profileImage, setProfileImage] = useState(user?.profileImageUrl || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage("");
    setLoading(true);

    try {
      const body = { name, email };
      if (newPassword.trim()) body.password = newPassword.trim();

      const res = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileMessage(data.message || "Failed to update profile");
      } else {
        setProfileMessage("Profile updated successfully");
        if (data.token) localStorage.setItem("token", data.token);

        const updatedUser = {
          ...user,
          name: data.name,
          email: data.email,
          role: data.role,
          stats: data.stats
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        dispatch(setUser({
          ...updatedUser,
          token: data.token || token
        }));

        setNewPassword("");
        setCurrentPassword("");
      }
    } catch (err) {
      console.error(err);
      setProfileMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageMessage('Please select a valid image file');
      setTimeout(() => setImageMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageMessage('Image size must be less than 5MB');
      setTimeout(() => setImageMessage(''), 3000);
      return;
    }

    setUploadingImage(true);
    setImageMessage('');

    try {
      // Upload image
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await fetch(`${BASE_URL}/api/auth/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'Failed to upload image');
      }

      // Update profile with new image URL
      const updateRes = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ profileImageUrl: uploadData.imageUrl }),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.message || 'Failed to update profile');
      }

      // Update local state and Redux
      setProfileImage(uploadData.imageUrl);
      dispatch(setUser({
        ...user,
        profileImageUrl: uploadData.imageUrl,
      }));

      // Update localStorage
      const updatedUser = { ...user, profileImageUrl: uploadData.imageUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setImageMessage('Profile picture updated successfully!');
      setTimeout(() => setImageMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setImageMessage(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter',sans-serif]">
      {/* SIDEBAR */}
      <UserSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-8">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Account <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-slate-500 text-lg">Manage your profile, preferences, and account security.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Picture Section */}
            <section className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-white/40 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FiCamera size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Profile Picture</h2>
                  <p className="text-sm text-slate-500">Upload your profile photo</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative group">
                  <img
                    src={profileImage || user?.profileImageUrl || userIcon}
                    alt="Profile"
                    onError={(e) => { e.target.onerror = null; e.target.src = userIcon; }}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiCamera className="text-white text-2xl" />
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiUpload />
                    {uploadingImage ? 'Uploading...' : 'Change Picture'}
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    JPG, PNG or WEBP. Max size 5MB.
                  </p>
                  {imageMessage && (
                    <p className={`text-sm mt-2 ${imageMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                      {imageMessage}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Profile Section */}
            <section className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-white/40 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FiUser size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500">Update your personal details.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 my-6"></div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FiLock size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Security</h2>
                    <p className="text-sm text-slate-500">Change your password.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {profileMessage && (
                  <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${profileMessage.toLowerCase().includes("success") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {profileMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column - Preferences & Actions */}
          <div className="space-y-8 animate-fade-in-up block-entry-1">
            {/* Logout Section */}
            <section className="bg-red-50/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl shadow-red-200/20 border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                  <FiLogOut size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Sign Out</h2>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">Securely log out of your session.</p>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-white text-red-600 border border-red-100 font-bold rounded-xl shadow-sm hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
              >
                <FiLogOut /> Sign Out
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
