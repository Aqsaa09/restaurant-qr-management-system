# 🚀 Vercel Deployment Guide

## Quick Deploy Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push
```

### 2. Deploy to Vercel

**Option A: One-Click Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dibyojyoti05/restaurantqr)

**Option B: Manual Deploy**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Use these settings:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x or 20.x
```

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_BASE_URL = https://your-backend-url.com/api
VITE_SOCKET_URL = https://your-backend-url.com
NODE_ENV = production
VITE_APP_NAME = Restaurant QR System
VITE_RESTAURANT_NAME = Delicious Bites
VITE_RESTAURANT_PHONE = +91-9876543210
VITE_RESTAURANT_EMAIL = info@deliciousbites.com
VITE_UPI_ID = restaurant@upi
VITE_MERCHANT_NAME = Delicious Bites Restaurant
```

### 4. Deploy
- Click "Deploy"
- Wait for build completion
- Your app will be live!

## 🔧 Troubleshooting

If build fails:
1. Check build logs in Vercel dashboard
2. Ensure Root Directory is set to `frontend`
3. Verify all environment variables are set
4. Make sure Node.js version is 18.x or 20.x

## 📱 Post-Deployment

1. **Test your app** at the Vercel URL
2. **Update backend CORS** to allow your Vercel domain
3. **Update environment variables** with actual backend URL
4. **Set up custom domain** (optional)

## 🎯 Expected Result

Your restaurant QR system will be live at:
`https://your-project-name.vercel.app`