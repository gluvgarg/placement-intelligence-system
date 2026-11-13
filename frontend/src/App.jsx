
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
