import { Groq } from 'groq-sdk';
import { CONFIG } from '@/ai/config';
import { Craft } from '@/ai/types/ai.types';

export class GroqService {
  private client = new Groq({ apiKey: CONFIG.groqApiKey });

  async generateCrafts(materials: string[], options: any = {}): Promise<Craft[]> {
    const prompt = this.buildPrompt(materials, options);
    
    const response = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: CONFIG.model,
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('🤖 Raw AI response:', content.substring(0, 200) + '...');
    
    return this.parseResponse(content);
  }

  private buildPrompt(materials: string[], options: any): string {
    let prompt = `Create 2-3 detailed craft ideas using these materials: ${materials.join(', ')}.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, no extra text.

Format:
{
  "crafts": [
    {
      "title": "Craft Name",
      "description": "What you'll make and why it's fun",
      "steps": [
        "Step 1: Detailed instruction with measurements and techniques",
        "Step 2: Continue with specific actions and timing",
        "Step 3: Include safety tips and visual cues",
        "Step 4: Add finishing touches and personalization"
      ]
    }
  ]
}

Make steps very detailed (15-25 words each) with:
- Specific measurements and techniques
- Safety reminders for tools
- Timing (drying, waiting, etc.)
- Visual cues and tips`;

    if (options.difficulty) prompt += `\nDifficulty: ${options.difficulty}`;
    if (options.ageGroup) prompt += `\nAge group: ${options.ageGroup}`;

    return prompt;
  }

  private parseResponse(content: string): Craft[] {
    try {
      // Clean up the response - remove markdown code blocks and extra whitespace
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '');
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.replace(/\s*```$/, '');
      }
      
      // Remove any extra text before or after JSON
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd);
      }
      
      console.log('🧹 Cleaned content:', cleanContent.substring(0, 200) + '...');
      
      const parsed = JSON.parse(cleanContent);
      const crafts = parsed.crafts || [];
      
      console.log(`✅ Successfully parsed ${crafts.length} crafts`);
      return crafts;
      
    } catch (error) {
      console.error('❌ Failed to parse response:', error);
      console.error('📄 Original content:', content);
      
      // Return empty array instead of throwing error
      return [];
    }
  }
}