# PROJECT CONFIGURATION REFERENCE

## Backend Configuration Files

### package.json

Located: `backend/package.json`

**Key Dependencies:**

- `express` - Web framework
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `openai` - OpenAI API client
- `@google/generative-ai` - Google Gemini API client

**Scripts:**

- `npm start` - Run in production
- `npm run dev` - Run in development with auto-reload (requires nodemon)

### .env File

Located: `backend/.env` (create from .env.example)

**Required Variables:**

```
# Choose ONE AI provider below:

# OpenAI Configuration (gpt-3.5-turbo model)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxx        # Get from https://platform.openai.com/account/api-keys

# OR Google Gemini Configuration (gemini-2.5-flash model)
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxx      # Get from https://makersuite.google.com/app/apikey

# Provider Selection
AI_PROVIDER=openai                       # Options: 'openai' or 'gemini' (default: openai)
```

**Optional Variables:**

```
PORT=5000                                # Server port (default: 5000)
NODE_ENV=development                     # development or production
```

**How to Switch Providers:**

1. Set your API key for the desired provider (OPENAI_API_KEY or GEMINI_API_KEY)
2. Set `AI_PROVIDER=openai` or `AI_PROVIDER=gemini`
3. Restart the backend server

**Provider Comparison:**

| Aspect           | OpenAI (gpt-3.5-turbo)   | Google Gemini (gemini-pro) |
| ---------------- | ------------------------ | -------------------------- |
| Free Trial       | $5 credit                | Free tier with limits      |
| Cost             | ~$0.01-0.03 per analysis | Free tier / Paid           |
| Availability     | Worldwide                | Worldwide                  |
| Response Quality | Excellent                | Good                       |
| Speed            | Fast                     | Fast                       |
| Setup Difficulty | Easy                     | Easy                       |

## Frontend Configuration Files

### package.json

Located: `frontend/package.json`

**Key Dependencies:**

- `react` - UI framework
- `react-dom` - React DOM rendering
- `axios` - HTTP client
- `react-scripts` - CRA build tools
- `tailwindcss` - Utility CSS framework

**Scripts:**

- `npm start` - Start development server
- `npm build` - Build for production
- `npm eject` - Eject from CRA (irreversible)

### tailwind.config.js

Located: `frontend/tailwind.config.js`

Controls TailwindCSS configuration. Default setup works for this project.

- Scans: `./index.html` and `./src/**/*.{js,jsx}`
- No custom theme extensions

### .env.local File

Located: `frontend/.env.local` (optional, create from .env.local.example)

**Optional Variables:**

```
REACT_APP_API_URL=http://localhost:5000/api    # Backend API URL
```

Default: `http://localhost:5000/api`

## File Structure Reference

### Backend Files Overview

| File                        | Purpose            | Key Content                           |
| --------------------------- | ------------------ | ------------------------------------- |
| `server.js`                 | Express app setup  | Middleware, routes, error handling    |
| `services/aiService.js`     | Provider router    | Selects OpenAI or Gemini based on env |
| `services/openaiService.js` | OpenAI integration | OpenAI API call, response validation  |
| `services/geminiService.js` | Gemini integration | Gemini API call, response validation  |
| `services/aiCommon.js`      | Shared utilities   | SYSTEM_PROMPT, scoring, keywords      |
| `routes/analyzeRoutes.js`   | API endpoint       | POST /analyze handler                 |
| `.env`                      | Secrets            | API keys, PORT, AI_PROVIDER           |
| `package.json`              | Dependencies       | Version numbers for all npm packages  |

### Frontend Files Overview

| File                              | Purpose           | Key Content                      |
| --------------------------------- | ----------------- | -------------------------------- |
| `src/App.jsx`                     | Main component    | State management, layout         |
| `src/components/InputForm.jsx`    | Input UI          | Textareas, submit button         |
| `src/components/ChangesList.jsx`  | Results UI        | Score, keywords, changes display |
| `src/components/ErrorMessage.jsx` | Error UI          | Error message display            |
| `src/services/api.js`             | API client        | axios wrapper                    |
| `src/index.jsx`                   | Entry point       | React DOM render                 |
| `public/index.html`               | HTML template     | HTML skeleton                    |
| `tailwind.config.js`              | TailwindCSS setup | CSS utility config               |

## Environment Variables

### Backend (.env)

```bash
# REQUIRED - Get from https://platform.openai.com/account/api-keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# OPTIONAL - Defaults provided
PORT=5000
NODE_ENV=development  # or 'production'
```

### Frontend (.env.local - Optional)

```bash
# OPTIONAL - Defaults to localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
```

For production, set to your deployed backend URL:

```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Port Configuration

### Default Ports

| Service               | Port | URL                   |
| --------------------- | ---- | --------------------- |
| Frontend (React Dev)  | 3000 | http://localhost:3000 |
| Frontend (Production) | 80   | http://localhost      |
| Backend (Express)     | 5000 | http://localhost:5000 |

### Changing Ports

**Backend:**
Edit `backend/.env`:

```
PORT=8000
```

**Frontend:**
Set environment variable before starting:

```bash
# Windows PowerShell
$env:PORT=3001; npm start

# Mac/Linux
PORT=3001 npm start
```

## API Endpoint Reference

### Health Check

```http
GET http://localhost:5000/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-03-23T12:34:56.789Z"
}
```

### Analyze Resume

```http
POST http://localhost:5000/api/analyze
Content-Type: application/json

{
  "latex": "\\item Your experience",
  "jobDescription": "Job requirements"
}
```

**Success Response (200):**

```json
{
  "changes": [
    {
      "original": "string",
      "updated": "string",
      "reason": "string"
    }
  ],
  "matchScore": 0,
  "jobKeywords": ["string"]
}
```

**Error Response (400):**

```json
{
  "error": "error message"
}
```

**Error Response (503):**

```json
{
  "error": "OpenAI API error: message"
}
```

## Common Configuration Issues

### Issue: API Key Not Recognized

**Cause**: `.env` file missing or incorrect format

**Solution**:

1. Verify `.env` exists in `backend/` folder
2. Check format: `OPENAI_API_KEY=sk-xxxx` (no quotes)
3. No spaces around `=`
4. Restart backend: `npm run dev`

### Issue: Frontend Can't Connect to Backend

**Cause**: Wrong API URL or backend not running

**Solution**:

1. Verify backend is running (`npm run dev` in backend folder)
2. Test health endpoint: `curl http://localhost:5000/health`
3. Check `REACT_APP_API_URL` in frontend `.env.local` if set
4. Frontend default is `http://localhost:5000/api` - should work

### Issue: CORS Errors in Browser

**Cause**: Backend and frontend on different domains in production

**Solution**:
Edit `backend/server.js`:

```javascript
app.use(
  cors({
    origin: "https://yourdomain.com",
  }),
);
```

### Issue: Port Already in Use

**Solution**:

```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Change port in .env or kill process
```

## Customization Guide

### Change OpenAI Model

**File**: `backend/services/openaiService.js` (line 58)

**Current (Default):**

```javascript
model: 'gpt-3.5-turbo',      // ✅ Works for everyone!
```

**Why gpt-3.5-turbo?**

- ✅ Works for all account types (free tier included)
- ✅ ~$0.0005 per analysis (super cheap!)
- ✅ Great for resume editing
- ✅ Fast responses

**Other Options:**

```javascript
model: 'gpt-4-turbo',        // Better quality (~$0.01/analysis) - requires paid account
model: 'gpt-4',              // Best quality (~$0.03/analysis) - requires pro account
```

**Troubleshooting: Getting "Model not found" error?**

If you see: `404 The model gpt-4-turbo does not exist or you do not have access to it`

Your account doesn't have GPT-4 access. Use gpt-3.5-turbo (now the default) instead.
Then restart: `npm run dev`

### Change API Temperature

**File**: `backend/services/openaiService.js`

Current:

```javascript
temperature: 0.7,
```

Range: 0.0 (deterministic) to 2.0 (creative)

- 0.0 = Always same output
- 0.7 = Balanced (default)
- 2.0 = Very creative/random

### Change Max Response Length

**File**: `backend/services/openaiService.js`

Current:

```javascript
max_tokens: 2000,
```

Lower = Faster responses, shorter outputs
Higher = More complete responses, slower

### Change Styling Theme

**File**: `frontend/src/index.css` or `tailwind.config.js`

Add to `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
},
```

Then use in components:

```jsx
className = "bg-primary";
```

### Change Logo/Title

**File**: `frontend/src/App.jsx`

Current:

```jsx
<h1 className="text-4xl font-bold">Resume Tailor</h1>
```

Edit title text or add logo:

```jsx
<img src="/logo.png" alt="Logo" />
<h1>Your Custom Title</h1>
```

## Deployment Configuration

### Heroku Backend

Create `Procfile` in backend folder:

```
web: node server.js
```

Set config variables:

```bash
heroku config:set OPENAI_API_KEY=sk-xxx
heroku config:set NODE_ENV=production
```

### Vercel Frontend

Create `vercel.json` in frontend folder:

```json
{
  "env": {
    "REACT_APP_API_URL": "https://your-backend-url.com/api"
  }
}
```

### Docker

Backend `Dockerfile` exists in repo, ready to use.

Frontend `Dockerfile` exists in repo, ready to use.

### Environment Variables for Deployment

**Heroku Backend:**

```bash
OPENAI_API_KEY=sk-real-key
NODE_ENV=production
PORT=<auto-assigned>
```

**Vercel Frontend:**

```bash
REACT_APP_API_URL=https://backend-url.com/api
```

**AWS Lambda/ECS:**
Use AWS Secrets Manager and set as environment variables.

**Docker Compose:**
Environment variables in `.env` file at project root.

## Security Best Practices

### API Key Protection

- ✅ Never commit `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in production
- ✅ Rotate keys regularly
- ✅ Don't log API keys

### CORS Configuration

- ✅ Restrict to specific domains in production
- ✅ Don't use wildcard `*` in production

### Input Validation

- ✅ Already implemented in backend
- ✅ Frontend does basic validation
- ✅ API validates all inputs

### HTTPS

- ✅ Use HTTPS in production (Let's Encrypt)
- ✅ Enforce HTTPS redirects
- ✅ Set secure cookies

## Monitoring & Logging

### Backend Logs

Start with debug output:

```bash
DEBUG=* npm run dev
```

### Frontend Debugging

Open browser DevTools:

- Windows/Linux: `F12` or `Ctrl+Shift+I`
- Mac: `Cmd+Option+I`

Tabs:

- **Console**: Error messages
- **Network**: API requests/responses
- **Application**: LocalStorage, cookies
- **Performance**: Speed metrics

### Health Checks

Test backend availability:

```bash
curl http://localhost:5000/health
```

Should return immediately with `{"status":"ok"}`.

## Performance Tuning

### Backend Optimization

- Increase `max_tokens` for more complete responses
- Decrease `temperature` for consistent output
- Cache frequent analyses (future enhancement)

### Frontend Optimization

- Enable gzip compression
- Minify CSS/JS (automatic with `npm run build`)
- Lazy load components
- Defer non-critical scripts

## AI Provider Architecture

### How Provider Switching Works

The application uses a **factory pattern** to support multiple AI providers:

```
┌─────────────────────────────────────────────────────┐
│           POST /api/analyze Request                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ analyzeRoutes.js     │
        │ (API handler)        │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────────────────────┐
        │ aiService.js (FACTORY)               │
        │ Reads: process.env.AI_PROVIDER       │
        └──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
  ┌────────────┐      ┌────────────┐
  │ openai     │      │ gemini     │
  │ Service.js │      │ Service.js │
  └────────────┘      └────────────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ aiCommon.js (SHARED) │
        │ - SYSTEM_PROMPT      │
        │ - calculateScore()   │
        │ - extractKeywords()  │
        └──────────────────────┘
```

**Key Files:**

1. **aiService.js** - Factory that selects provider
   - Reads `AI_PROVIDER` environment variable
   - Returns appropriate service interface
   - Validates required API key is set

2. **openaiService.js** - OpenAI implementation
   - Requires: `OPENAI_API_KEY` env var
   - Model: `gpt-3.5-turbo` (default)
   - API Library: `openai` npm package

3. **geminiService.js** - Google Gemini implementation
   - Requires: `GEMINI_API_KEY` env var
   - Model: `gemini-2.5-flash` (free tier available)
   - API Library: `@google/generative-ai` npm package

4. **aiCommon.js** - Shared utilities (provider-agnostic)
   - `SYSTEM_PROMPT` - Resume editing guidelines
   - `calculateMatchScore()` - Scoring logic
   - `extractKeywords()` - Keyword extraction

5. **analyzeRoutes.js** - API endpoint
   - Uses factory-provided service transparently
   - No hardcoded provider logic

### Adding a New AI Provider

To add support for another provider (e.g., Anthropic Claude):

**Step 1: Create Service File**

Create `backend/services/claudeService.js`:

```javascript
const { GoogleGenerativeAI } = require("@anthropic-ai/sdk");
const {
  SYSTEM_PROMPT,
  calculateMatchScore,
  extractKeywords,
} = require("./aiCommon");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeResume(latexResume, jobDescription) {
  const keywords = extractKeywords(jobDescription);

  const response = await client.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nResume:\n${latexResume}\n\nJob Description:\n${jobDescription}`,
      },
    ],
  });

  const content = response.content[0].text;
  const changes = JSON.parse(content);

  return {
    changes,
    matchScore: calculateMatchScore(latexResume, jobDescription, changes),
    jobKeywords: keywords,
  };
}

module.exports = { analyzeResume };
```

**Step 2: Update aiService.js**

```javascript
const AI_PROVIDER = process.env.AI_PROVIDER || "openai";

let aiService;

if (AI_PROVIDER === "gemini") {
  aiService = require("./geminiService");
} else if (AI_PROVIDER === "claude") {
  aiService = require("./claudeService");
} else if (AI_PROVIDER === "openai") {
  aiService = require("./openaiService");
} else {
  throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
}

module.exports = aiService;
```

**Step 3: Update .env**

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
AI_PROVIDER=claude
```

**Step 4: Install Dependencies**

```bash
npm install @anthropic-ai/sdk
```

### Provider Characteristics

| Feature           | OpenAI        | Gemini           |
| ----------------- | ------------- | ---------------- |
| API Key Setup     | Easy          | Easy             |
| Free Tier         | $5 credit     | Free with limits |
| Model Used        | gpt-3.5-turbo | gemini-pro       |
| Response Time     | ~1-3 seconds  | ~1-3 seconds     |
| Cost Per Analysis | ~$0.01        | Free / Paid      |
| Quality           | Excellent     | Good             |
| Max Tokens        | 2048          | 2048             |
| Temperature       | 0.7           | 0.7              |

### Troubleshooting Switching Providers

**Problem**: Invalid API key error when switching

**Solution**:

1. Verify new API key is set: `echo $GEMINI_API_KEY` (Mac/Linux) or `echo %GEMINI_API_KEY%` (Windows)
2. Check it's in `.env` file with no extra spaces
3. Restart backend: `npm run dev`

**Problem**: "Unknown AI provider" error

**Solution**:
Verify `AI_PROVIDER` value is exactly one of: `openai`, `gemini`

**Problem**: Different results between providers

**Solution**:
Providers use different models and may give slightly different suggestions. This is normal. Test both and choose the one you prefer.

## Troubleshooting Checklist

- [ ] `.env` file exists with API key
- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] Health endpoint works
- [ ] Test analysis completes
- [ ] Results display correctly
- [ ] Changes can be applied

## Quick Reference

**Start Development:**

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm start
```

**Access Application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/analyze
- Health Check: http://localhost:5000/health

**Test API:**

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"latex":"\\item test","jobDescription":"test job"}'
```

**Next Steps:**

1. See GETTING_STARTED.md for detailed setup
2. See README.md for full documentation
3. See ARCHITECTURE.md for design details
