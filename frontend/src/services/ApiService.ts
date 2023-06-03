import axios from "axios";
import { IApiService } from "../interfaces/ApiService";

const baseURL = `http://localhost:3000`; // same machine
// const baseURL = `http://192.168.121.118:3000`; // in local net

export const ApiAdapter = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// following CRUD naming convetion
export const ApiService: IApiService = {
  createResume: (data: { data: string }) =>
    ApiAdapter.post(`upload-resume`, data),
  readResumes: (tags: string[]) =>
    ApiAdapter.get("list", {
      params: {
        tags: JSON.stringify(tags),
      },
    }),
  readResume: (id: string) => ApiAdapter.get(`resume/${id}`),
};
