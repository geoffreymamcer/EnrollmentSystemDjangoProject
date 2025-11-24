// --- START OF FILE Profile.tsx ---

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  MapPin,
  Calendar,
  QrCode,
  Fingerprint,
  Activity,
  Clock,
  Zap,
  Loader2,
  User,
} from "lucide-react";

const Profile: React.FC = () => {
  // 1. State Management
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "", // Read-only
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Auth Helper (Gets Token)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // 3. Fetch Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // We explicitly set Content-Type to JSON for the GET request
        const headers: any = getAuthHeaders();
        headers["Content-Type"] = "application/json";

        const response = await fetch("http://127.0.0.1:8000/api/profile/", {
          headers: headers,
        });

        if (response.ok) {
          const data = await response.json();
          // Map Django (snake_case) to React (camelCase)
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            username: data.username || "",
          });

          // Set Avatar URL if it exists
          if (data.avatar) {
            setAvatarUrl(data.avatar);
          }
        } else {
          console.error("Failed to load profile");
        }
      } catch (error) {
        console.error("Network error fetching profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 4. Input Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 5. File Upload Handler (Image)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // A. Optimistic UI: Show image immediately using local FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // B. Upload to Backend (Cloudinary)
    try {
      setIsSaving(true);
      const uploadData = new FormData();
      uploadData.append("avatar", file); // Must match serializer field name

      // NOTE: Do NOT set 'Content-Type' header. Browser sets it to multipart/form-data automatically.
      const response = await fetch("http://127.0.0.1:8000/api/profile/", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: uploadData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Form Submit Handler (Text Data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Use FormData to safely send data (compatible with the view's parser)
      const uploadData = new FormData();
      uploadData.append("first_name", formData.firstName);
      uploadData.append("last_name", formData.lastName);
      uploadData.append("email", formData.email);

      const response = await fetch("http://127.0.0.1:8000/api/profile/", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: uploadData,
      });

      if (!response.ok) throw new Error("Failed to update profile");

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500">
            Manage your digital identity and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Online • v2.4.0
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Digital ID & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Digital ID Card */}
          <div className="relative group perspective-1000">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-700 transition-transform duration-500 group-hover:scale-[1.02]">
              {/* Holographic/Noise overlay */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/30 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {/* Avatar Display */}
                  <div className="w-28 h-28 rounded-2xl border-4 border-white/10 shadow-inner overflow-hidden relative bg-slate-800 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-slate-400">
                        {formData.firstName?.[0]}
                        {formData.lastName?.[0]}
                      </span>
                    )}
                  </div>

                  {/* Camera Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-3 -right-3 p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg border-4 border-slate-800 transition-all active:scale-95"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-primary-300 font-medium text-sm mb-6">
                  @{formData.username}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      ID Number
                    </div>
                    <div className="font-mono text-sm tracking-widest text-white">
                      894-221
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Joined
                    </div>
                    <div className="text-sm text-white">Aug 2024</div>
                  </div>
                </div>

                <div className="w-full pt-6 border-t border-white/10 flex justify-between items-end opacity-60">
                  <QrCode size={48} className="text-white" />
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                      Verified By
                    </div>
                    <div className="font-bold flex items-center gap-1 text-sm">
                      <Shield size={14} /> PLL Admin
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Session Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    Last Login
                  </div>
                </div>
                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                  Today, 09:41 AM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Activity size={18} />
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    Actions
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800">142</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Fingerprint size={18} />
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    IP Address
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  192.168.1.XX
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Main Settings */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Security Score",
                value: "98%",
                icon: Shield,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Storage Used",
                value: "45%",
                icon: Zap,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Role Level",
                value: "Admin",
                icon: Fingerprint,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Personal Information
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Update your basic profile details here.
                </p>
              </div>
              {showSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 bg-white shadow-sm border border-emerald-100 px-4 py-2 rounded-full text-sm font-bold animate-in slide-in-from-top-2 fade-in">
                  <CheckCircle2 size={16} /> Saved
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* First Name */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    First Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="p-1.5 bg-slate-100 rounded-md group-focus-within:bg-primary-50 transition-colors">
                        <User
                          size={16}
                          className="text-slate-400 group-focus-within:text-primary-500"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    Last Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="p-1.5 bg-slate-100 rounded-md group-focus-within:bg-primary-50 transition-colors">
                        <User
                          size={16}
                          className="text-slate-400 group-focus-within:text-primary-500"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-4 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="p-1.5 bg-slate-100 rounded-md group-focus-within:bg-primary-50 transition-colors">
                        <Mail
                          size={16}
                          className="text-slate-400 group-focus-within:text-primary-500"
                        />
                      </div>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pl-1">
                    Used for notifications and login.
                  </p>
                </div>
              </div>

              {/* Read Only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <div className="p-1.5 bg-slate-100 rounded-md">
                        <MapPin size={16} className="text-slate-400" />
                      </div>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={formData.username}
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">
                    Start Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <div className="p-1.5 bg-slate-100 rounded-md">
                        <Calendar size={16} className="text-slate-400" />
                      </div>
                    </div>
                    <input
                      type="text"
                      disabled
                      value="August 15, 2023"
                      className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-slate-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:bg-slate-800 hover:-translate-y-0.5"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                  {!isSaving && (
                    <Save
                      size={18}
                      className="ml-2 group-hover:scale-110 transition-transform"
                    />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
