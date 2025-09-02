import { RecyclableItem, CraftProject } from '../types';

export function generateCraftImage(items: RecyclableItem[], craft: CraftProject): string {
  const materials = items
    .filter(item => item.recyclable)
    .map(item => `${item.quantity}x ${item.name}`)
    .join(', ');
  
  const prompt = `Beautiful DIY craft project: "${craft.title}". Made from recycled ${materials}. Professional photo, clean background, inspiring upcycling result.`;
  
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&enhance=true&safe=true`;
}