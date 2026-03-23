# Testing & Validation Guide

## Unit Testing

### Backend Testing

Install test dependencies:

```bash
cd backend
npm install --save-dev jest supertest
```

Create `backend/__tests__/openaiService.test.js`:

```javascript
const { analyzeResume, extractKeywords } = require("../services/openaiService");

describe("OpenAI Service", () => {
  test("extractKeywords returns filtered words", () => {
    const keywords = extractKeywords("Python Django REST API database");
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain("python");
  });

  test("analyzeResume returns valid structure", async () => {
    const latex = "\\item Developer";
    const job = "Python expert needed";

    const result = await analyzeResume(latex, job);

    expect(result).toHaveProperty("changes");
    expect(result).toHaveProperty("matchScore");
    expect(result).toHaveProperty("jobKeywords");
    expect(typeof result.matchScore).toBe("number");
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.matchScore).toBeLessThanOrEqual(100);
  });

  test("throws error on empty latex", async () => {
    await expect(analyzeResume("", "job desc")).rejects.toThrow();
  });

  test("throws error on empty job description", async () => {
    await expect(analyzeResume("\\item Work", "")).rejects.toThrow();
  });
});
```

Run tests:

```bash
npm test
```

### Frontend Testing

Install dependencies:

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Create `frontend/src/services/api.test.js`:

```javascript
import { analyzeResume } from "./api";
import axios from "axios";

jest.mock("axios");

describe("API Service", () => {
  test("analyzeResume calls correct endpoint", async () => {
    const mockData = {
      changes: [],
      matchScore: 75,
      jobKeywords: [],
    };

    axios.post.mockResolvedValue({ data: mockData });

    const result = await analyzeResume("test", "test");

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/analyze"),
      { latex: "test", jobDescription: "test" },
    );
    expect(result).toEqual(mockData);
  });

  test("throws error on failed request", async () => {
    axios.post.mockRejectedValue(new Error("Network error"));

    await expect(analyzeResume("test", "test")).rejects.toThrow();
  });
});
```

## Integration Testing

### API Integration Test

Create `backend/tests/integration.test.js`:

```javascript
const request = require("supertest");
const app = require("../server");

describe("API Integration", () => {
  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  test("POST /api/analyze with valid data", async () => {
    const res = await request(app).post("/api/analyze").send({
      latex: "\\item Backend developer",
      jobDescription: "Need Python and AWS skills",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("changes");
    expect(res.body).toHaveProperty("matchScore");
  });

  test("POST /api/analyze rejects empty latex", async () => {
    const res = await request(app).post("/api/analyze").send({
      latex: "",
      jobDescription: "Job desc",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
```

## Manual Testing Checklist

### Backend Tests

- [ ] Health check endpoint responds

  ```bash
  curl http://localhost:5000/health
  ```

- [ ] API accepts valid input

  ```bash
  curl -X POST http://localhost:5000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"latex": "test", "jobDescription": "test"}'
  ```

- [ ] API validates empty fields

  ```bash
  curl -X POST http://localhost:5000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"latex": "", "jobDescription": "test"}'
  ```

- [ ] API returns structured JSON with changes array
- [ ] Match score is between 0-100
- [ ] Keywords are extracted from job description

### Frontend Tests

- [ ] Page loads without errors (F12 console)
- [ ] Textareas accept input
- [ ] "Analyze" button disables when inputs empty
- [ ] Loading spinner appears during analysis
- [ ] Results display with:
  - [ ] Match score
  - [ ] Keywords
  - [ ] Changes list

- [ ] Each change shows:
  - [ ] Original line
  - [ ] Updated line
  - [ ] Reason
  - [ ] Apply button

- [ ] Apply button updates resume text
- [ ] Applied change disappears from list
- [ ] Error messages display properly
- [ ] Can test with example data from `/examples` folder

## Performance Testing

### Load Testing with Locust

Create `backend/load_test.py`:

```python
from locust import HttpUser, task, between
import json

class ResumeUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def analyze_resume(self):
        payload = {
            "latex": "\\item Developer with 5 years experience",
            "jobDescription": "Looking for Python backend engineer with AWS skills"
        }
        self.client.post("/api/analyze", json=payload)
```

Run load test:

```bash
pip install locust
locust -f backend/load_test.py --host=http://localhost:5000
```

Open `http://localhost:8089` and start test.

### Response Time Benchmarks

Expected times (on typical hardware):

- | Scenario | Time |
- | Empty resume + short job | 3-5 seconds |
- | Full resume + detailed job | 8-15 seconds |
- | Very long inputs (2000+ words) | 15-30 seconds |

## Edge Cases to Test

### Valid Edge Cases

1. **Minimal Input**

   ```latex
   \item Experience
   ```

   Job: "Need developers"
   ✓ Should handle gracefully

2. **Very Long Input**
   - 10,000+ character resume
   - 5,000+ word job description
     ✓ Should process without timeout

3. **Special Characters in LaTeX**

   ```latex
   \item Built \& tested \{systems\}
   ```

   ✓ Should preserve LaTeX escaping

4. **Unicode Characters**

   ```latex
   \item Worked with café, naïve, émojis 🚀
   ```

   ✓ Should handle correctly

5. **Multiple LaTeX Commands**
   ```latex
   \item \textbf{Bold} and \textit{italic} \emph{experience}
   ```
   ✓ Should not break formatting

### Invalid Edge Cases (Should Error Gracefully)

1. **Empty inputs**
   - ✓ Should return 400 with error message

2. **Only whitespace**
   - ✓ Should return 400

3. **Non-string inputs**

   ```json
   { "latex": 123, "jobDescription": "test" }
   ```

   - ✓ Should return 400

4. **Missing fields**

   ```json
   { "latex": "test" }
   ```

   - ✓ Should return 400

5. **Malformed JSON**
   - ✓ Should return 400

## Sample Test Data Results

Using `examples/sample_resume.tex` and `examples/sample_job_description.txt`:

**Expected output structure:**

```json
{
  "changes": [
    {
      "original": "Developed and maintained backend systems",
      "updated": "Designed and implemented scalable microservices using Python 3.8+, PostgreSQL, and REST APIs",
      "reason": "Job emphasizes microservices, specific Python version, PostgreSQL, and REST design"
    }
  ],
  "matchScore": 68,
  "jobKeywords": ["python", "postgresql", "aws", "docker", "kubernetes", ...]
}
```

## Continuous Integration (GitHub Actions)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: cd frontend && npm install
      - run: cd frontend && npm test
      - run: cd frontend && npm run build
```

## Validation Checklist

Before deploying to production:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No console errors in browser (F12)
- [ ] No console errors in backend logs
- [ ] API validates all inputs correctly
- [ ] Error messages are user-friendly
- [ ] Response times are acceptable (<15 seconds)
- [ ] OpenAI API key is secure (not in code)
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (for production)
- [ ] Monitoring/logging is configured
- [ ] Documentation is up-to-date
- [ ] Example data works correctly
- [ ] Can handle concurrency (multiple simultaneous requests)
- [ ] Network errors are handled gracefully

## Known Limitations

1. **OpenAI Rate Limits**: May get rate-limited on high volume
   - Solution: Implement token bucket or queue system

2. **Large Resumes**: Very large resumes (>200 lines) may be truncated
   - Solution: Implement chunking strategy

3. **LaTeX Complexity**: Extremely complex LaTeX may not parse correctly
   - Solution: Pre-process or use specialized LaTeX parser

4. **Job Description Parsing**: Some job formatting may not extract keywords well
   - Solution: Implement better NLP preprocessing

## Debugging Tips

### Backend Debugging

Enable detailed logging:

```javascript
// server.js
if (process.env.DEBUG) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

Run with:

```bash
DEBUG=1 npm run dev
```

### Frontend Debugging

React DevTools browser extension helps inspect component state and props.

Check network tab (F12 → Network) to see API requests/responses.

## Reporting Issues

When reporting bugs, include:

1. Steps to reproduce
2. Expected vs actual behavior
3. Browser console errors (F12 → Console)
4. Backend logs output
5. Full error message
6. Sample inputs
