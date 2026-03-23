# Resume Tailor - AI-Powered Resume Optimizer

A full-stack web application that helps users tailor their LaTeX resumes for specific job descriptions using OpenAI. The application provides minimal, targeted edits—never rewriting the entire resume—while preserving LaTeX syntax and preventing hallucinations.

## Features

✅ **Minimal Edits Only** - Only modifies specific lines, never rewrites entire resume  
✅ **LaTeX-Safe** - Preserves all LaTeX commands and formatting  
✅ **ATS Alignment** - Identifies and aligns resume with job-specific keywords  
✅ **Match Scoring** - Provides 0-100 match score between resume and job  
✅ **Keyword Extraction** - Shows extracted keywords from job description  
✅ **Side-by-Side Comparison** - View original vs. improved lines  
✅ **One-Click Apply** - Apply changes directly in the UI  
✅ **Error Handling** - Graceful error messages and validation

## Tech Stack

| Component   | Technology               |
| ----------- | ------------------------ |
| Frontend    | React 18 + TailwindCSS   |
| Backend     | Node.js + Express        |
| AI          | OpenAI API (GPT-4 Turbo) |
| HTTP Client | Axios                    |

## Project Structure

```
ai_ats_resume/
├── backend/
│   ├── services/
│   │   └── openaiService.js       # OpenAI integration & prompting
│   ├── routes/
│   │   └── analyzeRoutes.js       # /api/analyze endpoint
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.jsx      # LaTeX & job description inputs
│   │   │   ├── ChangesList.jsx    # Display suggested changes
│   │   │   └── ErrorMessage.jsx   # Error handling UI
│   │   ├── services/
│   │   │   └── api.js             # Backend API client
│   │   ├── App.jsx                # Main app component
│   │   ├── index.jsx              # React entry point
│   │   └── index.css              # Global styles + Tailwind
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .gitignore
│
└── README.md (this file)
```

## Installation

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- Git

### Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your OpenAI API key:

   ```
   OPENAI_API_KEY=sk-...your-key...
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the backend**

   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure backend URL** (optional)

   Create a `.env.local` file if your backend is not on `localhost:5000`:

   ```
   REACT_APP_API_URL=http://your-backend-url:5000/api
   ```

3. **Start the frontend**

   ```bash
   npm start
   ```

   App will open at `http://localhost:3000`

## Usage

### Basic Workflow

1. **Paste LaTeX Resume**
   - Copy-paste your LaTeX resume code into the "LaTeX Resume" textarea
   - Can be a full `.tex` file or just the resume content

2. **Paste Job Description**
   - Copy-paste the job description into the "Job Description" textarea
   - Plain text format

3. **Click "Analyze Resume"**
   - Wait for the AI analysis to complete (usually 5-15 seconds)
   - Backend will:
     - Extract keywords from the job description
     - Identify alignment issues
     - Generate minimal edits

4. **Review Suggested Changes**
   - See match score (0-100)
   - View extracted keywords
   - Review each suggested change with:
     - **Original**: The current line
     - **Updated**: The improved line
     - **Reason**: Why this change helps

5. **Apply Changes**
   - Click "Apply Change" for each suggestion you want to accept
   - Changes are applied to the resume in real-time
   - Accepted changes are removed from the suggestions list

6. **Export and Use**
   - Copy the updated resume from the textarea
   - Use in your LaTeX file or job application

## API Reference

### POST /api/analyze

Analyzes a LaTeX resume against a job description and returns suggested edits.

**Request:**

```json
{
  "latex": "LaTeX resume content...",
  "jobDescription": "Job description text..."
}
```

**Response (Success):**

```json
{
  "changes": [
    {
      "original": "Developed backend systems",
      "updated": "Developed backend systems using Python and PostgreSQL",
      "reason": "Job description emphasizes PostgreSQL skills"
    }
  ],
  "matchScore": 72,
  "jobKeywords": ["python", "postgresql", "rest", "docker", "aws"]
}
```

**Response (No changes needed):**

```json
{
  "changes": [],
  "matchScore": 89,
  "jobKeywords": ["python", "postgresql", "rest", "docker"]
}
```

**Error Response:**

```json
{
  "error": "Error message describing what went wrong"
}
```

## Example Test Data

### Sample LaTeX Resume

```latex
\documentclass{article}
\usepackage[utf8]{inputenc}

\title{John Doe}

\begin{document}

\section*{Experience}

\subsection*{Software Engineer - TechCorp (2021-2023)}
\begin{itemize}
    \item Developed backend systems
    \item Managed database migrations
    \item Collaborated with frontend team
\end{itemize}

\subsection*{Junior Developer - StartupXYZ (2020-2021)}
\begin{itemize}
    \item Built REST APIs
    \item Wrote unit tests
    \item Deployed applications
\end{itemize}

\section*{Skills}
\begin{itemize}
    \item Languages: Python, JavaScript
    \item Databases: MySQL, MongoDB
    \item Tools: Git, Docker
\end{itemize}

\end{document}
```

### Sample Job Description

```
Senior Backend Engineer - CloudTech Inc

We are looking for a Senior Backend Engineer with 5+ years of experience.

Requirements:
- Strong Python (3.9+) expertise
- PostgreSQL and database optimization experience
- AWS (EC2, Lambda, RDS) proficiency
- REST API and GraphQL design
- Docker and Kubernetes containerization
- Microservices architecture
- CI/CD pipeline experience
- Strong communication skills

Responsibilities:
- Design and implement scalable backend services
- Optimize database queries and performance
- Mentor junior developers
- Code reviews and technical documentation
- Collaborate across teams

Nice-to-have:
- Experience with message queues (RabbitMQ, Kafka)
- Redis caching experience
- API security best practices
```

### Expected Output

```json
{
  "changes": [
    {
      "original": "Developed backend systems",
      "updated": "Designed and implemented scalable backend systems using Python 3.9 and PostgreSQL with REST API architecture",
      "reason": "Job emphasizes Python expertise, PostgreSQL, scalable systems, and REST APIs. Current bullet is too generic."
    },
    {
      "original": "Managed database migrations",
      "updated": "Optimized PostgreSQL queries and managed database migrations, improving performance by 30%",
      "reason": "Job description emphasizes database optimization and PostgreSQL experience."
    },
    {
      "original": "Deployed applications",
      "updated": "Deployed containerized applications using Docker and implemented CI/CD pipelines",
      "reason": "Job requires Docker containerization and CI/CD pipeline experience."
    }
  ],
  "matchScore": 64,
  "jobKeywords": [
    "python",
    "postgresql",
    "aws",
    "rest",
    "docker",
    "kubernetes",
    "microservices"
  ]
}
```

## Key Design Decisions

### Why GPT-4 Turbo?

- Superior reasoning for code/LaTeX understanding
- Better at following strict formatting constraints
- Reduces hallucination compared to GPT-3.5

### Minimal Edits Philosophy

- **User Control**: Users make final decisions on changes
- **Trust**: Never silently rewrites user's work
- **Accuracy**: Line-level edits are verifiable and safe to apply

### Match Score Calculation

- 60% keyword matching: How many job description keywords appear in resume
- 40% change impact: Number and relevance of suggestions
- Provides realistic 0-100 range

### Error Handling

- Input validation on both frontend and backend
- Graceful OpenAI API error handling
- Clear user-facing error messages
- Fallback to sensible defaults

## Troubleshooting

### "No response from server. Is the backend running?"

- Ensure backend is running: `npm run dev` in `/backend` folder
- Check backend is listening on port 5000
- Verify no firewall blocks localhost:5000

### "OpenAI API error"

- Verify API key in `.env` is valid
- Check you have API credits available
- **Model Access Error** - If you see `404 The model gpt-4-turbo does not exist`:
  - Your account doesn't have GPT-4 access
  - Use `gpt-3.5-turbo` instead (now the default)
  - It works for everyone and is ~90% cheaper!
- Check rate limits haven't been exceeded

### "Model gpt-4-turbo does not exist or you do not have access"

**Cause**: Your OpenAI account doesn't have GPT-4 access (common for free tier)

**Solution**: The app now uses **gpt-3.5-turbo** by default

- Restart your backend: `npm run dev`
- gpt-3.5-turbo works for all accounts
- Quality is still great for resume optimization
- Cost: ~$0.0005 per analysis

**To use GPT-4** (requires paid OpenAI account):

- Edit: `backend/services/openaiService.js` line 58
- Change: `model: 'gpt-3.5-turbo'` to `model: 'gpt-4-turbo'`
- Restart backend: `npm run dev`

### "Invalid JSON response from OpenAI"

- This is a rare edge case
- Usually means a timeout or truncation
- Try again with a shorter resume or job description

### Resume not being updated

- Check browser console for errors (F12)
- Ensure frontend is connected to backend API
- Verify `.env.local` in frontend has correct API URL

## Development

### Running Tests

Run the backend health check:

```bash
curl http://localhost:5000/health
```

Test the /analyze endpoint:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "latex": "\\item Your experience",
    "jobDescription": "We need Python and AWS skills"
  }'
```

### Making Changes

**Backend**:

- Edit `services/openaiService.js` to adjust OpenAI prompt or logic
- Edit `routes/analyzeRoutes.js` to add validation
- Restart with: `npm run dev`

**Frontend**:

- Edit `.jsx` files in `src/components/`
- Changes hot-reload automatically with `npm start`
- Edit `index.css` for styling or TailwindCSS for utility classes

## Performance Notes

- **Resume Length**: Works best with resumes under 200 lines
- **Job Description Length**: Works best with descriptions under 2000 words
- **API Time**: Typically 5-15 seconds depending on OpenAI load
- **Request Limit**: 10MB max request size (plenty for most resumes)

## Future Enhancements

- [ ] Save analysis history
- [ ] Multiple resume versions
- [ ] Batch job application analysis
- [ ] Custom prompt templates
- [ ] Export to `.pdf`
- [ ] Integration with ATS systems
- [ ] Real-time keyword highlighting
- [ ] Undo/redo functionality
- [ ] Resume upload via file
- [ ] Authentication and user accounts

## License

MIT

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend logs: `npm run dev` output
3. Check browser console: F12 → Console tab
4. Verify `.env` configuration

## Author Notes

This application prioritizes:

- **Safety**: Never silently rewrites user content
- **Simplicity**: Clean, readable code for future maintenance
- **Reliability**: Comprehensive error handling
- **User Control**: All changes are user-initiated and reviewable

## Contributing

Ideas for improvements welcome! Current best practices:

- Keep components focused and testable
- Maintain clear separation of concerns
- Document API contracts
- Add inline comments for complex logic
