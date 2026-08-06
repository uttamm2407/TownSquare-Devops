import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setToken, setLoading } from "./store/userSlice";
import { fetchUserProfile } from "./helperAuth";
import Settings from "./Settings";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import MyComplaintsPage from "./MyComplaintsPage";
import SubmitComplaint from "./SubmitComplaint";
import AdminDashboard from "./AdminDashboard";
import AdminSettings from "./AdminSettings";
import AdminComplaintDetails from "./AdminComplaintDetails"; // Imported
import UserManagement from "./UserManagement"; // Added
import Analytics from "./Analytics";
import CommunityView from "./CommunityView";
import ComplaintDetails from "./ComplaintDetails";
import Home from "./Home";

// Protected Route Component
function ProtectedRoute({ element, requiredRole }) {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsChecking(false);
        dispatch(setLoading(false));
        return;
      }

      if (!user) {
        try {
          dispatch(setLoading(true));
          const profileData = await fetchUserProfile(token);
          dispatch(setUser(profileData));
          dispatch(setLoading(false));
          setIsChecking(false);
        } catch (err) {
          console.error('Auth check failed:', err);
          dispatch(setToken(null));
          dispatch(setLoading(false));
          setIsChecking(false);
        }
      } else {
        dispatch(setLoading(false));
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [token, user, dispatch]);

  if (isChecking || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>;
  }

  if (!token || !user) {
    return <Navigate to="/" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/submit-complaint'} />;
  }

  return element;
}

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <LoginForm /> },
  { path: "/signup", element: <SignupForm /> },

  // User routes
  { path: "/settings", element: <ProtectedRoute element={<Settings />} requiredRole="member" /> },
  { path: "/complaints", element: <ProtectedRoute element={<MyComplaintsPage />} requiredRole="member" /> },
  { path: "/submit-complaint", element: <ProtectedRoute element={<SubmitComplaint />} requiredRole="member" /> },
  { path: "/community", element: <ProtectedRoute element={<CommunityView />} requiredRole="member" /> },
  { path: "/complaint/:id", element: <ProtectedRoute element={<ComplaintDetails />} requiredRole="member" /> },


  // Admin routes
  { path: "/admin-dashboard", element: <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" /> },
  { path: "/user-management", element: <ProtectedRoute element={<UserManagement />} requiredRole="admin" /> },
  { path: "/analytics", element: <ProtectedRoute element={<Analytics />} requiredRole="admin" /> },
  { path: "/setting", element: <ProtectedRoute element={<AdminSettings />} requiredRole="admin" /> },
  { path: "/admin/complaint/:id", element: <ProtectedRoute element={<AdminComplaintDetails />} requiredRole="admin" /> },

]);

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      dispatch(setToken(storedToken));
    }
  }, [dispatch]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;