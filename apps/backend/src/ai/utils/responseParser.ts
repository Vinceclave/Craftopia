import { AppError } from "../../utils/error";

export const parseResponse = (rawText: string | undefined) => {
    if (!rawText?.trim()) {
        throw new AppError('AI returned empty response', 500);
    }

    let cleanText = rawText.trim();
    
    // Remove common markdown wrappers
    const markdownPatterns = [
        /^```json\s*([\s\S]*?)\s*```$/,
        /^```\s*([\s\S]*?)\s*```$/,
        /^`{1,2}([\s\S]*?)`{1,2}$/
    ];
    
    for (const pattern of markdownPatterns) {
        const match = cleanText.match(pattern);
        if (match) {
            cleanText = match[1].trim();
            break;
        }
    }
    
    // Remove common prefixes/suffixes
    cleanText = cleanText
        .replace(/^(Here's the|Here is the|Response:|JSON:|Result:)\s*/i, '')
        .replace(/\s*(That's it|Hope this helps|Let me know if you need anything else)\.?$/i, '');

    if (!cleanText) {
        throw new AppError('AI response is empty after cleaning', 500);
    }

    // Validate JSON structure before parsing
    if (!cleanText.startsWith('{') && !cleanText.startsWith('[')) {
        console.error('Invalid JSON structure:', cleanText.substring(0, 100) + '...');
        throw new AppError('AI returned invalid JSON format - missing opening bracket', 500);
    }

    if (!cleanText.endsWith('}') && !cleanText.endsWith(']')) {
        console.error('Invalid JSON structure:', '...' + cleanText.substring(cleanText.length - 100));
        throw new AppError('AI returned invalid JSON format - missing closing bracket', 500);
    }

    try {
        const parsed = JSON.parse(cleanText);
        
        // Additional validation for common AI response issues
        if (parsed === null) {
            throw new AppError('AI returned null response', 500);
        }
        
        return parsed;
        
    } catch (parseError: any) {
        console.error('JSON Parse Error:', {
            error: parseError.message,
            rawText: rawText.substring(0, 500) + (rawText.length > 500 ? '...' : ''),
            cleanText: cleanText.substring(0, 500) + (cleanText.length > 500 ? '...' : '')
        });
        
        // Try to provide more specific error messages
        if (parseError.message.includes('Unexpected token')) {
            throw new AppError('AI returned malformed JSON - unexpected character', 500);
        }
        
        if (parseError.message.includes('Unexpected end')) {
            throw new AppError('AI returned incomplete JSON response', 500);
        }
        
        throw new AppError(`AI returned invalid JSON format: ${parseError.message}`, 500);
    }
};

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
