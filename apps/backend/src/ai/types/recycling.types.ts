// src/types/recycling.types.ts
export type RecyclingRequest = {
  imageUrl: string;
};

export type MaterialInfo = {
  name: string;
  quantity: number;
  description: string;
};

export type RecyclingResponse = {
  materials: MaterialInfo[];
};
