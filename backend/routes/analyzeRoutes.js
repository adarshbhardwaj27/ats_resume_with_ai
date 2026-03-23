const express = require('express');
const aiService = require('../services/aiService');
const openaiService = require('../services/openaiService');
const geminiService = require('../services/geminiService');
const { compilePdf } = require('../services/pdfService');
const { extractSections } = require('../services/sectionExtractor');
const { analyzeSectionForATS, SECTION_PROMPTS } = require('../services/sectionAnalyzer');

const router = express.Router();

// POST /api/analyze
router.post('/analyze', async (req, res) => {
    try {
        const { latex, jobDescription } = req.body;

        // Validate request body
        if (!latex || !jobDescription) {
            return res.status(400).json({
                error: 'Missing required fields: latex and jobDescription',
            });
        }

        if (typeof latex !== 'string' || typeof jobDescription !== 'string') {
            return res.status(400).json({
                error: 'Both fields must be strings',
            });
        }

        if (latex.trim().length === 0 || jobDescription.trim().length === 0) {
            return res.status(400).json({
                error: 'Fields cannot be empty',
            });
        }

        // Extract sections for analysis
        const sections = extractSections(latex);

        if (Object.keys(sections).length === 0) {
            // Fallback: if no sections extracted, analyze full resume
            const result = await aiService.analyzeResume(latex, jobDescription);
            return res.json(result);
        }

        // Analyze each section separately to prevent hallucination
        const allChanges = [];
        const allKeywords = new Set();
        let totalScore = 0;
        let sectionCount = 0;
        let geminiFailureReason = null;

        for (const [sectionKey, section] of Object.entries(sections)) {
            try {
                console.log(`Analyzing section: ${section.label}`);

                const sectionResult = await analyzeSectionForATS(
                    sectionKey,
                    section.content,
                    jobDescription
                );

                // Collect changes
                if (sectionResult.improvements && sectionResult.improvements.suggestions) {
                    allChanges.push(...sectionResult.improvements.suggestions);
                }

                // Collect keywords
                if (sectionResult.improvements && sectionResult.improvements.keywordMatches) {
                    sectionResult.improvements.keywordMatches.forEach(kw => allKeywords.add(kw));
                }

                // Accumulate score
                if (sectionResult.improvements && sectionResult.improvements.matchScore) {
                    totalScore += sectionResult.improvements.matchScore;
                    sectionCount++;
                }
            } catch (sectionErr) {
                console.error(`Error analyzing ${section.label}:`, sectionErr.message);

                // Check if this is a rate limit error (429) or quota exceeded from Gemini
                const isRateLimitError = sectionErr.message.includes('429') ||
                    sectionErr.message.includes('Quota exceeded') ||
                    sectionErr.message.includes('quota');

                if (isRateLimitError && !geminiFailureReason) {
                    geminiFailureReason = sectionErr.message;
                    console.log(`Gemini rate limit detected, using OpenAI fallback for remaining sections`);

                    // Fall back to OpenAI for this section
                    try {
                        const sectionPrompt = SECTION_PROMPTS[sectionKey];
                        const fallbackResult = await openaiService.analyzeSectionForATS(
                            sectionKey,
                            section.content,
                            jobDescription,
                            sectionPrompt
                        );

                        if (fallbackResult.suggestions) {
                            allChanges.push(...fallbackResult.suggestions);
                        }
                        if (fallbackResult.keywordMatches) {
                            fallbackResult.keywordMatches.forEach(kw => allKeywords.add(kw));
                        }
                        if (fallbackResult.matchScore !== undefined) {
                            totalScore += fallbackResult.matchScore;
                            sectionCount++;
                        }
                        console.log(`Successfully analyzed ${section.label} using OpenAI fallback`);
                    } catch (fallbackErr) {
                        console.error(`Fallback also failed for ${section.label}:`, fallbackErr.message);
                        // Continue with next section
                    }
                } else {
                    // For non-rate-limit errors or if already switched to fallback, just continue
                    if (geminiFailureReason) {
                        // Already switched to fallback, try OpenAI for this section
                        try {
                            const sectionPrompt = SECTION_PROMPTS[sectionKey];
                            const fallbackResult = await openaiService.analyzeSectionForATS(
                                sectionKey,
                                section.content,
                                jobDescription,
                                sectionPrompt
                            );

                            if (fallbackResult.suggestions) {
                                allChanges.push(...fallbackResult.suggestions);
                            }
                            if (fallbackResult.keywordMatches) {
                                fallbackResult.keywordMatches.forEach(kw => allKeywords.add(kw));
                            }
                            if (fallbackResult.matchScore !== undefined) {
                                totalScore += fallbackResult.matchScore;
                                sectionCount++;
                            }
                        } catch (fallbackErr) {
                            console.error(`OpenAI fallback also failed for ${section.label}:`, fallbackErr.message);
                        }
                    }
                }
            }
        }

        // Calculate average match score
        const matchScore = sectionCount > 0 ? Math.round(totalScore / sectionCount) : 0;

        res.json({
            changes: allChanges,
            matchScore,
            jobKeywords: Array.from(allKeywords),
            analysisMeta: {
                method: 'section-by-section',
                sectionsAnalyzed: sectionCount,
            },
        });
    } catch (error) {
        console.error('API Error:', error);

        if (error.message.includes('API')) {
            return res.status(503).json({
                error: 'AI API error: ' + error.message,
            });
        }

        res.status(400).json({
            error: error.message || 'Failed to analyze resume',
        });
    }
});

// POST /api/compile-pdf
router.post('/compile-pdf', async (req, res) => {
    try {
        const { latex } = req.body;

        // Validate request
        if (!latex || typeof latex !== 'string' || latex.trim().length === 0) {
            return res.status(400).json({
                error: 'LaTeX content is required',
            });
        }

        // Compile PDF
        const pdfBuffer = await compilePdf(latex);

        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Compilation Error:', error);

        res.status(503).json({
            error: 'Failed to compile PDF: ' + error.message,
        });
    }
});

// POST /api/sections - Extract sections from LaTeX
router.post('/sections', async (req, res) => {
    try {
        const { latex } = req.body;

        if (!latex || typeof latex !== 'string' || latex.trim().length === 0) {
            return res.status(400).json({
                error: 'LaTeX content is required',
            });
        }

        const sections = extractSections(latex);

        res.json({
            sections,
            count: Object.keys(sections).length,
        });
    } catch (error) {
        console.error('Section Extraction Error:', error);
        res.status(400).json({
            error: error.message || 'Failed to extract sections',
        });
    }
});

// POST /api/analyze-section - Analyze specific section for ATS
router.post('/analyze-section', async (req, res) => {
    try {
        const { sectionName, sectionContent, jobDescription } = req.body;

        if (!sectionName || !sectionContent || !jobDescription) {
            return res.status(400).json({
                error: 'Missing required fields: sectionName, sectionContent, jobDescription',
            });
        }

        const result = await analyzeSectionForATS(sectionName, sectionContent, jobDescription);

        res.json(result);
    } catch (error) {
        console.error('Section Analysis Error:', error);

        if (error.message.includes('API')) {
            return res.status(503).json({
                error: 'AI API error: ' + error.message,
            });
        }

        res.status(400).json({
            error: error.message || 'Failed to analyze section',
        });
    }
});

module.exports = router;
