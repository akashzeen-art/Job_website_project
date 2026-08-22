# TheCookStudio - Deployment Instructions

## Production Build Created Successfully ✅

Your production-ready files are in: `dist/spa/`

## Files to Deploy:
```
dist/spa/
├── index.html
├── assets/
│   ├── index-B-niYzba.css
│   └── index-DcSjK8Ka.js
└── (all other static assets)
```

## Backend Hosting Setup:

### Option 1: Static File Server (Recommended)
Your backend should serve the `dist/spa` folder as static files with SPA routing support.

**Important:** All routes must redirect to `index.html` for client-side routing to work.

### Option 2: Express.js Example
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist/spa
app.use(express.static(path.join(__dirname, 'dist/spa')));

// SPA fallback - redirect all routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/spa/index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Option 3: Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist/spa;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option 4: Apache .htaccess
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Deployment Checklist:
- ✅ Build completed: `dist/spa/` folder ready
- ✅ SPA routing configured: `_redirects` file included
- ✅ All assets bundled and optimized
- ✅ Logo and images included in build
- ✅ Video URLs are external (CDN hosted)

## Next Steps:
1. Copy the entire `dist/spa/` folder to your backend server
2. Configure your server to serve static files from this folder
3. Ensure all routes redirect to `index.html` (SPA routing)
4. Test routes: `/`, `/recipes`, `/cuisines`

## Environment:
- Base URL: `/` (root)
- Build output: `dist/spa/`
- Routing: Client-side (React Router)

## Support:
If you encounter routing issues, ensure your server redirects all non-file requests to `/index.html`.
