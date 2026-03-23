#!/bin/bash

# Sample API test call to the backend
# Make sure the backend is running on localhost:5000

LATEX_RESUME='\documentclass{article}
\begin{document}
\section*{Experience}
\begin{itemize}
    \item Developed backend systems
    \item Managed database migrations
    \item Built REST APIs
\end{itemize}
\end{document}'

JOB_DESCRIPTION="We need a Python expert with PostgreSQL and AWS experience. REST API design is critical."

curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{
    \"latex\": $( echo "$LATEX_RESUME" | jq -R -s . ),
    \"jobDescription\": $( echo "$JOB_DESCRIPTION" | jq -R -s . )
  }" | jq .
