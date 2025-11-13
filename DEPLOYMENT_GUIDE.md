# Sophia Library API Documentation - Deployment Guide

This guide provides step-by-step instructions for deploying the Sophia Library API documentation to GitHub Pages.

## Build Status

✅ **Build Successful** - The documentation site has been successfully built and is ready for deployment!

Build output: `[SUCCESS] Generated static files in "build".`

## Quick Deployment

The fastest way to deploy is to use the automated npm script:

```bash
cd /Users/enrique/Documents/sandpalace/apps/sophia/docs-site

# Replace YOUR_GITHUB_USERNAME with your actual GitHub username
export GIT_USER=YOUR_GITHUB_USERNAME
npm run deploy
```

## Detailed Deployment Steps

### 1. Update GitHub Configuration

Before deploying, you need to update the GitHub configuration in [docusaurus.config.js](docusaurus.config.js:16-24):

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username in these locations:

```javascript
url: 'https://YOUR_GITHUB_USERNAME.github.io',  // Line 16
organizationName: 'YOUR_GITHUB_USERNAME',        // Line 23
```

And in the navbar items (lines 88-89):

```javascript
href: 'https://github.com/YOUR_GITHUB_USERNAME/sophia',
```

### 2. Initialize Git (if needed)

If this directory is not already in a git repository, initialize it:

```bash
cd docs-site
git init
git add .
git commit -m "Initial commit of Sophia Library API documentation"
```

### 3. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `sophia` (or match your `projectName` in config)
3. Keep it public
4. **Do not** initialize with README
5. Click "Create repository"

### 4. Add Remote

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/sophia.git
git branch -M main
git push -u origin main
```

### 5. Deploy to GitHub Pages

```bash
GIT_USER=YOUR_GITHUB_USERNAME npm run deploy
```

This will:
- Build the documentation site
- Create/update the `gh-pages` branch
- Push the built files to GitHub
- Make your docs available at `https://YOUR_GITHUB_USERNAME.github.io/sophia/`

### 6. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select branch: `gh-pages`
4. Click **Save**
5. Your site will be published at `https://YOUR_GITHUB_USERNAME.github.io/sophia/`

## Testing Locally Before Deploy

To preview your documentation site locally:

```bash
cd docs-site

# Development server with hot reload
npm start

# Or build and serve the production version
npm run build
npm run serve
```

The site will be available at `http://localhost:3000/sophia/`

## Custom Domain Setup (Optional)

To use a custom domain like `docs.sophia-library.org`:

### 1. Add Domain to GitHub Pages

1. In your repo, go to **Settings** → **Pages**
2. Under "Custom domain", enter: `docs.sophia-library.org`
3. Click **Save**
4. Check "Enforce HTTPS" (after DNS propagates)

### 2. Update DNS Records

At your domain registrar (Namecheap, Cloudflare, etc.):

```
Type: CNAME
Name: docs
Value: YOUR_GITHUB_USERNAME.github.io
TTL: 3600 (or default)
```

### 3. Update Docusaurus Config

In [docusaurus.config.js](docusaurus.config.js):

```javascript
url: 'https://docs.sophia-library.org',
baseUrl: '/',  // Change from '/sophia/' to '/'
```

### 4. Add CNAME File

Create a file named `CNAME` in `static/` directory:

```bash
echo "docs.sophia-library.org" > static/CNAME
```

### 5. Rebuild and Deploy

```bash
npm run build
GIT_USER=YOUR_GITHUB_USERNAME npm run deploy
```

Wait 5-10 minutes for DNS to propagate. Your docs will be available at `https://docs.sophia-library.org`

## Continuous Deployment

### Option A: Manual Updates

After making changes to documentation:

```bash
cd docs-site
npm run deploy
```

### Option B: GitHub Actions (Automated)

Create `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'docs-site/**'
      - 'docs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: docs-site/package-lock.json

      - name: Install dependencies
        working-directory: docs-site
        run: npm ci

      - name: Build website
        working-directory: docs-site
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-site/build
          cname: docs.sophia-library.org  # Optional: if using custom domain
```

This will automatically deploy whenever you push changes to the `main` branch.

## Maintenance

### Updating Documentation

1. Edit markdown files in `docs/` directory
2. Test locally: `npm start`
3. Deploy: `npm run deploy`

### Adding New Pages

1. Create markdown file in `docs/` directory
2. Add entry to [sidebars.js](sidebars.js) if needed
3. Deploy changes

### Updating Dependencies

```bash
cd docs-site
npm update
npm audit fix
npm run build  # Test build
npm run deploy # Deploy if successful
```

## Troubleshooting

### Build Errors

If build fails:
```bash
# Clear cache and rebuild
rm -rf node_modules .docusaurus build
npm install
npm run build
```

### Deploy Fails with Authentication Error

Make sure you have:
1. SSH keys set up with GitHub, or
2. Using `GIT_USER` environment variable with HTTPS

### Links Not Working

- Check that internal links use `/docs/page-name` format
- External links should use full URLs
- Markdown links to other docs should use relative paths

### Site Not Updating

1. Check GitHub Pages settings
2. Clear browser cache
3. Wait a few minutes for GitHub to rebuild
4. Check the `gh-pages` branch has the latest changes

## Current Configuration

- **URL**: `https://YOUR_GITHUB_USERNAME.github.io/sophia/`
- **Base URL**: `/sophia/`
- **Organization**: `YOUR_GITHUB_USERNAME`
- **Project**: `sophia`
- **Deployment Branch**: `gh-pages`

## Documentation Structure

```
docs-site/
├── docs/                          # Markdown documentation
│   ├── intro.md                   # Introduction page
│   ├── quick-start.md             # Quick start guide
│   ├── api-reference.md           # Complete API reference
│   ├── langgraph-integration.md   # LangGraph integration guide
│   ├── python-client.md           # Python client docs
│   ├── search/                    # Search method documentation
│   │   ├── semantic-search.md
│   │   ├── keyword-search.md
│   │   └── hybrid-search.md
│   └── sprints/                   # Sprint documentation
│       ├── sprint-8-qdrant-semantic-search.md
│       ├── sprint-9-opensearch-keyword-search.md
│       ├── sprint-10-hybrid-search-retriever.md
│       └── sprint-11-search-result-formatting.md
├── src/
│   ├── css/
│   │   └── custom.css             # Custom styling
│   └── pages/
│       ├── index.js               # Homepage
│       └── index.module.css       # Homepage styles
├── static/
│   └── img/
│       ├── logo.svg               # Logo
│       └── favicon.ico            # Favicon
├── docusaurus.config.js           # Main configuration
├── sidebars.js                    # Sidebar navigation
└── package.json                   # Dependencies
```

## Features Included

✅ Professional homepage with feature highlights
✅ Complete API reference documentation
✅ Quick start guide
✅ LangGraph integration guide
✅ Search method documentation (semantic, keyword, hybrid)
✅ Sprint implementation documentation
✅ Custom branding and styling
✅ Mobile-responsive design
✅ Syntax highlighting for code examples
✅ Navigation sidebar
✅ Search functionality (browser-based)

## Next Steps

1. **Update GitHub username** in configuration files
2. **Create GitHub repository** (if not already created)
3. **Deploy** using `npm run deploy`
4. **Enable GitHub Pages** in repository settings
5. **Optional**: Set up custom domain
6. **Optional**: Configure GitHub Actions for automatic deployment

## Support

For issues or questions:
- Check [Docusaurus documentation](https://docusaurus.io)
- Check [GitHub Pages documentation](https://pages.github.com)
- Review build warnings/errors in console

---

**Ready to deploy!** Follow the steps above to make your API documentation available to users.
