const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT, calculateMatchScore, extractKeywords } = require('./aiCommon');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sanitize JSON string by escaping unescaped newlines and control characters within string values
 */
function sanitizeJSONString(jsonString) {
    // Replace actual newlines, tabs, and carriage returns with escape sequences
    // This handles cases where LaTeX content contains actual newlines inside JSON string values
    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];

        if (escapeNext) {
            result += char;
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            result += char;
            escapeNext = true;
            continue;
        }

        if (char === '"' && !escapeNext) {
            inString = !inString;
            result += char;
            continue;
        }

        if (inString) {
            // Within a string value - escape control characters
            if (char === '\n') {
                result += '\\n';
            } else if (char === '\r') {
                result += '\\r';
            } else if (char === '\t') {
                result += '\\t';
            } else {
                result += char;
            }
        } else {
            result += char;
        }
    }

    return result;
}

async function analyzeResume(latexResume, jobDescription) {
    try {
        // Validate inputs
        if (!latexResume || !latexResume.trim()) {
            throw new Error('LaTeX resume cannot be empty');
        }
        if (!jobDescription || !jobDescription.trim()) {
            throw new Error('Job description cannot be empty');
        }

        const userPrompt = `IMPORTANT: You MUST respond with ONLY raw JSON, NO markdown code blocks, NO extra text.

${SYSTEM_PROMPT}

LaTeX Resume:
${latexResume}

Job Description:
${jobDescription}

RESPOND WITH THIS JSON STRUCTURE ONLY (no markdown, no backticks, no extra text):
{
  "changes": [
    {
      "original": "text from resume",
      "updated": "improved text",
      "reason": "why this change helps match job description"
    }
  ]
}

Ensure each change object has all three fields. Keep reasons concise but complete. Return valid JSON only.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
            },
        });

        const response = result.response;
        let content = response.text().trim();

        // Remove all markdown code fence markers and language identifiers
        content = content
            .replace(/^```(json)?[\s\n]*/i, '') // Remove opening fence with optional "json"
            .replace(/[\s\n]*```$/i, '') // Remove closing fence
            .replace(/^json[\s\n]*/i, '') // Remove "json" marker at start (no backticks)
            .replace(/^(.*?)(\{[\s\S]*)$/, '$2') // Keep everything from first `{` onwards
            .trim();

        // Parse and validate JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (e) {
            // Try to fix unescaped newlines and control characters in JSON strings
            try {
                content = sanitizeJSONString(content);
                parsedResponse = JSON.parse(content);
            } catch (e2) {
                // Log more detailed error info for debugging
                console.error('Failed to parse Gemini response');
                console.error('Raw response length:', content.length);
                console.error('First 500 chars:', content.substring(0, 500));
                console.error('Parse error:', e.message);
                throw new Error(`Invalid JSON response from Gemini: ${e.message}`);
            }
        }

        // Validate response structure
        if (!parsedResponse.changes || !Array.isArray(parsedResponse.changes)) {
            throw new Error('Invalid response format: missing or invalid changes array');
        }

        if (parsedResponse.changes.length === 0) {
            throw new Error('No changes provided in response');
        }

        // Validate each change object
        parsedResponse.changes.forEach((change, index) => {
            if (!change.original || typeof change.original !== 'string') {
                throw new Error(`Change ${index}: missing or invalid 'original' field`);
            }
            if (!change.updated || typeof change.updated !== 'string') {
                throw new Error(`Change ${index}: missing or invalid 'updated' field`);
            }
            if (!change.reason || typeof change.reason !== 'string') {
                throw new Error(`Change ${index}: missing or invalid 'reason' field`);
            }
        });

        // Calculate match score (0-100)
        const matchScore = calculateMatchScore(
            latexResume,
            jobDescription,
            parsedResponse.changes
        );

        return {
            changes: parsedResponse.changes,
            matchScore,
            jobKeywords: extractKeywords(jobDescription),
        };
    } catch (error) {
        console.error('Error analyzing resume with Gemini:', error.message);
        throw error;
    }
}

/**
 * Analyze a single resume section for ATS optimization
 * Returns section-specific response format with suggestions array
 */
async function analyzeSectionForATS(sectionName, sectionContent, jobDescription, sectionPrompt) {
    try {
        const userPrompt = `Job Description:
${jobDescription}

---

${sectionName} Section:
${sectionContent}

---

Analyze and tailor this section for ATS matching. Return ONLY valid JSON with no markdown or extra text.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: sectionPrompt + '\n\n' + userPrompt }] }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
            },
        });

        const response = result.response;
        let content = response.text().trim();

        // Remove all markdown code fence markers and language identifiers
        content = content
            .replace(/^```(json)?[\s\n]*/i, '') // Remove opening fence with optional "json"
            .replace(/[\s\n]*```$/i, '') // Remove closing fence
            .replace(/^json[\s\n]*/i, '') // Remove "json" marker at start (no backticks)
            .replace(/^(.*?)(\{[\s\S]*)$/, '$2') // Keep everything from first `{` onwards
            .trim();

        // Parse and validate JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (e) {
            // Try to fix unescaped newlines and control characters in JSON strings
            try {
                // Replace actual newlines/tabs inside string values with escape sequences
                content = sanitizeJSONString(content);
                parsedResponse = JSON.parse(content);
            } catch (e2) {
                console.error(`Failed to parse Gemini section response for ${sectionName}`);
                console.error('Raw response length:', content.length);
                console.error('First 500 chars:', content.substring(0, 500));
                console.error('Parse error:', e.message);
                throw new Error(`Invalid JSON response from Gemini for ${sectionName}: ${e.message}`);
            }
        }

        // Validate section response structure (allows empty suggestions for some sections)
        if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
            parsedResponse.suggestions = [];
        }
        if (!parsedResponse.keywordMatches || !Array.isArray(parsedResponse.keywordMatches)) {
            parsedResponse.keywordMatches = [];
        }

        return {
            sectionContent: parsedResponse.sectionContent || sectionContent,
            suggestions: parsedResponse.suggestions,
            keywordMatches: parsedResponse.keywordMatches,
            matchScore: calculateMatchScore(sectionContent, jobDescription, parsedResponse.suggestions),
        };
    } catch (error) {
        console.error(`Error analyzing section ${sectionName} with Gemini:`, error.message);
        throw error;
    }
}

module.exports = {
    analyzeResume,
    analyzeSectionForATS,
};
