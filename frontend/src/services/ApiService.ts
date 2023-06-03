import axios from "axios";
import { IApiService } from "../interfaces/ApiService";

// const baseURL = `http://localhost:3000`; // same machine
const baseURL = `http://192.168.121.118:3000`; // in local net

export const ApiAdapter = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ApiService: IApiService = {
  createResume: (data) => ApiAdapter.post(`upload-resume`, data),
};
