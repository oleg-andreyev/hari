import create, { State } from "zustand";
import { ApiService } from "../services/ApiService";

type ResumesMap = Map<string, any>;

//@ts-ignore
export interface ICustomersStore extends State {
  // data
  resumes: ResumesMap;
  // actions
  createResume(data: any): Promise<any>;
}

export const useResumeStore = create<ICustomersStore>((set, get) => ({
  resumes: new Map(),
  createResume: async (data) => {
    try {
      const response = await ApiService.createResume({ data });
      const resume = response.data;
      const { resumes } = get();
      const updatedResumes = new Map(resumes);
      updatedResumes.set(resume.id, resume);
      set({
        resumes: updatedResumes,
      });
      return resume;
    } catch (err: any) {
      // console.warn(err);
      return {
        summary: "test",
      };
    }
  },
}));
