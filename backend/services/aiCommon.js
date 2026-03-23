const SYSTEM_PROMPT = `You are an expert resume editor and ATS optimization assistant.

You will be given:
1. A LaTeX resume template
2. A job description

Your task:
- Identify relevant keywords from the job description
- Compare with resume
- Suggest ONLY minimal line-level edits

STRICT RULES:
- DO NOT rewrite entire resume
- DO NOT modify LaTeX commands
- ONLY edit content inside lines
- DO NOT hallucinate experience
- Return ONLY valid JSON, no other text

OUTPUT:
Return valid JSON (and ONLY JSON):
{
  "changes": [
    {
      "original": "exact original line",
      "updated": "improved line",
      "reason": "why this change helps match the job description"
    }
  ]
}

If no changes needed, return: {"changes": []}`;

function calculateMatchScore(resume, jobDescription, changes) {
    const resumeText = resume.toLowerCase();
    const jobText = jobDescription.toLowerCase();

    // Extract keywords from job description
    const keywords = extractKeywords(jobDescription);

    // Count how many keywords are found in resume
    const foundKeywords = keywords.filter((keyword) =>
        resumeText.includes(keyword.toLowerCase())
    );

    const keywordMatchScore = (foundKeywords.length / keywords.length) * 100;

    // Calculate change impact (more changes = more potential improvement)
    const changeImpactScore = Math.min(changes.length * 10, 40);

    // Combined score
    const score = Math.round(
        keywordMatchScore * 0.6 + changeImpactScore * 0.4
    );

    return Math.min(100, score);
}

function extractKeywords(jobDescription) {
    // Extract meaningful words (remove common stop words)
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were', 'been', 'be', 'as', 'by', 'this', 'that', 'with', 'from', 'up', 'about', 'into', 'through', 'during',
    ]);

    const words = jobDescription
        .toLowerCase()
        .match(/\b[a-z]+(?:\+\+|\.net|\.js)?\b/g) || [];

    // Filter and deduplicate
    const keywords = Array.from(
        new Set(
            words
                .filter((word) => !stopWords.has(word) && word.length > 2)
                .slice(0, 20)
        )
    );

    return keywords;
}

module.exports = {
    SYSTEM_PROMPT,
    calculateMatchScore,
    extractKeywords,
};
