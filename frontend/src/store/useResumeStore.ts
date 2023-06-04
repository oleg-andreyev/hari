import create, { State } from "zustand";

import { ApiService } from "../services/ApiService";
import { IResume } from "../interfaces/Resume";

// REMOVE WHEN USIGN REAL API
import sampleData from "./sample";

type ResumesMap = Map<IResume["resume_id"], IResume>;

//@ts-ignore "State" is deprecated
export interface ICustomersStore extends State {
  // data
  resumes: ResumesMap;
  error: string;
  // actions
  createResume(data: any): Promise<any>;
  readResumes(tags: string[]): Promise<IResume[]>;
  readResume(id: string): Promise<IResume | undefined>;
}

export const useResumeStore = create<ICustomersStore>((set, get) => ({
  resumes: new Map(),
  error: "",
  readResumes: async (tags: string[]) => {
    set({ error: "" });
    try {
      // TODO: cache query params (tags), return cached order if any, else sent request
      //
      //
      const resumes = (await ApiService.readResumes(tags)).data;

      // Start of REMOVE
      if (!resumes.length) {
        resumes.push(...sampleData);
      }
      // add random score, can't reassign, thus need to mutate
      resumes.forEach((resume) => {
        resume.score = Math.floor(Math.random() * 100) / 10;
      });
      resumes.sort((a, b) => b.score - a.score);
      // End of REMOVE

      const updatedResumesMap = new Map();
      resumes.forEach((resume) => {
        updatedResumesMap.set(resume.resume_id.toString(), resume);
      });
      set({
        resumes: updatedResumesMap,
      });
      return resumes;
    } catch (err: any) {
      // TODO: extract from error msg
      set({
        error: "Could no retrieve list of Resumes!",
      });
      console.warn(err);
      return [];
    }
  },
  readResume: async (id: string) => {
    set({ error: "" });
    const { resumes } = get();
    const resume = resumes.get(id);
    if (resume) return resume;
    try {
      const resume = (await ApiService.readResume(id)).data;
      if (resume) {
        const updatedResumesMap = new Map(resumes);
        updatedResumesMap.set(resume.resume_id, resume);
        set({
          resumes: updatedResumesMap,
        });
      }
      return resume;
    } catch (err: any) {
      // TODO: extract from error msg
      set({
        error: "Could not get Resume, check id an try again.",
      });
      console.warn(err);
      return;
    }
  },
  createResume: async (data) => {
    set({ error: "" });
    try {
      return (await ApiService.createResume(data)).data;
    } catch (err: any) {
      // TODO: extract from error msg
      set({
        error: "Could not upload Resume!",
      });
      console.warn(err);
      return;
    }
  },
}));
