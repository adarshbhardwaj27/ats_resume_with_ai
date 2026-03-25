/**
 * Extract LaTeX resume sections from resume template.
 *
 * Supports multiple LaTeX section command styles:
 *   \section{Name}, \section*{Name}, \resumeSection{Name},
 *   \cvsection{Name}, \subsection{Name}, etc.
 *
 * Also performs generic fallback extraction for unknown section names.
 */

// Common section name variations mapped to canonical keys
const SECTION_ALIASES = {
    EXPERIENCE: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'relevant experience'],
    PROJECTS: ['projects', 'personal projects', 'selected projects', 'key projects', 'academic projects', 'side projects'],
    TECHNICAL_SKILLS: ['technical skills', 'skills', 'technologies', 'tech stack', 'core competencies', 'competencies', 'tools & technologies', 'tools and technologies', 'proficiencies'],
    EDUCATION: ['education', 'academic background', 'academic qualifications', 'educational background'],
    CERTIFICATIONS: ['certifications', 'certificates', 'licenses', 'certifications & licenses', 'professional certifications', 'professional development'],
    SUMMARY: ['summary', 'professional summary', 'objective', 'career objective', 'profile', 'about', 'about me', 'career summary'],
    AWARDS: ['awards', 'honors', 'awards & honors', 'achievements', 'awards and honors', 'recognition'],
    PUBLICATIONS: ['publications', 'research', 'papers', 'research & publications'],
    VOLUNTEER: ['volunteer', 'volunteer experience', 'community involvement', 'leadership', 'extracurricular', 'activities', 'leadership & activities'],
};

// Build a reverse lookup: lowercased alias -> canonical key
const ALIAS_TO_KEY = {};
for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
    for (const alias of aliases) {
        ALIAS_TO_KEY[alias] = key;
    }
}

/**
 * Flexible regex that matches common LaTeX section commands.
 * Captures: \section{Name}, \section*{Name}, \resumeSection{Name}, \cvsection{Name}
 */
const SECTION_CMD_REGEX = /\\(?:section\*?|subsection\*?|resumeSection|cvsection|cvsubsection)\{([^}]+)\}/gi;

function extractSections(latexContent) {
    const sections = {};

    // Find all section commands and their positions
    const sectionPositions = [];
    let match;

    // Reset lastIndex for global regex
    SECTION_CMD_REGEX.lastIndex = 0;
    while ((match = SECTION_CMD_REGEX.exec(latexContent)) !== null) {
        sectionPositions.push({
            fullMatch: match[0],
            name: match[1].trim(),
            startIndex: match.index,
            contentStart: match.index + match[0].length,
        });
    }

    // Also find \end{document} position as a boundary
    const endDocMatch = latexContent.match(/\\end\{document\}/);
    const endDocIndex = endDocMatch ? endDocMatch.index : latexContent.length;

    // Extract content between consecutive sections
    for (let i = 0; i < sectionPositions.length; i++) {
        const current = sectionPositions[i];
        const nextStart = i + 1 < sectionPositions.length
            ? sectionPositions[i + 1].startIndex
            : endDocIndex;

        const content = latexContent.substring(current.contentStart, nextStart).trim();
        const nameNormalized = current.name.toLowerCase().replace(/[^a-z\s&]/g, '').trim();

        // Map to canonical key
        const canonicalKey = ALIAS_TO_KEY[nameNormalized] || nameNormalized.toUpperCase().replace(/\s+/g, '_');
        const label = current.name;

        // Use canonical key if known, otherwise use normalized name
        if (!sections[canonicalKey] || content.length > (sections[canonicalKey].content || '').length) {
            sections[canonicalKey] = {
                label: label,
                content: content,
                order: i,
            };
        }
    }

    return sections;
}

function formatSectionForAI(sectionLabel, sectionContent) {
    return `
Section: ${sectionLabel}

${sectionContent}

---
Please improve this section for ATS (Applicant Tracking System) alignment.`;
}

module.exports = {
    extractSections,
    formatSectionForAI,
    SECTION_ALIASES,
};
