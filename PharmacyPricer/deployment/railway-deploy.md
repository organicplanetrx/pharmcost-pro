# Railway Deployment Guide for PharmaCost Pro

## Railway.app (Simplest Option)

Railway is excellent for Node.js applications with built-in PostgreSQL support and full network access.

### Prerequisites
- Railway account (free tier available)
- GitHub repository

### Steps

1. **Connect Repository:**
   - Go to railway.app
   - Click "Deploy from GitHub"
   - Select your PharmaCost Pro repository

2. **Configure Build Settings:**
   Railway auto-detects Node.js projects, but verify:
   ```json
   {
     "build": "npm run build",
     "start": "npm run start"
   }
   ```

3. **Add PostgreSQL Database:**
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway automatically creates DATABASE_URL environment variable

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   ```

5. **Deploy:**
   - Push to GitHub main branch
   - Railway automatically builds and deploys
   - Get your live URL (e.g., `https://pharmcost-pro-production.up.railway.app`)

### Testing Network Access

After deployment:
```bash
# Test Kinray connectivity from Railway console
curl -I https://kinray.com
# Should return HTTP/2 200
```

### Cost
- **Free tier:** 500 hours/month, $0/month
- **Pro tier:** Unlimited, ~$10-20/month

### Advantages
- ✅ Full network access (Kinray scraping works)
- ✅ Automatic HTTPS
- ✅ Built-in PostgreSQL
- ✅ Git-based deployments
- ✅ Environment variable management
- ✅ Real-time logs and monitoring

## Vercel + PlanetScale Alternative

### Vercel (Frontend + API)
1. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Configure for Node.js API:**
   ```json
   // vercel.json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/index.js"
       }
     ]
   }
   ```

### PlanetScale (Database)
1. **Create PlanetScale database**
2. **Get connection string**
3. **Add to Vercel environment variables**

### Cost: $0-20/month

## Render.com Alternative

### Steps
1. **Connect GitHub repository**
2. **Configure service:**
   ```yaml
   # Build Command
   npm run build
   
   # Start Command
   npm run start
   
   # Environment
   NODE_ENV=production
   ```

3. **Add PostgreSQL database:**
   - Managed PostgreSQL addon
   - Automatic DATABASE_URL injection

### Cost: $7-25/month

## Quick Comparison

| Platform | Setup Time | Network Access | Cost/Month | Difficulty |
|----------|------------|----------------|------------|------------|
| Railway | 5 minutes | ✅ Full | $0-20 | Easiest |
| DigitalOcean | 30 minutes | ✅ Full | $8-25 | Medium |
| AWS | 1-2 hours | ✅ Full | $10-50 | Advanced |
| Render | 10 minutes | ✅ Full | $7-25 | Easy |

## Recommended: Railway Deployment

Railway is the fastest way to get your Kinray scraping working:

1. **Push your code to GitHub**
2. **Connect repository to Railway**
3. **Add PostgreSQL service**
4. **Deploy automatically**
5. **Test Kinray connection - it will work!**

Your application is production-ready. The only missing piece is a hosting platform with unrestricted network access, which any of these platforms provide.