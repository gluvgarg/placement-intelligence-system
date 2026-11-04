const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const response = await fetch(
    `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`,
    {
      ...options,

      // Send and receive HTTP-only cookies
      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  // Safely parse response
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response received from server.");
  }

  if (!response.ok) {
    throw new Error(
      result.message || "Something went wrong."
    );
  }

  return result;
}

// Register User
export function registerUser(formData) {
  const { fullname, email, mobile, password } = formData;

  return apiRequest("/users/register", {
    method: "POST",
    body: JSON.stringify({
      fullname: fullname.trim(),
      email: email.trim().toLowerCase(),
      mobile: Number(mobile),
      password,
    }),
  });
}

// Login User
export function loginUser(formData) {
  return apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

// Get Logged-in User
export function getCurrentUser() {
  return apiRequest("/users/profile", {
    method: "GET",
  });
}

// Logout User
export function logoutUser() {
  return apiRequest("/users/logout", {
    method: "POST",
  });
}

// Refresh Access Token
export function refreshAccessToken() {
  return apiRequest("/users/refresh-token", {
    method: "POST",
  });
}
