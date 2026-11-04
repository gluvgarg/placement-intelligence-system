import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../services/api";

// Create authentication context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Derive role from the current user
  const role = user?.role?.toLowerCase() || null;

  const isStudent = role === "user";
  const isAdmin = role === "admin";

  // Fetch currently authenticated user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();

      // Supports the ApiResponse structure
      const currentUser =
        response?.data?.user ?? response?.data ?? null;

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      // No valid session or request failed
      setUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication when application starts
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    let loggedInUser = response?.data?.user ?? null;

    // Fall back to fetching the profile if needed
    if (!loggedInUser) {
      loggedInUser = await fetchCurrentUser();
    } else {
      setUser(loggedInUser);
    }

    if (!loggedInUser) {
      throw new Error("Login succeeded, but user profile could not be loaded.");
    }

    return response;
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      // Clear local authentication state
      setUser(null);
    }
  };

  // Shared authentication values
  const value = useMemo(
  () => ({
    user,
    role,
    isStudent,
    isAdmin,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    fetchCurrentUser,
  }),
  [user, role, isStudent, isAdmin, loading, fetchCurrentUser]
);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
};
