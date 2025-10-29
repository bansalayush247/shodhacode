# Deployment Guide - Render

## Important Note About Docker-Based Code Execution

**⚠️ Limitation on Render Free Tier:**
Render's free tier does not support Docker-in-Docker (running Docker containers from within a container). This means the Docker-based code execution feature will NOT work on Render's free tier.

### Solutions:

1. **For Demo/Testing:** Deploy without code execution feature
2. **For Production:** Use Render's paid plans or alternative platforms that support Docker-in-Docker
3. **Alternative:** Use a code execution API service (Judge0, Sphere Engine, etc.)

---

## Option 1: Deploy on Render (Without Code Execution)

### Step 1: Prepare Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `bansalayush247/shodhacode`
3. Configure:
   - **Name:** `shodhacode-backend`
   - **Root Directory:** Leave blank
   - **Environment:** `Docker`
   - **Dockerfile Path:** `Dockerfile.backend`
   - **Plan:** Free
4. Add Environment Variable:
   - **Key:** `SPRING_PROFILES_ACTIVE`
   - **Value:** `production`
5. Click **"Create Web Service"**

### Step 4: Deploy Frontend

1. Click **"New +"** → **"Web Service"**
2. Select same repository
3. Configure:
   - **Name:** `shodhacode-frontend`
   - **Root Directory:** `frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add Environment Variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://shodhacode-backend.onrender.com` (your backend URL)
5. Click **"Create Web Service"**

### Step 5: Update CORS in Backend

After deployment, update `application.properties` to allow frontend domain:
```properties
# Add your Render frontend URL
cors.allowed.origins=https://shodhacode-frontend.onrender.com
```

---

## Option 2: Deploy with Full Docker Support (Recommended)

### Platforms that Support Docker-in-Docker:

1. **Railway.app**
   - Supports Docker-in-Docker
   - Easy GitHub integration
   - Free tier available

2. **AWS ECS/EKS**
   - Full Docker support
   - Scalable
   - More complex setup

3. **Google Cloud Run**
   - Supports privileged containers
   - Serverless scaling
   - Pay-per-use

4. **DigitalOcean App Platform**
   - Docker support
   - Simple deployment
   - Affordable pricing

---

## Option 3: Use External Code Execution Service

Replace the Docker-based execution with an API service:

### Popular Services:

1. **Judge0** (https://judge0.com)
   - Free tier: 50 submissions/day
   - Supports multiple languages
   - Easy API integration

2. **Sphere Engine** (https://sphere-engine.com)
   - Powerful code execution
   - Commercial solution

### Implementation:

Replace `CodeExecutionService.java` to call external API instead of Docker.

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Backend service deployed
- [ ] Frontend service deployed
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Test all API endpoints
- [ ] Test frontend UI
- [ ] (Optional) Code execution tested

---

## Environment Variables Reference

### Backend:
```
SPRING_PROFILES_ACTIVE=production
PORT=8080
```

### Frontend:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
PORT=3000
```

---

## Troubleshooting

### Backend won't start:
- Check logs in Render dashboard
- Verify Dockerfile.backend builds locally
- Ensure port 8080 is exposed

### Frontend can't reach backend:
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Test backend URL directly

### Code execution fails:
- Expected on Render free tier
- Consider alternatives mentioned above
- Check if Docker is available in container

---

## Cost Estimates

### Render (Basic Setup):
- Backend: Free (spins down after inactivity)
- Frontend: Free (spins down after inactivity)
- **Total: $0/month** (with limitations)

### Render (Production):
- Backend: $7/month (always on)
- Frontend: $7/month (always on)
- **Total: $14/month**

### Railway (Full Docker Support):
- Backend + Code Execution: ~$5-10/month
- Frontend: Free tier available
- **Total: ~$5-10/month**

---

## Recommended Approach

**For Assignment Submission:**
Deploy on Render without code execution, document the limitation.

**For Production:**
Use Railway or AWS ECS with full Docker support.

**For Long-term:**
Consider using Judge0 API to avoid infrastructure complexity.
