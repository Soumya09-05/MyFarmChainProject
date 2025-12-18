import axios from "axios";

// Create a reusable secure Axios instance (attaches JWT token)
export const API = axios.create({
  baseURL: "http://localhost:8082/api/users",
});

// 🌟 NEW: Create a public Axios instance that does NOT attach the token
// We use this for the analyze-image endpoint to bypass security conflicts.
export const PUBLIC_API = axios.create({
  baseURL: "http://localhost:8082/api/users",
});


// Attach token automatically if available
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Login function (uses API)
export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/login", { email, password });
    const { user, token } = response.data;

    if (!user || !token) throw new Error("Invalid login response");

    const userWithToken = { ...user, token };
    localStorage.setItem("user", JSON.stringify(userWithToken));

    return userWithToken;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

// Register function (uses API)
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/register", userData);
    return response.data.user || response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Registration failed");
  }
};

// Logout function
export const logoutUser = () => {
  localStorage.removeItem("user");
};