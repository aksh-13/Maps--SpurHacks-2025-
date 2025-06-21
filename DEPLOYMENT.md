# Deploying TripPlanner 3D to Vercel

This guide will walk you through deploying your TripPlanner 3D app to Vercel, the recommended hosting platform for Next.js applications.

## Prerequisites

- A GitHub, GitLab, or Bitbucket account
- A Vercel account (free tier available)
- Your TripPlanner 3D project ready for deployment

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: TripPlanner 3D app"
   git push origin main
   ```

2. **Ensure your repository is public or you have Vercel Pro** (for private repos)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your repository**
   - Connect your GitHub/GitLab/Bitbucket account if not already connected
   - Select your TripPlanner 3D repository
4. **Configure project settings:**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `.next` (should auto-detect)
5. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm deployment settings
   - Wait for deployment to complete

## Step 3: Configure Environment Variables

After your first deployment, you need to add your API keys:

1. **Go to your project dashboard on Vercel**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables:**

   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Redeploy your application**
   - Go to Deployments tab
   - Click "Redeploy" on your latest deployment

## Step 4: Custom Domain (Optional)

1. **Go to Settings → Domains**
2. **Add your custom domain**
3. **Configure DNS settings** as instructed by Vercel
4. **Wait for DNS propagation** (can take up to 48 hours)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Yes | Mapbox access token for 3D maps |
| `OPENAI_API_KEY` | No | OpenAI API key for AI trip planning |
| `AIRBNB_API_KEY` | No | Airbnb API key (if available) |
| `HOTEL_API_KEY` | No | Hotel booking API key (if available) |

## Vercel-Specific Optimizations

### 1. Edge Functions
Your API routes are automatically deployed as serverless functions. The `vercel.json` configuration optimizes them for better performance.

### 2. Automatic Deployments
- Every push to your main branch triggers a new deployment
- Preview deployments are created for pull requests
- Automatic rollback on failed deployments

### 3. Performance Monitoring
- Vercel Analytics (optional)
- Real-time performance metrics
- Error tracking and monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Environment Variables Not Working**
   - Ensure variables are added to the correct environment (Production/Preview/Development)
   - Redeploy after adding new environment variables
   - Check variable names match exactly

3. **Map Not Loading**
   - Verify `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set correctly
   - Check Mapbox account has sufficient credits
   - Ensure domain is whitelisted in Mapbox settings

### Performance Tips

1. **Image Optimization**
   - Use Next.js Image component for automatic optimization
   - Configure image domains in `next.config.js`

2. **Bundle Size**
   - Monitor bundle size in Vercel dashboard
   - Use dynamic imports for heavy components
   - Optimize third-party dependencies

3. **Caching**
   - Vercel automatically caches static assets
   - Configure cache headers for API routes if needed

## Monitoring and Analytics

### Vercel Analytics (Optional)
1. **Enable Vercel Analytics** in your project settings
2. **Add analytics code** to your app (Vercel provides instructions)
3. **Monitor performance** and user behavior

### Error Tracking
- Vercel provides basic error tracking
- Consider integrating Sentry for advanced error monitoring

## Cost Optimization

### Free Tier Limits
- **Bandwidth**: 100GB/month
- **Function Execution**: 100GB-hours/month
- **Build Minutes**: 6000 minutes/month

### Pro Features
- **Custom Domains**: Unlimited
- **Team Collaboration**: Advanced features
- **Analytics**: Advanced metrics
- **Edge Functions**: Global deployment

## Security Best Practices

1. **Environment Variables**
   - Never commit API keys to your repository
   - Use Vercel's environment variable management
   - Rotate keys regularly

2. **API Security**
   - Implement rate limiting for your API routes
   - Validate all user inputs
   - Use HTTPS (automatic with Vercel)

3. **Dependencies**
   - Regularly update dependencies
   - Monitor for security vulnerabilities
   - Use `npm audit` locally

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

---

Your TripPlanner 3D app is now ready for production deployment on Vercel! 🚀 