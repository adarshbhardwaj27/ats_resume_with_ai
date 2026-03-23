# Getting Started - Complete Setup Guide

Welcome to Resume Tailor! This guide will get you up and running in 5 minutes.

## Prerequisites

Before you start, make sure you have:

1. **Node.js 16+** - [Download](https://nodejs.org/)
   - Verify: `node --version` (should be v16 or higher)

2. **npm** - Comes with Node.js
   - Verify: `npm --version`

3. **AI Provider API Key** (Choose One):
   - **OpenAI** - [Get one](https://platform.openai.com/account/api-keys)
     - Free trial with $5 credit available
     - Uses `gpt-3.5-turbo` model (~$0.01-0.03 per analysis)
   - **OR Google Gemini** - [Get one](https://makersuite.google.com/app/apikey)
     - Free tier available with rate limits
     - Uses `gemini-pro` model (no cost in free tier)

4. **Git** - [Download](https://git-scm.com/) (optional but recommended)

## 5-Minute Quick Setup

### Step 1: Extract/Clone Project (30 seconds)

```bash
# Option A: If you have the project folder
cd path/to/ai_ats_resume

# Option B: If cloning from git
git clone <repo-url>
cd ai_ats_resume
```

### Step 2: Backend Setup (2 minutes)

**Terminal 1:**

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API key based on your choice of provider
# On Windows:
#   notepad .env
# On Mac/Linux:
#   nano .env
```

**Option A: Using OpenAI (Recommended for getting started)**

Edit `.env` and add:

```
OPENAI_API_KEY=sk-your-actual-key-here
AI_PROVIDER=openai
PORT=5000
NODE_ENV=development
```

**Option B: Using Google Gemini (Free tier available)**

Edit `.env` and add:

```
GEMINI_API_KEY=AIzaSy_your-actual-key-here
AI_PROVIDER=gemini
PORT=5000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

You should see:

```
Server running on http://localhost:5000
✓ AI Provider configured: openai (or gemini, depending on your choice)
```

**Leave this terminal running!** ✅

### Step 3: Frontend Setup (2 minutes)

**Terminal 2:**

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

The browser should automatically open to `http://localhost:3000`

If not, manually navigate to it.

**Leave this terminal running!** ✅

## Test It!

### Method 1: Use Example Data (Easiest)

1. **Open frontend** at `http://localhost:3000`

2. **Open example files:**
   - `examples/sample_resume.tex`
   - `examples/sample_job_description.txt`

3. **Copy-paste content:**
   - Paste resume into left textarea
   - Paste job description into right textarea

4. **Click "Analyze Resume"**

5. **Wait** 5-15 seconds for analysis

6. **Review results:**
   - See match score
   - See extracted keywords
   - See suggested changes

### Method 2: Use Your Own Content

1. Copy your actual LaTeX resume
2. Find a job description you're interested in
3. Paste both into the app
4. Analyze and review suggestions

### Method 3: Test API Directly

If you want to test the backend API without the frontend:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "latex": "\\item Developed backend systems",
    "jobDescription": "We need Python and AWS expertise"
  }' | jq .
```

Expected response:

```json
{
  "changes": [
    {
      "original": "Developed backend systems",
      "updated": "Designed and deployed scalable backend systems using Python and AWS",
      "reason": "Job emphasizes Python and AWS expertise"
    }
  ],
  "matchScore": 75,
  "jobKeywords": ["python", "aws", "backend"]
}
```

## Troubleshooting Setup

### Problem: "command not found: node"

**Solution**: Node.js not installed

```bash
# Verify installation
node --version
npm --version

# If not installed, download from https://nodejs.org/
```

### Problem: Backend won't start - "Port already in use"

**Solution**: Port 5000 is in use

```bash
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 5000

# Mac/Linux:
lsof -i :5000

# Kill the process and try again
```

### Problem: Frontend won't start - "Port 3000 in use"

**Solution**: Port 3000 is in use

```bash
# Kill process on port 3000
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 3000

# Mac/Linux:
lsof -i :3000
```

### Problem: "OpenAI API key not found"

**Solution**: `.env` file not configured properly

```bash
# Verify .env exists in backend folder
cd backend
ls -la .env

# Verify it contains your key:
cat .env

# If empty or missing, edit it:
# Windows:
notepad .env
# Mac/Linux:
nano .env

# Should contain:
# OPENAI_API_KEY=sk-your-real-key
# PORT=5000
```

### Problem: "Error: Invalid API key"

**Solution**: Your API key is incorrect

- Log in to https://platform.openai.com/account/api-keys
- Verify your key is still valid
- Make sure you didn't copy extra spaces
- Check if your account has API credits

### Problem: Frontend shows "No response from server"

**Solution**: Backend not running

- Make sure you ran `npm run dev` in the backend folder
- Check backend is showing "Server running on http://localhost:5000"
- Try health check: `curl http://localhost:5000/health`
- Check firewall settings

### Problem: Network errors in browser console

**Solution**: Check browser's console (F12 → Console tab)

- Verify backend URL in frontend code matches your setup
- Check CORS isn't blocking (usually browser shows this clearly)
- Try restarting both servers

## First Run Checklist

- [ ] Node.js installed (`node --version` works)
- [ ] Backend can start without errors
- [ ] Backend shows "OpenAI API Key configured: true"
- [ ] Frontend loads at http://localhost:3000
- [ ] Can enter text in both textareas
- [ ] "Analyze Resume" button is clickable
- [ ] API returns results (5-15 seconds)
- [ ] Results display with match score
- [ ] Can see suggested changes
- [ ] Can apply changes successfully

## Model Selection

The app now uses **gpt-3.5-turbo** by default:

- ✅ Works for all OpenAI accounts (including free tier)
- ✅ ~90% cheaper than GPT-4 (~$0.0005 per analysis)
- ✅ Still produces great resume suggestions
- ✅ Fast responses (5-15 seconds)

**If you want to use GPT-4** (requires paid OpenAI account):

Edit `backend/services/openaiService.js` line 58:

```javascript
// Change from:
model: 'gpt-3.5-turbo',

// To:
model: 'gpt-4-turbo',    // Higher quality but requires paid account
```

Then restart backend: `npm run dev`

**Troubleshooting GPT-4 Access Errors**

If you got: `404 The model gpt-4-turbo does not exist or you do not have access to it`

This means your account doesn't have GPT-4 access. Just use gpt-3.5-turbo (now the default)!

## Next Steps

Once it's working:

1. **Read the documentation:**
   - [README.md](./README.md) - Full features and usage
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works
   - [TESTING.md](./TESTING.md) - Testing guide

2. **Customize for your needs:**
   - Edit `backend/services/openaiService.js` for different prompt
   - Modify styling in `frontend/src/index.css`
   - Update TailwindCSS config in `frontend/tailwind.config.js`

3. **Deploy to production:**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)

4. **Add features:**
   - Save analysis history
   - Multiple resume versions
   - Export to PDF
   - User authentication

## Development Commands

### Backend

```bash
cd backend

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Run tests (when you set them up)
npm test
```

### Frontend

```bash
cd frontend

# Start development server (with hot reload)
npm start

# Build for production
npm run build

# Run tests (when you set them up)
npm test
```

## Project Structure Quick Reference

```
ai_ats_resume/
├── backend/
│   ├── server.js              # Main backend entry point
│   ├── package.json           # Dependencies
│   ├── .env                   # Your API key (KEEP SECRET!)
│   ├── .env.example           # Template
│   ├── services/
│   │   └── openaiService.js   # OpenAI integration
│   └── routes/
│       └── analyzeRoutes.js   # API endpoints
│
├── frontend/
│   ├── package.json           # Dependencies
│   ├── tailwind.config.js     # Styling config
│   └── src/
│       ├── App.jsx            # Main app
│       ├── index.jsx          # Entry point
│       ├── components/        # React components
│       └── services/
│           └── api.js         # Backend communication
│
├── examples/
│   ├── sample_resume.tex      # Example resume
│   ├── sample_job_description.txt
│   └── test_api.sh            # API test script
│
├── README.md                  # Full documentation
├── QUICKSTART.md              # This file (basically)
├── ARCHITECTURE.md            # Design decisions
├── TESTING.md                 # Testing guide
└── DEPLOYMENT.md              # Deployment guide
```

## Common Questions

**Q: Why does it take so long?**
A: The OpenAI API call typically takes 5-15 seconds. This is normal.

**Q: Is my resume data saved anywhere?**
A: No. Each analysis is processed in memory and no data is stored.

**Q: Can I use GPT-3.5 instead?**
A: Yes! Edit `backend/services/openaiService.js` and change `gpt-4-turbo` to `gpt-3.5-turbo`. Costs ~90% less but quality may be lower.

**Q: Can I deploy this?**
A: Yes! See [DEPLOYMENT.md](./DEPLOYMENT.md) for options (Heroku, AWS, Docker, etc.).

**Q: How do I update my OpenAI API key?**
A: Edit `backend/.env` and update the `OPENAI_API_KEY` value, then restart the backend.

**Q: Can I modify the prompts?**
A: Yes! Edit `backend/services/openaiService.js` and look for `SYSTEM_PROMPT`.

**Q: What's included in the match score?**
A: 60% keyword matching + 40% change impact. See ARCHITECTURE.md for details.

## Getting Help

1. **Check docs:**
   - [README.md](./README.md) - Features and usage
   - [TESTING.md](./TESTING.md) - Debugging guide
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment help

2. **Debug backend:**
   - Check `backend/.env` has API key
   - Run `npm run dev` to see logs
   - Test health endpoint: `curl http://localhost:5000/health`

3. **Debug frontend:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API requests
   - Look at what was sent/received

4. **Check examples:**
   - Try with `examples/sample_resume.tex`
   - Works? Your setup is fine
   - Fails? Issue is likely environmental

5. **Common solutions:**
   - Restart both servers
   - Clear browser cache (Ctrl+Shift+Del)
   - Kill all node processes: `pkill node`
   - Verify `.env` file exists and has API key

## You're All Set! 🎉

Your Resume Tailor application is now running. Start analyzing your resume against job descriptions!

---

**Need more help?**

- Full documentation: [README.md](./README.md)
- Architecture details: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Testing & debugging: [TESTING.md](./TESTING.md)
- Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
