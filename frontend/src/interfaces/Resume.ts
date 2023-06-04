export interface IResumeExperience {
  company: string;
  location: string;
  position: string;
  duration_in_months: number;
}

export interface IFile {
  data: ArrayBufferLike;
  type: string;
}

export interface IResume {
  resume_id: string;
  summary: string;
  email: string;
  name: string;
  technologies: string[];
  experience: IResumeExperience[];
  score: number;
  total_experience: number;
  file?: IFile;
}
