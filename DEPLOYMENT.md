# Deployment Guide

## Local Development

See [QUICKSTART.md](./QUICKSTART.md) for quick local setup.

## Production Deployment

### Backend Deployment (Heroku Example)

1. **Create Heroku App**

   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**

   ```bash
   heroku config:set OPENAI_API_KEY=sk-your-key
   heroku config:set NODE_ENV=production
   ```

3. **Create Procfile** (in backend root)

   ```
   web: node server.js
   ```

4. **Deploy**

   ```bash
   git push heroku main
   ```

5. **Backend URL**: `https://your-app-name.herokuapp.com`

### Frontend Deployment (Vercel Example)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend folder**

   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment**
   - Set `REACT_APP_API_URL` to your production backend URL

4. **Frontend URL**: `https://your-app-name.vercel.app`

### Docker Deployment

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t resume-tailorer-backend .
docker run -p 5000:5000 -e OPENAI_API_KEY=sk-xxx resume-tailorer-backend
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

ENV REACT_APP_API_URL=http://api:5000/api
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:

```nginx
events {
  worker_connections 1024;
}

http {
  server {
    listen 80;
    location / {
      root /usr/share/nginx/html;
      index index.html;
      try_files $uri /index.html;
    }
  }
}
```

### Docker Compose

Create `docker-compose.yml` in root:

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    networks:
      - resume-tailorer

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://backend:5000/api
    networks:
      - resume-tailorer

networks:
  resume-tailorer:
    driver: bridge
```

Run with:

```bash
OPENAI_API_KEY=sk-xxx docker-compose up
```

## AWS Deployment

### ECS with Fargate

1. **Create ECR repositories**

   ```bash
   aws ecr create-repository --repository-name resume-tailorer-backend
   aws ecr create-repository --repository-name resume-tailorer-frontend
   ```

2. **Push images**

   ```bash
   docker build -t resume-tailorer-backend ./backend
   docker tag resume-tailorer-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/resume-tailorer-backend:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/resume-tailorer-backend:latest
   ```

3. **Create Fargate services** via AWS Console or CLI

4. **Setup Load Balancer**
   - ALB to route traffic to both services

### S3 + CloudFront for Frontend

1. **Create S3 bucket**

   ```bash
   aws s3 mb s3://resume-tailorer-frontend
   ```

2. **Build and upload frontend**

   ```bash
   cd frontend
   npm run build
   aws s3 sync build/ s3://resume-tailorer-frontend/ --delete
   ```

3. **Create CloudFront distribution** pointing to S3

4. **Set environment variable** for backend API URL

## Performance Optimization

### Backend

- Use Redis for caching OpenAI responses (optional)
- Implement rate limiting
- Add request compression
- Use connection pooling for databases

### Frontend

- Enable code splitting
- Compress assets
- Implement lazy loading
- Cache static assets

## Monitoring

### Backend Monitoring

Add to `server.js`:

```javascript
const prometheus = require("prom-client");

// Collect default metrics
prometheus.collectDefaultMetrics();

app.get("/metrics", (req, res) => {
  res.set("Content-Type", prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Error Tracking

Use Sentry:

```javascript
const Sentry = require("@sentry/node");

Sentry.init({ dsn: "your-sentry-dsn" });
app.use(Sentry.Handlers.errorHandler());
```

## Database (Optional)

To store analysis history:

```javascript
// backend/models/analysis.js
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("analyses.db");

function saveAnalysis(latex, jobDescription, results) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO analyses (latex, jobDescription, results, createdAt) VALUES (?, ?, ?, ?)",
      [latex, jobDescription, JSON.stringify(results), new Date()],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      },
    );
  });
}

module.exports = { saveAnalysis };
```

## Security Considerations

1. **API Key Protection**
   - Never commit `.env` file
   - Use secrets management (AWS Secrets Manager, etc.)
   - Rotate keys regularly

2. **Input Validation**
   - Already implemented in backend
   - Consider rate limiting by IP

3. **CORS**
   - Restrict to your frontend domain in production

   ```javascript
   app.use(
     cors({
       origin: "https://yourdomain.com",
     }),
   );
   ```

4. **HTTPS**
   - Use SSL certificates (Let's Encrypt)
   - Enforce HTTPS redirects

5. **API Throttling**
   ```bash
   npm install express-rate-limit
   ```

## Cost Optimization

- OpenAI API: ~$0.01-0.03 per analysis (GPT-4 Turbo pricing)
- Consider using GPT-3.5 Turbo for lower costs (~$0.001 per analysis)
- Implement caching to avoid duplicate analyses

## Troubleshooting Deployment

| Issue                  | Solution                                             |
| ---------------------- | ---------------------------------------------------- |
| 502 Bad Gateway        | Backend not responding, check error logs             |
| CORS errors            | Check `REACT_APP_API_URL` matches backend domain     |
| Blank page on frontend | Check environment variables, inspect browser console |
| OpenAI timeout         | Increase timeout, use shorter inputs                 |
| High API costs         | Implement caching, use rate limiting                 |
