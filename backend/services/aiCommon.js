const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume optimizer.

You will be given a LaTeX resume and a job description. Your goal is to maximize the resume's ATS score.

## HOW ATS SYSTEMS WORK:
- ATS scans for EXACT keyword matches from the job description
- Keywords in section headers and bullet points are weighted highest
- Multi-word phrases (e.g., "machine learning", "project management") must appear as exact phrases
- Both hard skills (technologies, tools) and soft skills matter, but hard skills are weighted 2-3x more
- Quantified achievements (numbers, percentages, dollar amounts) score significantly higher
- Action verbs at the start of bullet points improve parsing
- Keyword DENSITY matters — important terms should appear 2-3 times naturally across the resume

## YOUR ANALYSIS APPROACH:
1. Extract ALL required/preferred skills, technologies, tools, and qualifications from the job description
2. Check which ones are MISSING or UNDERREPRESENTED in the resume
3. For each missing keyword, find the most natural place to incorporate it
4. Prioritize changes by impact: missing hard skills > missing soft skills > rephrasing > formatting
5. Use the EXACT phrasing from the job description (e.g., if JD says "CI/CD pipelines", use that exact phrase, not "continuous integration")

## CHANGE CATEGORIES (tag each change):
- "keyword_add" — Adding a missing keyword from the JD
- "keyword_rephrase" — Rephrasing to match JD's exact terminology
- "quantify" — Adding or improving metrics/numbers
- "action_verb" — Strengthening bullet point action verbs
- "relevance" — Reordering or emphasizing more relevant content
- "density" — Adding natural repetition of critical keywords

## STRICT RULES:
- DO NOT invent or fabricate experience, skills, projects, or achievements
- DO NOT rewrite entire sections — make surgical, targeted edits
- DO NOT modify LaTeX commands or formatting
- ONLY edit text content within existing LaTeX structures
- Each "original" field MUST be an exact substring from the resume
- Prioritize the MOST IMPACTFUL changes first in the array
- Generate 10-15 specific, actionable changes

## OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no extra text):
{
  "changes": [
    {
      "original": "exact text from the resume",
      "updated": "improved text incorporating JD keywords",
      "reason": "specific explanation of which JD requirement this addresses",
      "category": "keyword_add|keyword_rephrase|quantify|action_verb|relevance|density",
      "impact": "high|medium|low"
    }
  ]
}

If no changes needed, return: {"changes": []}`;

/**
 * Common tech terms and multi-word phrases that ATS systems look for.
 * These should be extracted as complete phrases, not split into individual words.
 */
const TECH_PHRASES = [
    // Cloud & DevOps
    'amazon web services', 'aws', 'google cloud', 'gcp', 'microsoft azure', 'azure',
    'ci/cd', 'ci cd', 'continuous integration', 'continuous deployment', 'continuous delivery',
    'infrastructure as code', 'iac', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
    'jenkins', 'github actions', 'gitlab ci', 'circleci',
    // AI/ML
    'machine learning', 'deep learning', 'natural language processing', 'nlp',
    'computer vision', 'artificial intelligence', 'large language models', 'llm',
    'neural networks', 'reinforcement learning', 'generative ai', 'gen ai',
    'data science', 'data engineering', 'data analytics', 'data pipeline',
    // Programming
    'node.js', 'react.js', 'reactjs', 'next.js', 'vue.js', 'angular.js', 'express.js',
    'ruby on rails', 'spring boot', '.net', 'asp.net', 'c++', 'c#', 'objective-c',
    'type script', 'typescript', 'javascript', 'python', 'golang', 'rust',
    // Databases
    'sql server', 'postgresql', 'mysql', 'mongodb', 'dynamodb', 'redis', 'elasticsearch',
    'apache kafka', 'rabbitmq', 'apache spark', 'apache airflow',
    // Methodologies
    'agile', 'scrum', 'kanban', 'waterfall', 'test driven development', 'tdd',
    'behavior driven development', 'bdd', 'object oriented programming', 'oop',
    'design patterns', 'microservices', 'event driven', 'domain driven design',
    'system design', 'software development life cycle', 'sdlc',
    // Business/Management
    'project management', 'product management', 'stakeholder management',
    'cross functional', 'cross-functional', 'team leadership', 'people management',
    'business analysis', 'business intelligence', 'key performance indicators', 'kpi',
    'return on investment', 'roi', 'service level agreement', 'sla',
    // Security
    'information security', 'cyber security', 'cybersecurity', 'penetration testing',
    'vulnerability assessment', 'identity and access management', 'iam', 'oauth', 'sso',
    // General Tech
    'rest api', 'restful api', 'graphql', 'api gateway', 'load balancing',
    'version control', 'git', 'unit testing', 'integration testing', 'end to end',
    'full stack', 'full-stack', 'front end', 'front-end', 'back end', 'back-end',
    'user experience', 'ux', 'user interface', 'ui', 'responsive design',
    'single page application', 'spa', 'progressive web app', 'pwa',
    'software as a service', 'saas', 'platform as a service', 'paas',
];

/**
 * Words that appear in job descriptions but are not meaningful ATS keywords.
 */
const STOP_WORDS = new Set([
    // Common English
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are',
    'was', 'were', 'been', 'be', 'as', 'by', 'this', 'that', 'with', 'from', 'up', 'about',
    'into', 'through', 'during', 'will', 'can', 'should', 'would', 'could', 'may', 'must',
    'have', 'has', 'had', 'do', 'does', 'did', 'not', 'no', 'we', 'you', 'your', 'our',
    'they', 'their', 'its', 'all', 'each', 'every', 'any', 'some', 'such', 'than', 'too',
    'very', 'just', 'also', 'more', 'most', 'other', 'only', 'same', 'so', 'own', 'well',
    'how', 'what', 'when', 'where', 'which', 'who', 'why', 'new', 'old', 'like',
    // JD filler words (appear frequently but aren't keywords)
    'experience', 'ability', 'strong', 'excellent', 'proven', 'required', 'preferred',
    'looking', 'seeking', 'responsible', 'duties', 'include', 'including', 'work',
    'working', 'using', 'used', 'use', 'need', 'needed', 'position', 'role', 'job',
    'team', 'company', 'join', 'opportunity', 'environment', 'ideal', 'candidate',
    'qualifications', 'requirements', 'responsibilities', 'description', 'apply',
    'please', 'minimum', 'years', 'year', 'plus', 'etc', 'skills', 'knowledge',
    'understanding', 'familiar', 'familiarity', 'proficient', 'proficiency',
    'ensure', 'provide', 'support', 'develop', 'manage', 'create', 'maintain',
    'implement', 'design', 'build', 'collaborate', 'communicate', 'lead',
]);

/**
 * Extract keywords from a job description with multi-word phrase detection,
 * tech term recognition, and frequency-based ranking.
 *
 * Returns an array of { keyword, frequency, isPhrase, category } objects
 * sorted by importance (frequency * weight).
 */
function extractKeywords(jobDescription) {
    const jdLower = jobDescription.toLowerCase();

    const keywordMap = new Map(); // keyword -> { keyword, frequency, isPhrase, category }

    // --- Phase 1: Extract multi-word technical phrases ---
    for (const phrase of TECH_PHRASES) {
        const regex = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'gi');
        const matches = jdLower.match(regex);
        if (matches && matches.length > 0) {
            const normalized = phrase.toLowerCase();
            keywordMap.set(normalized, {
                keyword: normalized,
                frequency: matches.length,
                isPhrase: phrase.includes(' ') || phrase.includes('/') || phrase.includes('.'),
                category: 'technical',
            });
        }
    }

    // --- Phase 2: Extract remaining single-word terms ---
    // Match words including special tech suffixes
    const words = jdLower.match(/\b[a-z][\w]*(?:[.+#][\w]*)*\b/g) || [];

    const wordFreq = {};
    for (const word of words) {
        if (STOP_WORDS.has(word) || word.length < 3) continue;
        // Skip words already covered by a phrase
        let coveredByPhrase = false;
        for (const [phraseKey] of keywordMap) {
            if (phraseKey.includes(' ') && phraseKey.includes(word)) {
                coveredByPhrase = true;
                break;
            }
        }
        if (coveredByPhrase) continue;

        wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    for (const [word, freq] of Object.entries(wordFreq)) {
        if (!keywordMap.has(word)) {
            keywordMap.set(word, {
                keyword: word,
                frequency: freq,
                isPhrase: false,
                category: categorizeSingleKeyword(word),
            });
        }
    }

    // --- Phase 3: Rank by importance ---
    // Phrases and high-frequency terms are more important
    const ranked = Array.from(keywordMap.values())
        .map(kw => ({
            ...kw,
            weight: kw.frequency * (kw.isPhrase ? 3 : 1) * (kw.category === 'technical' ? 2 : 1),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 40); // Keep top 40 keywords

    return ranked;
}

/**
 * Simpler extraction that returns just keyword strings (backward compatible).
 */
function extractKeywordStrings(jobDescription) {
    return extractKeywords(jobDescription).map(kw => kw.keyword);
}

/**
 * Categorize a single keyword as technical, soft-skill, or general.
 */
function categorizeSingleKeyword(word) {
    const techIndicators = /^(api|sdk|sql|css|html|xml|json|yaml|http|tcp|udp|dns|ssl|tls|ssh|aws|gcp|gpu|cpu|ram|ssd|ide|cli|gui|orm|mvc|mvvm|cdn|vpc|iam|jwt|oauth|saml|ldap|smtp|ftp|npm|pip|gem|mvn|jar|war|zip|tar|csv|pdf|svg|png|git|svn|hg|bash|zsh|vim|nano|grep|sed|awk|curl|wget|jira|linux|unix|windows|macos|ios|android|docker|redis|nginx|apache|mysql|flask|django|rails|spring|react|angular|vue|svelte|webpack|babel|eslint|jest|mocha|cypress|selenium|graphql|grpc|mqtt|oauth|regex|cron|lambda|serverless|devops|devsecops|mlops|dataops|gitops|hadoop|hive|presto|tableau|looker|snowflake|databricks|terraform|pulumi|vault|consul|nomad|prometheus|grafana|kibana|splunk|datadog|sentry|pagerduty|confluence|notion|figma|sketch|storybook)$/i;

    if (techIndicators.test(word)) return 'technical';
    return 'general';
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculate a detailed ATS match score with keyword gap analysis.
 *
 * Returns an object with score, found/missing keywords, and category breakdown.
 */
function calculateMatchScore(resume, jobDescription, changes) {
    const resumeText = resume.toLowerCase();
    const keywords = extractKeywords(jobDescription);

    if (keywords.length === 0) {
        return {
            score: 0,
            foundKeywords: [],
            missingKeywords: [],
            categories: {},
        };
    }

    const found = [];
    const missing = [];

    for (const kw of keywords) {
        if (resumeText.includes(kw.keyword)) {
            found.push(kw);
        } else {
            missing.push(kw);
        }
    }

    // --- Weighted score calculation ---
    const totalWeight = keywords.reduce((sum, kw) => sum + kw.weight, 0);
    const foundWeight = found.reduce((sum, kw) => sum + kw.weight, 0);

    // Base keyword match score (weighted)
    const keywordScore = totalWeight > 0 ? (foundWeight / totalWeight) * 100 : 0;

    // Bonus for changes that address missing keywords (projected improvement)
    const changeBonus = Math.min((changes || []).length * 3, 20);

    // Combined score
    const score = Math.min(100, Math.round(keywordScore * 0.85 + changeBonus * 0.15));

    // Category breakdown
    const categories = {};
    for (const kw of keywords) {
        const cat = kw.category || 'general';
        if (!categories[cat]) {
            categories[cat] = { total: 0, found: 0, missing: 0, keywords: { found: [], missing: [] } };
        }
        categories[cat].total++;
        if (resumeText.includes(kw.keyword)) {
            categories[cat].found++;
            categories[cat].keywords.found.push(kw.keyword);
        } else {
            categories[cat].missing++;
            categories[cat].keywords.missing.push(kw.keyword);
        }
    }

    return {
        score,
        foundKeywords: found.map(kw => kw.keyword),
        missingKeywords: missing.sort((a, b) => b.weight - a.weight).map(kw => kw.keyword),
        categories,
    };
}

/**
 * Backward-compatible score function that returns just a number.
 */
function calculateMatchScoreSimple(resume, jobDescription, changes) {
    return calculateMatchScore(resume, jobDescription, changes).score;
}

/**
 * Repair incomplete/truncated JSON by finding the last complete object
 */
function repairIncompleteJSON(jsonString) {
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

    if (lastCompleteIndex > 0) {
        return jsonString.substring(0, lastCompleteIndex + 1);
    }

    return jsonString;
}

module.exports = {
    SYSTEM_PROMPT,
    calculateMatchScore,
    calculateMatchScoreSimple,
    extractKeywords,
    extractKeywordStrings,
    repairIncompleteJSON,
};
