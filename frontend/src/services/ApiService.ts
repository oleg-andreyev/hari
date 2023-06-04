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
  createResume: (data) => ApiAdapter.post(`api/upload-resume`, data),
  createResumeFiles: (data) =>
    ApiAdapter.post(`api/upload-files`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  readResumes: ({ tags, companies, exp }) => {
    const params: Record<string, string> = {};
    if (tags?.length) params.tags = JSON.stringify(tags);
    if (companies?.length) params.companies = JSON.stringify(companies);
    if (exp?.length) params.exp = exp;
    return ApiAdapter.get("api/list", { params });
  },
  readResume: (id: string) => ApiAdapter.get(`api/resume/${id}`),
};
