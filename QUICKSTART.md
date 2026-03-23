# Quick Start Guide

## 30-Second Setup

### 1. Backend (Terminal 1)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key
npm run dev
```

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install
npm start
```

### 3. Open Browser

Navigate to `http://localhost:3000`

## Getting an OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Paste into `backend/.env` as `OPENAI_API_KEY=sk-...`

## Testing

### Option 1: Use the UI

1. Open http://localhost:3000
2. Paste resume into left textarea
3. Paste job description into right textarea
4. Click "Analyze Resume"
5. Review suggestions

### Option 2: Test API directly

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "latex": "\\\\item Developer with 5 years experience",
    "jobDescription": "Looking for Python and AWS expert"
  }'
```

## Troubleshooting

**Frontend won't start?**

- Kill any process on port 3000: `lsof -ti:3000 | xargs kill`
- Run `npm install` again

**Backend won't start?**

- Verify `.env` file exists and has `OPENAI_API_KEY`
- Port 5000 already in use? Check: `lsof -ti:5000`

**Getting API errors?**

- Check OpenAI API key is correct
- Verify you have API credits
- Check you're using GPT-4 Turbo model (may require paid account)

## Next Steps

1. Review [README.md](../README.md) for full documentation
2. Check [examples/](../examples/) for sample inputs
3. Customize the OpenAI prompt in `backend/services/openaiService.js`

Enjoy!
