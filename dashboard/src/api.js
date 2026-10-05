import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3002",
  timeout: 10000,
});

// Turns any axios error into a human-readable message
export const getErrorMessage = (err) => {
  if (err.response?.data?.details?.length) {
    return err.response.data.details.join(", ");
  }
  if (err.response?.data?.error) {
    return err.response.data.error;
  }
  if (err.request) {
    return "Cannot reach the server. Is the backend running?";
  }
  return "Something went wrong";
};

export default api;
