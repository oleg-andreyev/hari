import axios from "axios";
import { IApiService } from "../interfaces/ApiService";

// const baseURL = `http://localhost:3000`; // same machine
// const baseURL = `http://51.124.115.34`; // prod
// const baseURL = `http://192.168.121.118:3000`; // in local net
const baseURL = 'https://hackcodex-hari-api.azurewebsites.net/';

export const ApiAdapter = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// following CRUD naming convetion
export const ApiService: IApiService = {
  createResume: (data: { data: string }) =>
    ApiAdapter.post(`api/upload-resume`, data),
  createResumeFiles: (data: { data: string }) =>
    ApiAdapter.post(`api/upload-files`, data),
  readResumes: ({ tags, companies }) =>
    ApiAdapter.get("api/list", {
      params: {
        tags: JSON.stringify(tags),
        companies: JSON.stringify(companies),
      },
    }),
  readResume: (id: string) => ApiAdapter.get(`api/resume/${id}`),
};
