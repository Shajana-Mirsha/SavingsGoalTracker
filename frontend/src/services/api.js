import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// AUTH
export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

// SAVINGS GOALS
export const createGoal = (data, token) =>
  API.post("/goals", data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getGoals = (token) =>
  API.get("/goals", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });