
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";

import Navbar from "./components/layouts/Navbar.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/student/DashBoard.jsx";
import Profile from "./pages/student/Profile.jsx";
import Jobs from "./pages/student/Jobs.jsx";
import Applications from "./pages/student/Application.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import Companies from "./pages/admin/Companies.jsx";
import AdminJobs from "./pages/admin/Jobs.jsx";
import Students from "./pages/admin/Students.jsx";
import AdminApplications from "./pages/admin/Applications.jsx";

import ProtectedRoute from "./routes/ProtectedRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Single Navbar */}
        <Navbar />

        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected student pages */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route
              path="/student"
              element={<Navigate to="/student/dashboard" replace />}
            />

            <Route
              path="/student/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/student/profile"
              element={<Profile />}
            />

            <Route
              path="/student/jobs"
              element={<Jobs />}
            />

            <Route
              path="/student/applications"
              element={<Applications />}
            />
          </Route>


          {/* Protected admin pages */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/companies"
              element={<Companies />} 
            />

            <Route
              path="/admin/jobs"
              element={<AdminJobs />}
            />

            <Route
              path="/admin/students"
              element={<Students />}
            />

            <Route
              path="/admin/applications"
              element={<AdminApplications />}
            />
          </Route>

          {/* Invalid URLs */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
