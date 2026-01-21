# 🔧 Troubleshooting Guide

## Common Deployment Issues

### ❌ Issue: Prisma OpenSSL Error on Render/Alpine Linux

**Error Message:**
```
Error loading shared library libssl.so.1.1: No such file or directory
Unable to require(`/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`)
```

**Root Cause:**
Alpine Linux doesn't include OpenSSL by default, which Prisma requires.

**Solution:** ✅ FIXED
1. **Updated Dockerfile** to install OpenSSL:
   ```dockerfile
   RUN apk add --no-cache openssl libc6-compat
   ```

2. **Updated prisma/schema.prisma** with correct binary targets:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
   }
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

**Alternative Solution:**
Switch to Debian-based Node image if Alpine continues causing issues:
```dockerfile
FROM node:20-slim
```

---

### ❌ Issue: Build Failed - TypeScript Errors

**Symptoms:**
- `error TS7030: Not all code paths return a value`
- `error TS18047: Object is possibly 'null'`

**Solution:** ✅ FIXED
All functions now have proper return statements and null checks.

---

### ❌ Issue: Database Connection Failed

**Error Message:**
```
Error: P1001: Can't reach database server
```

**Common Causes:**
1. **Wrong DATABASE_URL**: Check if using Internal URL (not External)
2. **Database not ready**: Wait a few minutes after creating database
3. **Network issue**: Verify Render service and database in same region

**Solution:**
```bash
# Verify DATABASE_URL in Render Dashboard
# Format: postgresql://user:password@internal-host:5432/dbname

# Test connection in Render Shell:
npx prisma db pull
```

---

### ❌ Issue: Migrations Failed

**Error Message:**
```
Migration `xxx` failed to apply cleanly to the shadow database
```

**Solution:**
1. **Reset migrations** (if safe):
   ```bash
   npx prisma migrate reset --force
   npx prisma migrate deploy
   ```

2. **Or deploy clean migration:**
   ```bash
   npx prisma migrate deploy
   ```

---

### ❌ Issue: Service Crashes After Deploy

**Common Causes:**
1. Missing environment variables
2. Port mismatch
3. Node version incompatibility

**Debugging Steps:**
1. Check logs in Render Dashboard
2. Verify all environment variables are set
3. Ensure PORT=3001 (or match your config)
4. Check Node version in package.json engines:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

---

### ❌ Issue: Build Takes Too Long or Times Out

**Solution:**
1. **Optimize build command:**
   ```bash
   npm ci --prefer-offline
   npx prisma generate
   npm run build
   ```

2. **Use build cache** (Render automatic)

3. **Reduce dependencies** if possible

---

### ❌ Issue: CORS Errors from Frontend

**Error Message:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. **Verify FRONTEND_URL** environment variable:
   ```env
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

2. **Check CORS config** in `src/app.ts`:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

---

## 🔍 Debugging Tools

### View Logs
```bash
# Render Dashboard → Service → Logs tab
# Or use Render CLI:
render logs -s your-service-name
```

### Access Shell
```bash
# Render Dashboard → Service → Shell tab
# Run commands directly in production environment
```

### Test Database Connection
```bash
# In Render Shell or local with production DATABASE_URL:
npx prisma db pull
npx prisma studio
```

### Check Environment Variables
```bash
# In Render Shell:
printenv | grep -E "DATABASE_URL|JWT_SECRET|NODE_ENV|PORT"
```

---

## 📚 Useful Resources

- [Render Deployment Docs](https://render.com/docs/deploy-node-express-app)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Prisma Binary Targets](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## ✅ Quick Health Checks

After deployment, verify:

1. **Service is running:**
   ```bash
   curl https://your-service.onrender.com/health
   ```

2. **Database connected:**
   ```bash
   curl https://your-service.onrender.com/api
   ```

3. **No errors in logs:**
   - Check Render Dashboard → Logs
   - Look for "Server is running" message

4. **Test an API endpoint:**
   ```bash
   curl https://your-service.onrender.com/api/branches
   ```

---

## 🆘 Still Having Issues?

1. Check [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for detailed deployment guide
2. Review logs carefully for specific error messages
3. Try deploying again (sometimes temporary issues)
4. Contact Render support or check their status page

---

**Last Updated:** January 21, 2026  
**Status:** All known issues resolved ✅
