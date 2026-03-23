/**
 * Extract LaTeX resume sections from resume template
 */

const SECTION_PATTERNS = {
    EXPERIENCE: {
        pattern: /\\section\{EXPERIENCE\}([\s\S]*?)(?=\\section|\\end\{document\})/i,
        label: 'EXPERIENCE',
    },
    PROJECTS: {
        pattern: /\\section\{PROJECTS\}([\s\S]*?)(?=\\section|\\end\{document\})/i,
        label: 'PROJECTS',
    },
    TECHNICAL_SKILLS: {
        pattern: /\\section\{TECHNICAL SKILLS\}([\s\S]*?)(?=\\section|\\end\{document\})/i,
        label: 'TECHNICAL SKILLS',
    },
    EDUCATION: {
        pattern: /\\section\{EDUCATION\}([\s\S]*?)(?=\\section|\\end\{document\})/i,
        label: 'EDUCATION',
    },
    CERTIFICATIONS: {
        pattern: /\\section\{CERTIFICATIONS.*?\}([\s\S]*?)(?=\\end\{document\})/i,
        label: 'CERTIFICATIONS',
    },
};

function extractSections(latexContent) {
    const sections = {};

    for (const [key, config] of Object.entries(SECTION_PATTERNS)) {
        const match = latexContent.match(config.pattern);
        if (match) {
            sections[key] = {
                label: config.label,
                content: match[1].trim(),
                order: Object.keys(SECTION_PATTERNS).indexOf(key),
            };
        }
    }

    return sections;
}

function formatSectionForAI(sectionLabel, sectionContent) {
    // Clean up LaTeX markup for AI
    return `
Section: ${sectionLabel}

${sectionContent}

---
Please improve this section for ATS (Applicant Tracking System) alignment.`;
}

module.exports = {
    extractSections,
    formatSectionForAI,
    SECTION_PATTERNS,
};
