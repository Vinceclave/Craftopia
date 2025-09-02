export interface RecyclableItem {
  name: string;
  quantity: number;
  recyclable: boolean;
  description?: string;
}

export interface CraftProject {
  title: string;
  description: string;
  materials: string[];
  steps: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeMinutes: number;
}