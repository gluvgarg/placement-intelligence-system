const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    credentials: "include",

    headers: {
      ...(isFormData ? {} : {
        "Content-Type": "application/json",
      }),
      ...options.headers,
    },
  });

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

// Update Student Profile
export function updateUserProfile(profileData) {
  const formData = new FormData();

  formData.append("fullname", profileData.fullname);
  formData.append("mobile", profileData.mobile);

  formData.append("githubUrl", profileData.githubUrl || "");
  formData.append("linkedinUrl", profileData.linkedinUrl || "");

  formData.append("skills", JSON.stringify(profileData.skills));
  formData.append("education", JSON.stringify(profileData.education));
  formData.append("projects", JSON.stringify(profileData.projects));
  formData.append("experience", JSON.stringify(profileData.experience));

  if (profileData.resumeFile) {
    formData.append("resume", profileData.resumeFile);
  }

  return apiRequest("/users/update-profile", {
    method: "PUT",
    body: formData,
  });
}

// Update Profile Picture
export function updateUserAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiRequest("/users/update-avatar", {
    method: "PUT",
    body: formData,
  });
}

// Update Cover Image
export function updateUserCoverImage(file) {
  const formData = new FormData();
  formData.append("coverImage", file);

  return apiRequest("/users/update-cover-image", {
    method: "PUT",
    body: formData,
  });
}


// Get all active jobs
export function getAllJobs() {
  return apiRequest("/jobs", {
    method: "GET",
  });
}

// Get applications of logged-in student
export function getMyApplications() {
  return apiRequest("/applications/my", {
    method: "GET",
  });
}

// Apply for a job using the resume saved in the profile
export function createApplication(jobId) {
  return apiRequest(`/applications/${jobId}`, {
    method: "POST",
  });
}

// Withdraw an application
export function withdrawApplication(applicationId) {
  return apiRequest(
    `/applications/${applicationId}/withdraw`,
    {
      method: "PATCH",
      body: JSON.stringify({}),
    }
  );
}