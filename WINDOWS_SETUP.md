# Windows Setup & Troubleshooting Guide

This guide is specifically for Windows users who want to get Resume Tailor running.

## Prerequisites for Windows

### 1. Download Node.js

1. Go to https://nodejs.org/
2. Download **LTS (Long Term Support)** version (18.x or newer)
3. Run the installer
4. Accept defaults during installation
5. Choose "Add to PATH" ✅

### 2. Verify Installation

Open **PowerShell** or **Command Prompt**:

```powershell
node --version      # Should show v18.x or higher
npm --version       # Should show 9.x or higher
```

If not recognized, restart your machine.

### 3. Get OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Keep it safe

## Step-by-Step Windows Setup

### Step 1: Open PowerShell or Terminal

⚠️ **DO NOT use Command Prompt** - Use PowerShell or Windows Terminal (better)

Press: `Win + X` → Choose "Windows Terminal" or "PowerShell"

### Step 2: Navigate to Project

```powershell
cd "C:\path\to\ai_ats_resume"
```

Or if in Downloads:

```powershell
cd "$env:USERPROFILE\Downloads\ai_ats_resume"
```

### Step 3: Backend Setup

#### 3a. Install Backend Dependencies

```powershell
cd backend
npm install
```

This will take 1-2 minutes. You'll see lots of text. This is normal.

#### 3b. Create .env File

```powershell
Copy-Item .env.example .env
```

#### 3c. Edit .env File

Using Notepad:

```powershell
notepad .env
```

**Replace this line:**

```
OPENAI_API_KEY=your_openai_api_key_here
```

**With your actual API key:**

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

Save the file (Ctrl+S, then close)

#### 3d. Start Backend

```powershell
npm run dev
```

You should see:

```
Server running on http://localhost:5000
OpenAI API Key configured: true
```

✅ **Backend is running! Leave this window open.**

### Step 4: Frontend Setup (New PowerShell Window)

Press: `Win + X` → "Windows Terminal" or open new PowerShell

```powershell
# Navigate to frontend
cd "C:\path\to\ai_ats_resume\frontend"

# Install dependencies
npm install

# Start frontend
npm start
```

This will open your browser automatically at `http://localhost:3000`

✅ **Both servers are running!**

## Testing It

1. **Open** http://localhost:3000
2. **Paste** example LaTeX resume (from `examples/sample_resume.tex`)
3. **Paste** job description (from `examples/sample_job_description.txt`)
4. **Click** "Analyze Resume"
5. **Wait** 5-15 seconds
6. **Review** suggestions

## Windows-Specific Issues & Solutions

### Issue 1: "command not found: npm"

**Cause**: Node.js not installed or PATH not set

**Solution**:

1. Download and install Node.js from https://nodejs.org/
2. Make sure "Add to PATH" is checked during install
3. **Restart your computer**
4. Close and re-open PowerShell
5. Try `npm --version` again

### Issue 2: "OPENAI_API_KEY" format wrong

**Cause**: .env file encoding or format issue

**Solution**:

```powershell
# Delete old .env
Remove-Item .env

# Recreate from template
Copy-Item .env.example .env

# Edit with PowerShell (preserves encoding)
notepad .env
```

**Make sure the format is:**

```
OPENAI_API_KEY=sk-xxxxx
PORT=5000
```

No quotes, no spaces around `=`

### Issue 3: Port Already in Use

**Error**:

```
listen EADDRINUSE: address already in use :::5000
```

**Solution A**: Kill process using the port

```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue |
  foreach { Get-Process -Id $_.OwningProcess }

# Kill it
Stop-Process -Name "node" -Force
```

**Solution B**: Use different port

Edit `backend/.env`:

```
PORT=8000
```

Then restart backend.

### Issue 4: Frontend won't load page

**Cause**: Backend not running

**Solution**:

1. Check first PowerShell window shows "Server running on http://localhost:5000"
2. If not, restart backend: Stop (Ctrl+C) and run `npm run dev`
3. Refresh browser (F5)

### Issue 4B: "404 The model gpt-4-turbo does not exist or you do not have access"

**Cause**: Your OpenAI account doesn't have GPT-4 access (very common for free accounts)

**Solution**: The app now uses **gpt-3.5-turbo** by default - just restart!

```powershell
# Stop backend with Ctrl+C
# Then restart:
npm run dev
```

**What happened?**

- The app switched from gpt-4-turbo to gpt-3.5-turbo
- gpt-3.5-turbo works for ALL OpenAI accounts (free tier included)
- It costs ~90% less (~$0.0005 per analysis)
- Quality is still excellent for resume editing

**If you want GPT-4** (requires paid OpenAI account):

1. Open PowerShell and edit the file:

   ```powershell
   notepad backend/services/openaiService.js
   ```

2. Find line 58: `model: 'gpt-3.5-turbo',`

3. Change to: `model: 'gpt-4-turbo',`

4. Save (Ctrl+S, Close notepad)

5. Restart backend: `npm run dev`

### Issue 5: "Module not found: openai"

**Cause**: npm install didn't complete

**Solution**:

```powershell
# In backend folder
cd backend

# Delete old modules
Remove-Item node_modules -Recurse -Force

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Try again
npm run dev
```

### Issue 6: CORS Error in Browser

**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
Make sure backend is running on port 5000 and responding:

```powershell
# Test backend health
curl http://localhost:5000/health
```

Should return: `{"status":"ok"}`

If not working, restart backend.

### Issue 7: npm script syntax error

**If you see: `.gitignore` or similar errors**

**Solution**: Make sure you're in the correct folder

```powershell
# For backend
cd backend
npm run dev

# For frontend (different terminal)
cd frontend
npm start
```

**NOT** from root folder.

### Issue 8: Very slow on Windows

**Cause**: Antivirus or Windows Defender scanning

**Solution**:

1. Disable real-time scanning temporarily
   - Settings → Virus & threat protection
   - Manage settings → Turn off real-time protection
2. Or add exclusion for your project folder
   - Settings → Virus & threat protection
   - Manage settings → Add exclusions

## Speeding Up npm on Windows

### Solution 1: Use npm Cache

```powershell
npm install --prefer-offline
```

### Solution 2: Use Faster npm Mirror (Optional)

```powershell
npm config set registry https://registry.npmmirror.com
```

### Solution 3: Increase npm Timeout

```powershell
npm config set fetch-timeout 60000
npm install
```

## File Permissions Issues

If you see "permission denied" errors:

```powershell
# Run PowerShell as Administrator
# Then try npm install again
```

## Environment Path Issues

If Node.js not found in PowerShell:

```powershell
# Check where Node is installed
where node

# If nothing, add to path manually
$env:Path += ";C:\Program Files\nodejs"

# Verify
node --version
```

## Editing Files on Windows

### Option 1: Notepad (Simple)

```powershell
notepad filename.js
```

### Option 2: Visual Studio Code (Recommended)

Download from https://code.visualstudio.com/

Then:

```powershell
code .
```

Opens project in VS Code

### Option 3: PowerShell ISE

Built into Windows:

```powershell
ise filename.js
```

## Terminal Tips for Windows

### Using Windows Terminal (Recommended)

1. Download from Microsoft Store (free)
2. Supports multiple tabs
3. Better performance

### Using PowerShell

Press `Win + X` → "Windows Terminal" or "PowerShell"

### Using Command Prompt

⚠️ **Not Recommended** - Use PowerShell instead

But if you must:

```cmd
cd backend
npm run dev
```

## Multiple Terminal Windows Setup

### Using Windows Terminal (Best)

```powershell
# Terminal 1
cd backend
npm run dev

# Click + to open new tab
# Terminal 2
cd frontend
npm start
```

### Using Multiple PowerShell Windows

1. Open first PowerShell: Run backend
2. Open second PowerShell: Run frontend
3. Arrange windows side-by-side

## Checking Port Status

```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Check what's using port 3000
netstat -ano | findstr :3000

# Get process name from PID
Get-Process -Id <PID_NUMBER>

# Kill process
Stop-Process -Id <PID_NUMBER> -Force
```

## Git Setup (Optional)

If you want to use Git on Windows:

1. Download Git for Windows: https://git-scm.com/
2. Use from PowerShell:

```powershell
git clone <repo-url>
git add .
git commit -m "message"
git push
```

## Windows Defender/Antivirus Issues

If npm install is very slow:

1. Windows Settings
2. Search "Virus & threat protection"
3. Click "Manage settings"
4. Add folder exclusion:
   - `C:\Users\YourUsername\ai_ats_resume`

## Batch File for Quick Start (Optional)

Create `start.bat` in your project root:

```batch
@echo off
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 2
start "Frontend" cmd /k "cd frontend && npm start"
```

Then double-click `start.bat` to start both servers.

## PowerShell Profile Setup (Advanced)

To auto-navigate to project on startup:

```powershell
# Edit profile
notepad $PROFILE

# Add this line
cd "C:\path\to\ai_ats_resume"

# Save and restart PowerShell
```

## Windows 11 Specific

Windows 11 can have issues with Node.js paths. If Node not found:

1. Open Settings
2. Search "Environment Variables"
3. Click "Edit the system environment variables"
4. Click "Environment Variables"
5. Under "Path", verify:
   - `C:\Program Files\nodejs` is listed
6. Click OK and restart PowerShell

## Reinstall Everything (Clean Start)

If everything is broken:

```powershell
# Remove node_modules
cd backend
Remove-Item node_modules -Recurse -Force

cd ../frontend
Remove-Item node_modules -Recurse -Force

# Clear npm cache
npm cache clean --force

# Reinstall
cd backend
npm install

cd ../frontend
npm install
```

## Getting Help on Windows

1. **Check error in PowerShell** - Copy full error message
2. **Check browser console** - F12 → Console tab
3. **Search error online** - Most issues are common
4. **Verify setup** - Restart both servers and try again

## Windows Defender SmartScreen

If you see SmartScreen warning about .exe files:

1. Click "More info"
2. Click "Run anyway"
3. This is normal for open-source tools

## WSL2 (Windows Subsystem for Linux)

If you prefer Linux-style development:

1. Enable WSL2 in Windows
2. Install Linux distribution (Ubuntu recommended)
3. Install Node.js in Linux
4. Follow Linux setup instructions

Many developers find WSL2 faster and more reliable on Windows.

## Firewall Issues

If frontend can't reach backend:

1. Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add `node.exe`
4. Or disable firewall temporarily for testing

## Virtual Environment (Optional)

You can use containerization to avoid Windows issues:

```powershell
# Install Docker Desktop for Windows
# Then run:
docker-compose up

# Accesses at http://localhost:3000
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more.

## Performance Tuning

### Faster npm Installs

```powershell
# Use npx and no-optional flags
npm install --no-optional

# Or use yarn (faster)
npm install -g yarn
yarn install
```

### Frontend Hot Reload

Frontend already has hot reload. Just save files and browser refreshes automatically.

### Backend Auto-Reload

Backend uses `nodemon`. Restarts when files change. Just save!

## Visual Studio Code Integration (Recommended)

1. Download VS Code
2. Install extensions:
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - Tailwind CSS IntelliSense
   - Thunder Client (for API testing)

3. Open project:

```powershell
code .
```

4. Press Ctrl+` to open integrated terminal
5. Split terminal to run both servers

## SSH Issues (If Deploying)

If you see SSH errors (shouldn't happen locally):

```powershell
# Generate SSH key
ssh-keygen -t rsa -b 4096

# Check if it worked
Test-Path "$env:USERPROFILE\.ssh\id_rsa"
```

## Final Checklist for Windows

- [ ] Node.js installed (`node --version` works)
- [ ] npm works (`npm --version` works)
- [ ] Project folder accessible
- [ ] .env file created with API key
- [ ] `npm install` completed in both folders
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can input text in forms
- [ ] Test works and returns results

---

If you're still stuck:

1. Check [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Check [TESTING.md](./TESTING.md)
3. Look at browser console (F12)
4. Look at PowerShell error output
5. Try restarting both servers
6. Try a Windows restart

**You've got this!** 💪
