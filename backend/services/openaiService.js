const OpenAI = require('openai');
const { SYSTEM_PROMPT, calculateMatchScore, extractKeywords } = require('./aiCommon');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

Analyze this resume against the job description and provide minimal, specific edits to improve alignment. Return ONLY valid JSON.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
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
            temperature: 0.7,
            max_tokens: 2000,
        });

        const content = response.choices[0].message.content.trim();

        // Parse and validate JSON response
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse OpenAI response:', content);
            throw new Error('Invalid JSON response from OpenAI');
        }

        // Validate response structure
        if (!parsedResponse.changes || !Array.isArray(parsedResponse.changes)) {
            throw new Error('Invalid response format: missing changes array');
        }

        // Validate each change object
        parsedResponse.changes.forEach((change, index) => {
            if (!change.original || !change.updated || !change.reason) {
                throw new Error(
                    `Invalid change format at index ${index}: missing original, updated, or reason`
                );
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
            model: 'gpt-3.5-turbo',
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
            temperature: 0.7,
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
            console.error(`Failed to parse OpenAI section response for ${sectionName}`);
            throw new Error(`Invalid JSON response from OpenAI for ${sectionName}: ${e.message}`);
        }

        // Validate section response structure
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
        console.error(`Error analyzing section ${sectionName} with OpenAI:`, error.message);
        throw error;
    }
}

module.exports = {
    analyzeResume,
    analyzeSectionForATS,
};
