import { AxiosResponse } from "axios";
import { IResume } from "./Resume";

export interface IApiService {
  createResume(data: {
    data: string;
  }): Promise<AxiosResponse<IResume["resume_id"]>>;
  readResumes(tags: string[]): Promise<AxiosResponse<IResume[]>>;
  readResume(id: string): Promise<AxiosResponse<IResume>>;
}
