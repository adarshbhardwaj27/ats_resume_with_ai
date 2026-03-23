# AI Provider Switching Guide

This guide explains how to use different AI providers (OpenAI or Google Gemini) with Resume Tailor.

## Quick Start: 3 Steps to Switch Providers

### Step 1: Get API Key

**For OpenAI:**

1. Go to [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Create new API key
3. Copy it (you'll only see it once!)

**For Google Gemini:**

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy it

### Step 2: Update .env File

Open `backend/.env` in a text editor and add:

**Option A: OpenAI (Use gpt-3.5-turbo)**

```
OPENAI_API_KEY=sk-proj-your-key-here
AI_PROVIDER=openai
PORT=5000
NODE_ENV=development
```

**Option B: Google Gemini (Free tier available)**

```
GEMINI_API_KEY=AIzaSy_your-key-here
AI_PROVIDER=gemini
PORT=5000
NODE_ENV=development
```

### Step 3: Restart Backend

```bash
# Kill the running backend (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

You should see in the terminal:

```
Server running on http://localhost:5000
✓ AI Provider configured: openai (or gemini)
```

**Done!** The frontend will automatically use the configured provider.

---

## Which Provider Should I Use?

### OpenAI (gpt-3.5-turbo)

**Best For:** Production use, consistent quality

| Feature        | Value                    |
| -------------- | ------------------------ |
| **Cost**       | ~$0.01-0.03 per analysis |
| **Free Trial** | $5 credit                |
| **Quality**    | Excellent                |
| **Speed**      | Fast (~1-3 sec)          |
| **Setup**      | Easy                     |
| **Model**      | gpt-3.5-turbo            |

**When to use:**

- ✅ You want the best quality
- ✅ You're okay with a small cost (~$0.01 per analysis)
- ✅ You have a paid OpenAI account

### Google Gemini (gemini-2.5-flash)

**Best For:** Experimentation, free usage, fast responses

| Feature       | Value                  |
| ------------- | ---------------------- |
| **Cost**      | Free (with limits)     |
| **Free Tier** | 10 requests per minute |
| **Quality**   | Excellent              |
| **Speed**     | Very Fast (~0.5-2 sec) |
| **Setup**     | Easy                   |
| **Model**     | gemini-2.5-flash       |

**When to use:**

- ✅ You want to try it free first
- ✅ You don't need high volume analysis
- ✅ You prefer free services

---

## Detailed Setup: OpenAI

### Get OpenAI API Key

1. **Sign up/Log in**: https://platform.openai.com
2. **Go to API keys**: https://platform.openai.com/account/api-keys
3. **Create new secret key**
4. **Copy it** (shown only once!)
5. **Keep it secret** (don't share or commit to git)

### Verify Your Account Has Access

If you get error: `404 The model gpt-3.5-turbo does not exist`

**Solution**: Your account may be too new or in trial. Try:

1. Check if you've verified your email
2. Add a payment method
3. Use different account

### Configure Resume Tailor

File: `backend/.env`

```
# =====================================
# OpenAI Configuration
# =====================================

# Your API key from https://platform.openai.com/account/api-keys
OPENAI_API_KEY=sk-proj-abc123def456

# Select OpenAI as provider
AI_PROVIDER=openai

# Server settings
PORT=5000
NODE_ENV=development
```

### Start Backend

```bash
cd backend
npm run dev
```

### Expected Output

```
✓ Server running on http://localhost:5000
✓ AI Provider configured: openai
✓ Listening for requests...
```

### Usage & Cost

Each resume analysis costs approximately:

- **Input**: 0.0005 tokens/token (your resume + job description)
- **Output**: 0.0015 tokens/token (suggested changes)
- **Average**: $0.01-0.03 per analysis

**Estimate**: 100 analyses = $1-3

---

## Detailed Setup: Google Gemini

### Get Gemini API Key

1. **Go to**: https://makersuite.google.com/app/apikey
2. **Sign in** with Google account
3. **Click "Create API Key"**
4. **Copy the key**
5. **Keep it secret** (don't share or commit to git)

### Free Tier Limits

- **Requests**: 60 per minute
- **Cost**: Free
- **Upgrade**: Available at higher tiers

### Configure Resume Tailor

File: `backend/.env`

```
# =====================================
# Google Gemini Configuration
# =====================================

# Your API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSy_xyz123abc456

# Select Gemini as provider
AI_PROVIDER=gemini

# Server settings
PORT=5000
NODE_ENV=development
```

### Make Sure Dependencies Are Installed

```bash
cd backend
npm install
```

This installs `@google/generative-ai` package.

### Start Backend

```bash
npm run dev
```

### Expected Output

```
✓ Server running on http://localhost:5000
✓ AI Provider configured: gemini
✓ Listening for requests...
```

### Usage & Cost

- **Free Tier**: Unlimited for testing (60 req/min limit)
- **Paid Tier**: Pay-as-you-go pricing (very cheap)

---

## Switching Providers (Already Using One)

### Scenario: You've been using OpenAI, want to try Gemini

```bash
# 1. Get Gemini API key from makersuite.google.com/app/apikey
# 2. Edit backend/.env
#    - Keep OPENAI_API_KEY (or delete it)
#    - Add GEMINI_API_KEY=AIzaSy_...
#    - Change AI_PROVIDER=gemini

# 3. Save file
# 4. Restart backend (stop with Ctrl+C, then npm run dev)
```

### Verify Switch Worked

Check backend output shows:

```
✓ AI Provider configured: gemini
```

Or test with curl:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "latex": "\\documentclass{article}\n\\begin{document}\n\\item Test experience",
    "jobDescription": "Senior Software Engineer, 5+ years Python"
  }'
```

---

## Troubleshooting

### Error: "Invalid API key"

**Cause**: Wrong key or typo in .env

**Solution**:

1. Copy key again from provider website
2. Paste into `.env` exactly as shown
3. No extra spaces around `=`
4. Restart backend

Example (WRONG):

```
OPENAI_API_KEY = sk-proj-xxx   ❌ (spaces around =)
```

Example (CORRECT):

```
OPENAI_API_KEY=sk-proj-xxx     ✅
```

### Error: "GEMINI_API_KEY not found"

**Cause**: Key not set in .env when `AI_PROVIDER=gemini`

**Solution**:

1. Verify `GEMINI_API_KEY=` line exists in `.env`
2. Verify you used `AI_PROVIDER=gemini` (not `openai`)
3. Verify `.env` file is in `backend/` folder (not root)
4. Restart backend

### Error: "Rate limit exceeded"

**Cause**: Too many requests to Gemini API

**Solution**:

- Free tier: 60 requests per minute
- Wait a minute and try again
- Or upgrade to paid tier
- Or use OpenAI instead

### Results Different Between Providers

**This is normal!** Different models give different suggestions:

- OpenAI (gpt-3.5-turbo): More concise
- Gemini (gemini-pro): More detailed

**Solution**: Test both, choose the one you prefer.

### Frontend Still Shows Old Provider

**Cause**: Frontend cached old setting

**Solution**:

1. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache
3. Close and reopen browser

### .env File Not Being Read

**Cause**: File in wrong location

**Solution**:

- File must be at: `backend/.env` (in backend folder)
- Not at project root
- Not in frontend folder

Run from backend folder to verify:

```bash
cd backend
ls -la .env      # Mac/Linux - should show .env file
dir .env         # Windows - should show .env file
```

---

## Environment Setup Reference

### Complete .env Example (OpenAI)

```
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
AI_PROVIDER=openai

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Complete .env Example (Gemini)

```
# Google Gemini Configuration
GEMINI_API_KEY=AIzaSy_YOUR-KEY-HERE
AI_PROVIDER=gemini

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Both Keys Set (Can Switch Easily)

```
# OpenAI
OPENAI_API_KEY=sk-proj-YOUR-OPENAI-KEY

# Google Gemini
GEMINI_API_KEY=AIzaSy_YOUR-GEMINI-KEY

# Active Provider (change this to switch)
AI_PROVIDER=openai    # or 'gemini'

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## Advanced: Adding More Providers

If you want to add Anthropic Claude, Cohere, or other providers:

1. See [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md#adding-a-new-ai-provider)
2. Follow the step-by-step guide
3. Submit PR to main repo (if you want to contribute)

---

## FAQ

**Q: Can I use both providers simultaneously?**
A: No, the app currently uses one at a time. Switch via AI_PROVIDER environment variable.

**Q: Which provider is cheaper?**
A: Gemini's free tier is free. OpenAI costs ~$1-3 per 100 analyses.

**Q: Which provider is better quality?**
A: OpenAI (gpt-3.5-turbo) generally gives more refined results. Gemini is also good.

**Q: How do I use GPT-4 instead of gpt-3.5-turbo?**
A: Requires paid OpenAI account + code change in `backend/services/openaiService.js` (advanced).

**Q: Can I contribute another provider?**
A: Yes! See CONFIG_REFERENCE.md section "Adding a New AI Provider".

**Q: What if I want to switch providers mid-way?**
A: Edit `.env`, change `AI_PROVIDER`, restart backend. That's it!

---

## Need Help?

- **Backend won't start**: Check error message, search in README.md
- **API key not working**: Verify with provider's website
- **Wrong results format**: Restart backend after changing .env
- **Still stuck**: See GETTING_STARTED.md or CONFIG_REFERENCE.md

---

## See Also

- [GETTING_STARTED.md](GETTING_STARTED.md) - Complete setup guide
- [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md) - All configuration options
- [README.md](README.md) - Full documentation
