<BrowserRouter>
  <AuthProvider>
    <Navbar />

    <Routes>

      {/* Public homepage */}
      <Route path="/" element={<Home />} />

      {/* Guest-only pages */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Student-only pages */}
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Route>

      {/* Admin-only pages */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

    </Routes>
  </AuthProvider>
</BrowserRouter>