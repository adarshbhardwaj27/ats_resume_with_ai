/**
 * AI Service Factory
 * 
 * Switches between OpenAI and Gemini APIs based on AI_PROVIDER env variable.
 * 
 * Usage:
 *   const aiService = require('./aiService');
 *   const result = await aiService.analyzeResume(latex, jobDescription);
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

let aiService;

if (AI_PROVIDER === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is required when AI_PROVIDER=gemini');
    }
    aiService = require('./geminiService');
    console.log('Using Gemini API for resume analysis');
} else if (AI_PROVIDER === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required when AI_PROVIDER=openai');
    }
    aiService = require('./openaiService');
    console.log('Using OpenAI API for resume analysis');
} else {
    throw new Error(`Invalid AI_PROVIDER: ${AI_PROVIDER}. Must be 'openai' or 'gemini'.`);
}

module.exports = aiService;
