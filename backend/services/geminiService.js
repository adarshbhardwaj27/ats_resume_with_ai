const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT, calculateMatchScore, extractKeywords, repairIncompleteJSON } = require('./aiCommon');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

Generate 10-15 comprehensive, specific suggestions for improvement.

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
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 16384,
            },
        });

        const response = result.response;
        let content = response.text().trim();

        // Remove all markdown code fence markers and language identifiers
        content = content
            .replace(/```(json)?[\s\n]*/gi, '') // Remove all code fence markers
            .replace(/^json[\s\n]*/i, '') // Remove "json" marker at start
            .trim();

        // Extract JSON object/array from surrounding text
        const jsonStart = content.indexOf('{');
        if (jsonStart > 0) {
            content = content.substring(jsonStart);
        }

        // Parse and validate JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (e) {
            // Try to repair incomplete JSON
            try {
                const repairedContent = repairIncompleteJSON(content);
                parsedResponse = JSON.parse(repairedContent);
            } catch (e2) {
                // Log more detailed error info for debugging
                console.error('Failed to parse Gemini response');
                console.error('Raw response length:', content.length);
                console.error('First 500 chars:', content.substring(0, 500));
                console.error('Last 200 chars:', content.substring(Math.max(0, content.length - 200)));
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

        // Validate each change object, add default reason if missing
        parsedResponse.changes.forEach((change, index) => {
            if (!change.original || typeof change.original !== 'string') {
                throw new Error(`Change ${index}: missing or invalid 'original' field`);
            }
            if (!change.updated || typeof change.updated !== 'string') {
                throw new Error(`Change ${index}: missing or invalid 'updated' field`);
            }
            // Reason may be cut off due to truncation, provide default
            if (!change.reason || typeof change.reason !== 'string') {
                change.reason = 'Improves ATS alignment with job requirements';
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
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 16384,
            },
        });

        const response = result.response;
        let content = response.text().trim();

        // Remove all markdown code fence markers and language identifiers
        content = content
            .replace(/```(json)?[\s\n]*/gi, '') // Remove all code fence markers
            .replace(/^json[\s\n]*/i, '') // Remove "json" marker at start
            .trim();

        // Extract JSON object from surrounding text
        const sectionJsonStart = content.indexOf('{');
        if (sectionJsonStart > 0) {
            content = content.substring(sectionJsonStart);
        }

        // Parse and validate JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (e) {
            // Try to repair incomplete JSON
            try {
                const repairedContent = repairIncompleteJSON(content);
                parsedResponse = JSON.parse(repairedContent);
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

        // Fill in missing reasons
        if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
            parsedResponse.suggestions.forEach(suggestion => {
                if (!suggestion.reason || typeof suggestion.reason !== 'string') {
                    suggestion.reason = 'Improves ATS alignment';
                }
            });
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
