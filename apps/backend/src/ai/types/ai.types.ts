export interface Craft {
  title: string;
  description: string;
  steps: string[];
}

export interface GenerateRequest {
  materials: string[];
  difficulty?: string;
  ageGroup?: string;
}

export interface ApiResponse {
  success: boolean;
  crafts?: Craft[];
  error?: string;
}