import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Loader2 } from "lucide-react"; // Import Loader icon
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Singup";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Instructors from "./pages/Instructors";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Enrollment from "./pages/Enrollment";
import Profile from "./pages/Profile";
import type { User } from "./types";
import "./index.css";
import BASE_URL from "./api/base_url";

const App: React.FC = () => {
  // 1. Initialize Auth from LocalStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState<User | null>(null);

  // 2. NEW: Add a Loading State to prevent premature redirection
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("accessToken");

    // If no token, we aren't logged in. Stop loading.
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.id || "user-id",
          name: `${data.first_name} ${data.last_name}`.trim() || data.username,
          email: data.email,
          avatar: data.avatar,
        });
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Only logout if the server specifically says "Unauthorized" (Token expired)
        console.warn("Session expired");
        handleLogout();
      } else {
        // If it's a 500 error or network error, don't logout, just keep the state
        console.error("API Error:", response.status);
      }
    } catch (error) {
      console.error("Network error fetching profile:", error);
    } finally {
      // Always stop loading after the check is done
      setIsLoading(false);
    }
  };

  // Run this once on mount (refresh)
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchUserProfile();
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  // 3. Show a Loading Spinner while checking the token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />}
        />

        {/* Protected Routes */}
        <Route
          element={
            isAuthenticated ? (
              <Layout
                user={user}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/students" element={<Students />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/enrollments" element={<Enrollment />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
