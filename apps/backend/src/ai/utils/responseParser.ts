import { AppError } from "../../utils/error";

export function parseResponse(aiResponse: string): any {
  try {
    // Remove any potential markdown code blocks
    let cleanResponse = aiResponse.trim();
    
    // Remove ```json and ``` if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Find the first { and last } to extract just the JSON object
    const firstBrace = cleanResponse.indexOf('{');
    const lastBrace = cleanResponse.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error('No valid JSON object found in response');
    }
    
    const jsonString = cleanResponse.slice(firstBrace, lastBrace + 1);
    
    // Parse the JSON
    const parsed = JSON.parse(jsonString);
    
    // Validate required fields
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Parsed response is not a valid object');
    }
    
    // Check for required fields
    const requiredFields = ['status', 'points_awarded', 'ai_confidence_score', 'verification_type', 'admin_notes'];
    for (const field of requiredFields) {
      if (!(field in parsed)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Ensure numeric fields are properly typed
    parsed.points_awarded = Number(parsed.points_awarded) || 0;
    parsed.ai_confidence_score = Number(parsed.ai_confidence_score) || 0;
    
    // Ensure confidence score is within bounds
    parsed.ai_confidence_score = Math.max(0, Math.min(1, parsed.ai_confidence_score));
    
    return parsed;
    
  } catch (error: any) {
    console.error('Error parsing AI response:', error);
    console.error('Raw response:', aiResponse);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

// Helper function to sanitize AI responses for logging
export const sanitizeForLog = (text: string, maxLength = 200): string => {
    if (!text) return 'null';
    
    const sanitized = text
        .replace(/[\r\n\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
    return sanitized.length > maxLength 
        ? sanitized.substring(0, maxLength) + '...'
        : sanitized;
};
