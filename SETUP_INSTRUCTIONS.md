# Sophia Library API Documentation - Setup Instructions

This guide will help you set up and deploy the Docusaurus documentation site.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git repository set up on GitHub

## Step 1: Install Dependencies

```bash
cd /Users/enrique/Documents/sandpalace/apps/sophia/docs-site
npm install
```

This will install:
- Docusaurus core
- React
- MDX support
- Prism for syntax highlighting

## Step 2: Configure for Your GitHub Account

Edit `docusaurus.config.js` and replace placeholders:

1. **Line 16**: Replace `YOUR_GITHUB_USERNAME` with your GitHub username
2. **Line 22**: Replace `YOUR_GITHUB_USERNAME` with your GitHub username
3. **Line 49**: Replace `YOUR_GITHUB_USERNAME` with your GitHub username
4. **Line 103**: Replace `YOUR_GITHUB_USERNAME` with your GitHub username

Example:
```javascript
url: 'https://enriquegomeztagle.github.io',
organizationName: 'enriquegomeztagle',
projectName: 'sophia',
```

## Step 3: Copy Documentation Files

The setup script has already created symlinks or copied files. Verify they exist:

```bash
ls -la docs/
```

You should see:
- `intro.md`
- `quick-start.md`
- `api-reference.md`
- `langgraph-integration.md`
- `python-client.md`
- `search/` directory with search method docs
- `sprints/` directory with sprint docs

## Step 4: Run Local Development Server

```bash
npm start
```

This will:
- Start development server on `http://localhost:3000`
- Open your browser automatically
- Enable hot reloading for changes

## Step 5: Build for Production

```bash
npm run build
```

This creates optimized static files in `build/` directory.

## Step 6: Test Production Build

```bash
npm run serve
```

View the production build at `http://localhost:3000`.

## Step 7: Deploy to GitHub Pages

### Option A: Automatic Deployment

```bash
# Set your GitHub username as environment variable
export GIT_USER=YOUR_GITHUB_USERNAME

# Deploy
npm run deploy
```

This will:
1. Build the site
2. Create/update `gh-pages` branch
3. Push to GitHub
4. Site will be live at: `https://YOUR_GITHUB_USERNAME.github.io/sophia/`

### Option B: Manual Deployment

```bash
# Build the site
npm run build

# Deploy using gh-pages package
npx gh-pages -d build -u "Your Name <your.email@example.com>"
```

## Step 8: Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

Your site will be live in 1-2 minutes at:
```
https://YOUR_GITHUB_USERNAME.github.io/sophia/
```

## Step 9: Custom Domain (Optional)

### Purchase Domain
- Recommend: Cloudflare, Namecheap, Google Domains
- Suggested: `sophia-library.org` or `docs.sophia-library.org`

### Configure DNS

Add CNAME record:
```
Type: CNAME
Name: docs (or @)
Value: YOUR_GITHUB_USERNAME.github.io
```

### Update GitHub Pages

1. Go to Settings → Pages
2. Add custom domain: `docs.sophia-library.org`
3. Check "Enforce HTTPS"

### Update Docusaurus Config

In `docusaurus.config.js`:
```javascript
url: 'https://docs.sophia-library.org',
baseUrl: '/',
```

Rebuild and redeploy.

## Maintenance

### Update Documentation

1. Edit markdown files in `docs/`
2. Test locally: `npm start`
3. Commit changes to git
4. Redeploy: `npm run deploy`

### Add New Pages

1. Create new `.md` file in `docs/`
2. Add to `sidebars.js`
3. Commit and deploy

## Troubleshooting

### Build Fails

```bash
# Clear cache
npm run clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Deployment Fails

```bash
# Ensure GIT_USER is set
export GIT_USER=YOUR_GITHUB_USERNAME

# Try manual deployment
npm run build
npx gh-pages -d build
```

### Links Not Working

- Check `baseUrl` in `docusaurus.config.js`
- For GitHub Pages: `/sophia/`
- For custom domain: `/`

## Analytics (Optional)

### Google Analytics

1. Get tracking ID from Google Analytics
2. Add to `docusaurus.config.js`:

```javascript
themeConfig: {
  gtag: {
    trackingID: 'G-XXXXXXXXXX',
    anonymizeIP: true,
  },
}
```

### Plausible (Privacy-Friendly)

```javascript
scripts: [
  {
    src: 'https://plausible.io/js/script.js',
    'data-domain': 'docs.sophia-library.org',
    defer: true,
  },
],
```

## Resources

- **Docusaurus Docs**: https://docusaurus.io/docs
- **GitHub Pages**: https://pages.github.com
- **Deployment Guide**: https://docusaurus.io/docs/deployment

## Support

If you encounter issues:
1. Check Docusaurus documentation
2. Review GitHub Pages settings
3. Verify DNS configuration (for custom domains)

---

**Ready to deploy!** Follow the steps above to get your documentation site live.
