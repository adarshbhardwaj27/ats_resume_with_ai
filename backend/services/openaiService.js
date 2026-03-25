const OpenAI = require('openai');
const { SYSTEM_PROMPT, calculateMatchScore, extractKeywords } = require('./aiCommon');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Repair incomplete/truncated JSON by finding the last complete object
 */
function repairIncompleteJSON(jsonString) {
    // Try to find last complete object by counting braces
    let braceCount = 0;
    let lastCompleteIndex = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{' || char === '[') {
                braceCount++;
            } else if (char === '}' || char === ']') {
                braceCount--;
                if (braceCount === 0) {
                    lastCompleteIndex = i;
                }
            }
        }
    }

    // If we found a complete object, use everything up to and including that
    if (lastCompleteIndex > 0) {
        return jsonString.substring(0, lastCompleteIndex + 1);
    }

    // Otherwise, try to add a minimal closing
    return jsonString;
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

        const userPrompt = `
LaTeX Resume:
${latexResume}

Job Description:
${jobDescription}

Analyze this resume comprehensively against the job description and provide 10-15 in-depth, specific edits to maximize ATS alignment and impact. Suggest improvements for every relevant section. Return ONLY valid JSON.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            temperature: 0.9,
            max_tokens: 8000,
        });

        const content = response.choices[0].message.content.trim();

        // Remove markdown code fence markers if present
        let cleanContent = content
            .replace(/^```(json)?[\s\n]*/i, '') // Remove opening fence
            .replace(/[\s\n]*```$/i, '') // Remove closing fence
            .trim();

        // Parse and validate JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanContent);
        } catch (e) {
            // Try to repair incomplete JSON
            try {
                const repairedContent = repairIncompleteJSON(cleanContent);
                parsedResponse = JSON.parse(repairedContent);
            } catch (e2) {
                console.error('Failed to parse OpenAI response:', cleanContent);
                throw new Error('Invalid JSON response from OpenAI');
            }
        }

        // Validate response structure
        if (!parsedResponse.changes || !Array.isArray(parsedResponse.changes)) {
            throw new Error('Invalid response format: missing changes array');
        }

        // Validate each change object, add default reason if missing
        parsedResponse.changes.forEach((change, index) => {
            if (!change.original || typeof change.original !== 'string') {
                throw new Error(`Change ${index}: missing or invalid 'original' field`);
            }
            if (!change.updated || typeof change.updated !== 'string') {
                throw new Error(`Change ${index}: missing or invalid 'updated' field`);
            }
            // Reason may be missing, provide default
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
        console.error('Error analyzing resume:', error.message);
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

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: sectionPrompt,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            temperature: 0.9,
            max_tokens: 2048,
        });

        let content = response.choices[0].message.content.trim();

        // Remove markdown code fences if present
        content = content
            .replace(/^```(json)?[\s\n]*/i, '')
            .replace(/[\s\n]*```$/i, '')
            .trim();

        // Parse JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (e) {
            // Try to repair incomplete JSON
            try {
                const repairedContent = repairIncompleteJSON(content);
                parsedResponse = JSON.parse(repairedContent);
            } catch (e2) {
                console.error(`Failed to parse OpenAI section response for ${sectionName}`);
                throw new Error(`Invalid JSON response from OpenAI for ${sectionName}: ${e.message}`);
            }
        }

        // Validate section response structure
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
        console.error(`Error analyzing section ${sectionName} with OpenAI:`, error.message);
        throw error;
    }
}

module.exports = {
    analyzeResume,
    analyzeSectionForATS,
};
