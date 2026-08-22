# Deployment Guide for KahaniBox Platform

## Build for Production

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Build the Project
```bash
pnpm run build
```

This will create a `dist` folder with all production-ready files.

## Deployment Configuration

### Redirects Configuration
The `public/_redirects` file is already configured for SPA routing:
```
/*    /index.html   200
```

This ensures all routes (/, /classes, /styles, /about, /contact, /account, etc.) work correctly in production.

## Deployment Options

### Option 1: Netlify
1. Connect your repository to Netlify
2. Build settings:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
3. The `_redirects` file will be automatically copied to dist

### Option 2: Vercel
1. Connect your repository to Vercel
2. Build settings:
   - Build command: `pnpm run build`
   - Output directory: `dist`
3. Create `vercel.json` in root (if needed):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Option 3: Manual Deployment
1. Build the project: `pnpm run build`
2. Upload the entire `dist` folder to your hosting provider
3. Configure server to redirect all routes to index.html

## Routes Available
- `/` - Home page
- `/classes` - Classes page
- `/styles` - Styles page (Cuisines)
- `/about` - About Us page
- `/contact` - Contact Us page
- `/account` - My Account page
- `/terms` - Terms of Service
- `/refund` - Refund Policy
- `/privacy` - Privacy Policy

## Environment Variables (if needed)
Create a `.env` file in the root directory:
```
VITE_API_URL=your_api_url_here
```

## Testing Production Build Locally
```bash
pnpm run build
pnpm run preview
```

This will serve the production build locally at http://localhost:4173

## Post-Deployment Checklist
- [ ] All routes work correctly
- [ ] Images and assets load properly
- [ ] Video thumbnails display correctly
- [ ] Subscription flow works
- [ ] Plan selection works
- [ ] Mobile menu functions properly
- [ ] All pages are accessible

## Important Files
- `vite.config.ts` - Build configuration
- `public/_redirects` - SPA routing for Netlify/similar hosts
- `dist/` - Production build output (generated after build)

## Support
For deployment issues, check:
1. Build logs for errors
2. Browser console for runtime errors
3. Network tab for failed asset requests
