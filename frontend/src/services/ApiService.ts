import axios from "axios";
import { IApiService } from "../interfaces/ApiService";

const baseURL = `http://localhost:3000`;

export const ApiAdapter = axios.create({
  baseURL,
  timeout: 2000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ApiService: IApiService = {
  createResume: (data) => ApiAdapter.post(`upload-resume`, {data}),
};
