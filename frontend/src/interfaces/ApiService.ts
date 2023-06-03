import { AxiosResponse } from "axios";

export interface IApiService {
  createResume(data: any): Promise<AxiosResponse<any>>;
}
