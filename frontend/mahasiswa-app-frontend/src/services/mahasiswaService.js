import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});


apiClient.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const mahasiswaService = {
  async getMahasiswa() {
    try {
      const response = await apiClient.get("/mahasiswa");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Gagal mengambil data mahasiswa"
      );
    }
  },


  async addMahasiswa(mahasiswaData) {
    try {
      const response = await apiClient.post("/mahasiswa", mahasiswaData);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Gagal menambahkan mahasiswa";
      throw new Error(errorMessage);
    }
  },


  async healthCheck() {
    try {
      const response = await axios.get("http://localhost:3000/");
      return response.data;
    } catch (error) {
      throw new Error("Backend tidak dapat diakses");
    }
  },
};
