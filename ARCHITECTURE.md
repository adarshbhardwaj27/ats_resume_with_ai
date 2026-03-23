# Architecture & Design Decisions

## Project Overview

Resume Tailor is a full-stack web application that uses AI to provide minimal, targeted edits to LaTeX resumes to improve alignment with specific job descriptions. The application emphasizes safety, reliability, and user control.

## Architecture

### High-Level Flow

```
User Input (LaTeX + Job Description)
            ↓
        Frontend (React)
            ↓
        HTTP POST Request
            ↓
        Backend (Express) ← Validates Input
            ↓
        OpenAI API ← Sends Prompt
            ↓
        JSON Response ← Validates Response
            ↓
        Frontend Display ← Shows Changes
            ↓
        User Applies Changes Manually
            ↓
        Updated Resume in Textarea
```

### Component Breakdown

#### Frontend (React)

**App.jsx** - Main Container

- State management for inputs and results
- Orchestrates component interactions
- Handles apply change logic

**InputForm.jsx** - User Input Collection

- LaTeX resume textarea
- Job description textarea
- Character count feedback
- Loading state during analysis
- Input validation (disabled states)

**ChangesList.jsx** - Results Display

- Match score visualization
- Extracted keywords display
- Change suggestions with:
  - Original vs updated comparison
  - Reason for change
  - Apply button per change

**ErrorMessage.jsx** - Error Handling

- User-friendly error display
- Dismissible errors
- Contextual error messages

**api.js** - API Communication

- Axios wrapper for backend calls
- Error transformation
- Request timeout handling

#### Backend (Express)

**server.js** - Application Entry Point

- Express app setup
- CORS configuration
- Middleware stack
- Route registration
- Error handlers
- 404 handling

**analyzeRoutes.js** - API Endpoint

- POST /api/analyze handler
- Request validation
- Input sanitization
- Response formatting
- Error mapping

**openaiService.js** - AI Integration

- OpenAI client initialization
- System prompt definition
- Resume analysis logic
- JSON response validation
- Keyword extraction
- Match score calculation

## Key Design Decisions

### 1. **Minimal Edits Philosophy**

**Decision**: Never rewrite the entire resume; only suggest specific line-level changes.

**Why**:

- **User Trust**: Users maintain control and can verify each change
- **Safety**: Reduces hallucination risk - fewer changes = fewer opportunities for errors
- **Explainability**: Each change includes a reason tied to the job description
- **Reversibility**: Users can easily ignore specific suggestions

**Implementation**:

- Prompt explicitly forbids full rewrites
- Response structure enforces one-to-one original-to-updated mapping
- UI shows both versions side-by-side

### 2. **LaTeX Safety**

**Decision**: Never modify LaTeX commands, only content inside lines.

**Why**:

- **Compilation Safety**: Modified resumes remain valid LaTeX
- **User Intent**: Preserves original resume structure and formatting intent
- **Simplicity**: Avoids complex LaTeX parsing logic

**Implementation**:

- Prompt includes explicit rule: "DO NOT modify LaTeX commands"
- Changes are text-level, not structural
- Validation ensures no command injection

### 3. **JSON-Only Response Format**

**Decision**: OpenAI returns ONLY valid JSON, no explanation text.

**Why**:

- **Predictability**: Easier to parse and validate
- **Reliability**: No need for natural language parsing
- **Error Handling**: Invalid JSON signals a problem immediately

**Implementation**:

- Prompt explicitly states "Return ONLY valid JSON"
- Backend parses and validates JSON structure
- Helpful error messages if parse fails

### 4. **Keyword Extraction & Match Scoring**

**Decision**: Extract keywords from job description to guide matching and scoring.

**Why**:

- **Relevance**: Ensures suggestions target actual job requirements
- **Transparency**: Users see which keywords the system is optimizing for
- **Scoring**: Provides concrete 0-100 score for resume-job fit

**Implementation**:

```
Match Score = (Keyword Match % × 0.6) + (Change Impact × 0.4)
```

- Simple, explainable formula
- 60% weight on keyword coverage
- 40% weight on suggested changes
- Results in realistic 0-100 range

### 5. **Stateless Request Handling**

**Decision**: Each API call is independent; no session/history storage required initially.

**Why**:

- **Simplicity**: No database layer needed for MVP
- **Scalability**: Easily deployable to serverless platforms
- **Privacy**: No data stored server-side
- **Future-Proof**: Can add persistence later if needed

**Implementation**:

- Backend is stateless
- No database layer
- Each request-response is isolated

### 6. **Error Gracefully**

**Decision**: Comprehensive validation at multiple levels with clear error messages.

**Why**:

- **User Experience**: Users understand what went wrong
- **Debugging**: Clear stack traces for developers
- **Reliability**: Catches issues before they become problems

**Implementation**:

- Frontend input validation (prevent empty submissions)
- Backend input length/type validation
- JSON structure validation
- OpenAI API error mapping
- User-friendly error messages

### 7. **Modular Component Structure**

**Decision**: Separate concerns into focused, reusable components.

**Why**:

- **Maintainability**: Easy to locate and modify logic
- **Testability**: Each component can be tested independently
- **Reusability**: Components can be used in future features

**Implementation**:

```
Components are responsible for:
- InputForm → Collecting & managing input state
- ChangesList → Displaying results
- ErrorMessage → Error UI
- api.js → Backend communication
```

### 8. **GPT-4 Turbo Selection**

**Decision**: Use GPT-4 Turbo instead of GPT-3.5.

**Why**:

- **Code Understanding**: Better at understanding LaTeX syntax
- **Instruction Following**: Better at strict constraints (no rewrites, JSON only)
- **Accuracy**: Lower hallucination rates
- **Performance**: Similar speed to GPT-3.5

**Alternative**: Could use GPT-3.5 Turbo for 90% cost reduction if accuracy is acceptable

### 9. **TailwindCSS for Styling**

**Decision**: Use utility-first CSS framework instead of custom CSS/styled-components.

**Why**:

- **Speed**: Rapid UI development and styling
- **Consistency**: Built-in color/spacing system
- **Bundle Size**: Purges unused styles in production
- **Maintainability**: Styles co-located with markup

## Data Flow Diagrams

### Analysis Request Flow

```
Frontend
  ├─ User inputs LaTeX & Job Description
  ├─ Validates: not empty, reasonable size
  ├─ Creates JSON: {latex, jobDescription}
  ├─ Makes HTTP POST to /api/analyze
  ├─ Shows loading spinner
  └─ Awaits response

Backend
  ├─ Receives POST request
  ├─ Validates inputs:
  │  ├─ Required fields present
  │  ├─ Type is string
  │  ├─ Length > 0
  │  └─ Return 400 if invalid
  ├─ Calls analyzeResume()
  ├─ Constructs OpenAI prompt
  ├─ Calls OpenAI API
  ├─ Validates JSON response
  ├─ Calculates match score
  ├─ Extracts keywords
  ├─ Returns: {changes, matchScore, jobKeywords}
  └─ Handles errors → 400/503

Frontend
  ├─ Receives response
  ├─ Updates state
  ├─ Renders ChangesList
  ├─ Hides loading spinner
  └─ User reviews suggestions

User
  ├─ Reviews each change
  ├─ Clicks "Apply Change"
  ├─ Change applied to resume
  ├─ Change removed from list
  └─ Process repeats
```

## Performance Characteristics

### Time Complexity

| Operation          | Complexity | Notes                         |
| ------------------ | ---------- | ----------------------------- |
| Input Validation   | O(n)       | Linear scan of input          |
| Keyword Extraction | O(n)       | Single pass word tokenization |
| Match Score Calc   | O(n+m)     | Compare resume vs keywords    |
| OpenAI Call        | O(1)       | External API, typically 5-15s |

### Space Complexity

| Component        | Complexity | Notes                                  |
| ---------------- | ---------- | -------------------------------------- |
| State (Frontend) | O(n)       | Stores full resume in memory           |
| API Response     | O(m)       | m = number of changes (typically 3-10) |
| Cached Keywords  | O(k)       | k = unique keywords extracted          |

### API Performance

- **Typical request**: 8-12 seconds
- **Fast request**: 5-7 seconds (short inputs)
- **Slow request**: 15-20 seconds (very long inputs)
- **Network overhead**: ~200ms round trip

## Security Considerations

### Input Security

✅ **Implemented**:

- Length limits (10MB max)
- Type validation (string only)
- No code execution
- CORS validation

⚠️ **Considerations**:

- LaTeX can execute commands - never evaluate parsed LaTeX
- Store user data minimally
- Rate limit production deployments

### API Security

✅ **Implemented**:

- OpenAI API key in environment variables
- HTTPS in production
- Basic error handling (no stack traces to user)

⚠️ **Considerations**:

- Add authentication if storing user data
- Implement rate limiting
- Add request signing/verification

### Frontend Security

✅ **Implemented**:

- No sensitive data in code
- Axios handles CORS
- No localStorage secrets

⚠️ **Considerations**:

- Content Security Policy headers
- XSS protection (React handles by default)
- CSRF tokens if forms added

## Scalability Analysis

### Current Capacity (Single Server)

- **Concurrent Users**: 10-20 simultaneous requests
- **Daily Capacity**: ~1,000-2,000 analyses per day
- **Bottleneck**: OpenAI API rate limits and costs

### Scaling Strategies

1. **Caching Layer**: Redis for duplicate request deduplication
2. **Queue System**: Bull/RabbitMQ for background processing
3. **Load Balancer**: Distribute across multiple backend instances
4. **CDN**: CloudFront/CloudFlare for frontend assets
5. **Database**: PostgreSQL for storing analyses (optional)
6. **Microservices**: Separate OpenAI orchestration service

## Testing Strategy

### Unit Tests

- Individual function testing
- Mocked dependencies
- Edge case coverage

### Integration Tests

- API endpoint testing
- Request-response validation
- Error scenario handling

### E2E Tests

- Full user workflow
- UI interaction testing
- Network testing

### Load Testing

- Concurrent request handling
- Response time under load
- Resource consumption monitoring

## Deployment Strategies

### Development

- Local on port 3000 (frontend) and 5000 (backend)
- Hot reload enabled
- Console logging verbose

### Staging

- Docker containers
- Separate backend/frontend services
- Integration testing suite

### Production

- Kubernetes/ECS for orchestration
- CDN for frontend static assets
- API rate limiting
- Monitoring and alerting
- Automated backups (if using database)

## Future Enhancements

### Short Term

- Save analysis history (localStorage first, then DB)
- Multiple resume versions
- Custom prompt templates
- Export to PDF

### Medium Term

- User authentication
- Cost tracking dashboard
- Batch analysis of multiple job descriptions
- Resume document upload

### Long Term

- Real-time collaboration
- Integration with ATS systems
- Machine learning for keyword prediction
- Mobile app
- Browser extension

## Code Quality Standards

### Frontend

- Functional components with hooks
- Props validation (optional: PropTypes)
- Modular CSS/Tailwind
- Clear component separation

### Backend

- Async/await patterns
- Structured error handling
- Input validation everywhere
- Comments for complex logic

### General

- Consistent naming conventions
- No magic numbers
- Environment-based configuration
- Testable architecture

## Known Limitations & Trade-offs

| Limitation               | Trade-off          | Rationale                      |
| ------------------------ | ------------------ | ------------------------------ |
| No persistent storage    | Simpler deployment | MVP can be fully stateless     |
| No user accounts         | Privacy-first      | Every analysis is independent  |
| Stateless backend        | Can't retry/resume | Simple infrastructure          |
| Single thread processing | Faster deployment  | Node event loop sufficient     |
| No LaTeX parsing         | Input assumptions  | Safe but less flexible         |
| GPT-4 only               | Higher cost        | Better accuracy justifies cost |

## Conclusion

Resume Tailor prioritizes **correctness**, **simplicity**, and **user control** over advanced features. The architecture is designed to be:

- ✅ **Safe**: Never silently modifies content
- ✅ **Reliable**: Comprehensive error handling
- ✅ **Maintainable**: Clear code organization
- ✅ **Scalable**: Stateless design allows horizontal scaling
- ✅ **Explainable**: Every suggestion has a reason

The design decisions reflect a philosophy of minimal intervention with maximum transparency—letting users make the final decisions about their resume content.
