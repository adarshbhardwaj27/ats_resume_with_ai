const aiService = require('./aiService');

const SECTION_PROMPTS = {
    EXPERIENCE: `You are an ATS (Applicant Tracking System) expert. Review this EXPERIENCE section and suggest minimal edits to:
1. Include job-relevant keywords from the job description
2. Use stronger action verbs
3. Quantify achievements where possible
4. Keep LaTeX formatting intact

Return a JSON response with section improved for ATS matching:
{
  "sectionContent": "improved section content with \\\\resumeItem{} items",
  "suggestions": [
    { "original": "text", "updated": "text", "reason": "why" }
  ],
  "keywordMatches": ["keyword1", "keyword2"]
}`,

    PROJECTS: `You are an ATS expert. Review this PROJECTS section and suggest edits to:
1. Highlight technologies matching the job description
2. Emphasize measurable impact and results
3. Keep the most relevant projects for this role
4. Preserve LaTeX formatting

Return JSON:
{
  "sectionContent": "improved projects section",
  "suggestions": [
    { "original": "text", "updated": "text", "reason": "why" }
  ],
  "keywordMatches": ["keyword1", "keyword2"]
}`,

    TECHNICAL_SKILLS: `You are an ATS expert. Review this TECHNICAL SKILLS section and:
1. Prioritize skills matching the job description
2. Reorder to put most relevant skills first
3. Add any missing relevant skills if obvious
4. Preserve LaTeX formatting

Return JSON:
{
  "sectionContent": "improved skills section",
  "suggestions": [
    { "original": "text", "updated": "text", "reason": "why" }
  ],
  "keywordMatches": ["keyword1", "keyword2"]
}`,

    EDUCATION: `You are an ATS expert. Review this EDUCATION section:
1. Ensure degrees and certifications are clearly formatted
2. Highlight relevant coursework if applicable
3. Include GPA if strong
4. Preserve LaTeX formatting

Return JSON:
{
  "sectionContent": "education section (usually minor changes)",
  "suggestions": [],
  "keywordMatches": []
}`,

    CERTIFICATIONS: `You are an ATS expert. Review this CERTIFICATIONS section:
1. Highlight certifications relevant to the job
2. Include dates where applicable
3. Emphasize prestigious or required certifications
4. Preserve LaTeX formatting

Return JSON:
{
  "sectionContent": "improved certifications section",
  "suggestions": [],
  "keywordMatches": ["certification1", "certification2"]
}`,
};

async function analyzeSectionForATS(sectionName, sectionContent, jobDescription) {
    const sectionPrompt = SECTION_PROMPTS[sectionName];

    if (!sectionPrompt) {
        throw new Error(`Unknown section: ${sectionName}`);
    }

    try {
        // Use the dedicated section analysis function from the AI service
        // It handles the section-specific response format with suggestions
        const sectionAnalysis = await aiService.analyzeSectionForATS(
            sectionName,
            sectionContent,
            jobDescription,
            sectionPrompt
        );

        return {
            section: sectionName,
            improvements: sectionAnalysis,
            success: true,
        };
    } catch (err) {
        throw new Error(`Failed to analyze ${sectionName} section: ${err.message}`);
    }
}

module.exports = {
    analyzeSectionForATS,
    SECTION_PROMPTS,
};
