import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://convo-ai-hdf2.onrender.com",
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
