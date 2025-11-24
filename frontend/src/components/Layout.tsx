// --- START OF FILE Layout.tsx ---

import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User as UserIcon,
} from "lucide-react";
import type { User } from "../types";

// Update Interface: Match the Django User Profile structure if needed
// Assuming User type has: { name: string, email: string, avatar?: string }
interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  onUpdateUser: (data: Partial<User>) => void;
}

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon: Icon,
  label,
  isActive,
  onClick,
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
      isActive
        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`}
  >
    <Icon
      size={20}
      className={`relative z-10 transition-transform duration-300 ${
        isActive ? "scale-110" : "group-hover:scale-110"
      }`}
    />
    <span className="font-medium relative z-10">{label}</span>
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-100" />
    )}
  </Link>
);

const Layout: React.FC<LayoutProps> = ({ user, onLogout, onUpdateUser }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/departments", icon: Building2, label: "Departments" },
    { to: "/instructors", icon: Users, label: "Instructors" },
    { to: "/students", icon: GraduationCap, label: "Students" },
    { to: "/courses", icon: BookOpen, label: "Courses" },
    { to: "/enrollments", icon: ClipboardList, label: "Enrollments" },
    { to: "/profile", icon: UserIcon, label: "My Profile" },
  ];

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
        md:m-4 md:rounded-3xl flex flex-col
        bg-dark-900 text-white shadow-2xl shadow-dark-900/20
      `}
      >
        {/* Brand Area */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight block leading-none">
                PLL
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-4 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              {/* 🏁 START OF CHANGE: User Display 🏁 */}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-primary-500/50 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-primary-500/50 bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                  {getInitials(user?.name || "User")}
                </div>
              )}

              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || "..."}
                </p>
              </div>
              {/* 🛑 END OF CHANGE 🛑 */}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 text-sm font-medium"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Navbar */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Contextual Title / Breadcrumb */}
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {navItems.find((i) => i.to === location.pathname)?.label ||
                  "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-full border border-slate-200 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-50 transition-all shadow-sm w-64">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Global search..."
                className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-slate-400"
              />
            </div>

            <button className="p-2.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-full transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F8FAFC]"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-4 pb-4 md:px-10 md:pb-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet context={{ user, onUpdateUser }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
