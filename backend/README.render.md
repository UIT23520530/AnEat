# Deploy AnEat Backend to Render

## Quick Start

### 1. Create PostgreSQL Database
1. Go to https://dashboard.render.com/
2. New → PostgreSQL
3. Name: `aneat-postgres`
4. Region: Singapore
5. Copy **Internal Database URL**

### 2. Create Web Service
1. New → Web Service
2. Connect your GitHub repository
3. Settings:
   - **Name**: `aneat-backend`
   - **Region**: Singapore
   - **Root Directory**: `backend`
   - **Environment**: Docker
   - **Branch**: `main`

### 3. Add Environment Variables
```
DATABASE_URL=<Internal Database URL from step 1>
NODE_ENV=production
PORT=10000
JWT_SECRET=<Generate with: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.onrender.com
```

### 4. Deploy
- Click "Create Web Service"
- Wait ~5-10 minutes

### 5. Test
```bash
curl https://aneat-backend.onrender.com/health
```

## Notes
- Free plan: Service spins down after 15 min inactivity
- Cold start: ~30 seconds
- Database: 1GB storage on free plan

## Full Documentation
See [RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md) for complete guide.
