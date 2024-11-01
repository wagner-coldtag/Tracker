import axios from "axios";

// Create Axios instance with base URL for API Gateway
const API = axios.create({ baseURL: "https://5ltkbz062m.execute-api.sa-east-1.amazonaws.com/prod/users" });

// Interceptor to include Authorization header with the bearer token
API.interceptors.request.use((req) => {
  if (localStorage.getItem("profile")) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("profile")).token}`;
  }
  return req;
});

// Function for signing in
export const signIn = (email, password) => API.post("/", {
  action: "login", Email: email, Password: password
},{ headers: { "Content-Type": "application/json" }
});