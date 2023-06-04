import create, { State } from "zustand";

import { ApiService } from "../services/ApiService";
import { IResume } from "../interfaces/Resume";
import { ICompany } from "../interfaces/Company";

type ResumesMap = Map<IResume["resume_id"], IResume>;

//@ts-ignore "State" is deprecated
export interface ICustomersStore extends State {
  // data
  resumes: ResumesMap;
  error: string;
  cache: Map<string, IResume["resume_id"][]>;
  companies: ICompany[];
  // actions
  createResume(data: any): Promise<any>;
  createResumeFiles(data: any): Promise<any>;
  readResumes(data: {
    tags: string[];
    companies: string[];
    exp: string;
  }): Promise<IResume[]>;
  readResume(id: string): Promise<IResume | undefined>;
}

export const useResumeStore = create<ICustomersStore>((set, get) => ({
  resumes: new Map(),
  error: "",
  cache: new Map(),
  companies: [],
  readResumes: async ({ tags, companies, exp }) => {
    set({ error: "" });
    try {
      // first try for cached results, before making new request
      const { cache, resumes } = get();
      const cacheId = [...tags, ...companies, exp]
        .sort()
        .map((item) => item.toLowerCase())
        .join(";");
      const cachedOrder = cache.get(cacheId);
      if (cachedOrder?.length) {
        let allResumesAreAvailable = true;
        const cachedResumes = cachedOrder.map<IResume>((resumeId) => {
          const foundResume = resumes.get(resumeId.toString());
          if (!foundResume) {
            // flag that some resume was not found, thus will need to refetch
            allResumesAreAvailable = false;
          }
          return foundResume as IResume; // hotfix, TODO
        });
        if (allResumesAreAvailable) {
          return cachedResumes;
        }
      }

      const { rows: fetchedResumes, companies: fetchedCompanies } = (
        await ApiService.readResumes({ tags, companies, exp })
      ).data;

      const updatedResumesMap = new Map();
      const resumeOrder: IResume["resume_id"][] = [];
      fetchedResumes.forEach((resume) => {
        const resumeId = resume.resume_id.toString();
        updatedResumesMap.set(resumeId, resume);
        resumeOrder.push(resumeId);
      });
      const updatedCache = new Map(cache);
      updatedCache.set(cacheId, resumeOrder);
      set({
        resumes: updatedResumesMap,
        cache: updatedCache,
        companies: [...get().companies, ...fetchedCompanies]
          .filter(
            (item, index, fullList) =>
              item?.key.trim() &&
              fullList.findIndex((x) => x.key === item.key) === index
          )
          .sort((a, b) => (a.key > b.key ? 1 : -1)),
      });
      return fetchedResumes;
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
    // const resume = resumes.get(id);
    // if (resume) return resume;
    // Always fetch actual "id" resume to get it's CV file blob
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
  createResumeFiles: async (data) => {
    set({ error: "" });
    try {
      return (await ApiService.createResumeFiles(data)).data;
    } catch (err: any) {
      // TODO: extract from error msg
      set({
        error: "Could not uploads Files!",
      });
      console.warn(err);
      return;
    }
  },
}));
