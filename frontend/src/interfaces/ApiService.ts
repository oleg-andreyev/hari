import { AxiosResponse } from "axios";
import { IResume } from "./Resume";
import { ICompany } from "./Company";

export interface IApiService {
  createResume(data: {
    data: string;
  }): Promise<AxiosResponse<IResume["resume_id"]>>;
  createResumeFiles(data: {
    data: any; // TODO
  }): Promise<AxiosResponse<IResume["resume_id"]>>;
  readResumes(tags: string[]): Promise<
    AxiosResponse<{
      rows: IResume[];
      companies: ICompany[];
    }>
  >;
  readResume(id: string): Promise<AxiosResponse<IResume>>;
}
