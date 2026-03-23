const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const axios = require('axios');

/**
 * Compile LaTeX to PDF
 * Tries local pdflatex first, falls back to online API
 */
async function compilePdf(latexContent) {
    // Try local pdflatex first
    try {
        return await compileLocalPdf(latexContent);
    } catch (err) {
        console.warn('Local pdflatex not available, trying online API:', err.message);
    }

    // Fallback to online API
    try {
        return await compileOnlineApi(latexContent);
    } catch (err) {
        console.error('Online API failed:', err.message);
        throw new Error('PDF compilation failed. Please ensure LaTeX is installed or check online API.');
    }
}

/**
 * Compile using local pdflatex
 */
async function compileLocalPdf(latexContent) {
    const tempDir = path.join(require('os').tmpdir(), `latex_${Date.now()}`);
    const texFile = path.join(tempDir, 'resume.tex');
    const pdfFile = path.join(tempDir, 'resume.pdf');

    try {
        // Create temp directory
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Write LaTeX file
        fs.writeFileSync(texFile, latexContent, 'utf-8');

        // Compile with pdflatex
        execSync(
            `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`,
            { encoding: 'utf-8', stdio: 'pipe' }
        );

        // Check if PDF was created
        if (!fs.existsSync(pdfFile)) {
            throw new Error('pdflatex did not generate PDF');
        }

        // Read the PDF
        const pdfBuffer = fs.readFileSync(pdfFile);

        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });

        return pdfBuffer;
    } catch (err) {
        // Cleanup on error
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        throw new Error(`Local compilation failed: ${err.message}`);
    }
}

/**
 * Compile using online LaTeX API
 * Uses latex.online service (free, no API key required)
 */
async function compileOnlineApi(latexContent) {
    try {
        const response = await axios.post('https://latex.online/api/v1/compile', {
            resources: [
                {
                    main: true,
                    file: 'resume.tex',
                    type: 'text/x-tex',
                    content: latexContent,
                },
            ],
        });

        if (response.status !== 200 || !response.data.pdf) {
            throw new Error('Invalid response from online API');
        }

        // The API returns PDF as base64 in data.pdf
        const pdfData = response.data.pdf;
        const pdfBuffer = Buffer.from(pdfData, 'base64');

        return pdfBuffer;
    } catch (err) {
        throw new Error(`Online API compilation failed: ${err.message}`);
    }
}

module.exports = { compilePdf };
