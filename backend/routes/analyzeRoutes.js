const express = require('express');
const aiService = require('../services/aiService');
const { compilePdf } = require('../services/pdfService');

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

        // Single API call to analyze full resume
        const result = await aiService.analyzeResume(latex, jobDescription);

        res.json(result);
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
