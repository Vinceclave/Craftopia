// src/types/craft.types.ts
export type AICraftRequest = {
  preferences: string[];
  materials: string[];
};

export type CraftIdea = {
  title: string;
  description: string;
  steps: string[];
  materialsUsed: string[];
  type: string;
};

export type AICraftResponse = {
  suggestions: CraftIdea[];
};
