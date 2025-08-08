import { groq } from '../config/groq.config';
import { craftPrompts } from '../ai/prompts/craft.prompts';

/**
 * Generates a sustainable DIY craft project idea based on user-provided recyclable materials.
 *
 * @param userMaterials - The recyclable items provided by the user.
 * @returns A detailed, creative, and eco-friendly craft project idea.
 */

export const getCraftIdea = async (userMaterials: string): Promise<string> => {
  if (!groq.apiKey) throw new Error('GROQ_API_KEY is not set');

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: craftPrompts.system },
        { role: 'user', content: craftPrompts.user(userMaterials) },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.8,
      max_completion_tokens: 1200,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0].message.content ?? '';
  } catch (error: any) {
    console.error('Error generating craft idea:', error.message);
    throw new Error('Failed to generate craft idea from Groq');
  }
};
