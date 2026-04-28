# Deployment Guide

This document covers deployment procedures, configuration, and production considerations for the Well Management application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Vercel Deployment](#vercel-deployment)
  - [GitHub Integration (Recommended)](#github-integration-recommended)
  - [Vercel CLI](#vercel-cli)
- [SPA Configuration](#spa-configuration)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Manual / Self-Hosted Deployment](#manual--self-hosted-deployment)
- [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure the following are in place:

- **Node.js** v18 or higher
- **npm** v9 or higher
- A [Vercel](https://vercel.com/) account (for Vercel deployment)
- Repository hosted on **GitHub**, **GitLab**, or **Bitbucket** (for CI/CD integration)

## Build Process

The application uses Vite to produce an optimized production build.

### Build Command

```bash
npm run build
```

This runs `vite build` under the hood and outputs static assets to the `dist/` directory.

### Output Directory

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

All files in `dist/` are static and can be served by any static file server or CDN.

### Preview Build Locally

To verify the production build before deploying:

```bash
npm run preview
```

This starts a local server serving the `dist/` directory on the default Vite preview port.

### Pre-Deployment Checks

Run the following before every deployment:

```bash
# Lint the codebase
npm run lint

# Run the full test suite
npm test

# Create the production build
npm run build
```

All three commands must pass without errors before proceeding to deployment.

---

## Vercel Deployment

Vercel is the recommended deployment platform. It auto-detects Vite projects and applies the correct build settings.

### GitHub Integration (Recommended)

This is the simplest and most reliable deployment method. Vercel automatically builds and deploys on every push.

1. **Push your repository** to GitHub (or GitLab / Bitbucket).

2. **Import the project in Vercel:**
   - Log in to [vercel.com](https://vercel.com/).
   - Click **Add New → Project**.
   - Select your Git provider and authorize access.
   - Choose the `well-management` repository.

3. **Configure build settings** (Vercel auto-detects these, but verify):

   | Setting            | Value            |
   |--------------------|------------------|
   | Framework Preset   | Vite             |
   | Build Command      | `npm run build`  |
   | Output Directory   | `dist`           |
   | Install Command    | `npm install`    |
   | Node.js Version    | 18.x             |

4. **Set environment variables** (see [Environment Variables](#environment-variables) below).

5. **Click Deploy.**

Once connected, Vercel will:

- **Automatically deploy** the `main` (or `master`) branch to production on every push.
- **Create preview deployments** for every pull request, giving each PR a unique URL for review.
- **Roll back** to any previous deployment instantly from the Vercel dashboard.

### Vercel CLI

For manual or scripted deployments without Git integration:

```bash
# Install the Vercel CLI globally
npm install -g vercel

# Log in to your Vercel account
vercel login

# Deploy to a preview environment
vercel

# Deploy directly to production
vercel --prod
```

The CLI reads the `vercel.json` configuration file from the project root automatically.

---

## SPA Configuration

The application uses client-side routing via React Router. All routes must resolve to `index.html` so the React Router can handle them in the browser.

### vercel.json

The project includes a `vercel.json` file at the repository root with the following configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**What this does:**

- Any request that does not match a static file in `dist/` is rewritten to `/index.html`.
- This ensures that deep links (e.g., `/wells/well-001/edit`, `/wells/new`) work correctly when accessed directly or refreshed in the browser.
- Without this rewrite, navigating directly to any route other than `/` would return a 404 from the server.

**Routes handled by the SPA:**

| Route Pattern          | Component        | Description                     |
|------------------------|------------------|---------------------------------|
| `/`                    | WellListPage     | Main well list view             |
| `/wells/new`           | CreateWellPage   | Create new well form            |
| `/wells/create`        | CreateWellPage   | Alternate create route          |
| `/wells/:id`           | WellDetailPage   | Well detail view (placeholder)  |
| `/wells/:id/details`   | WellDetailPage   | Alternate detail route          |
| `/wells/:id/edit`      | EditWellPage     | Edit well form                  |
| `*`                    | NotFoundPage     | 404 catch-all                   |

---

## Environment Variables

Environment variables are managed through Vite's built-in `import.meta.env` mechanism. Only variables prefixed with `VITE_` are exposed to the client-side bundle.

### Available Variables

| Variable         | Description                                          | Default            | Required |
|------------------|------------------------------------------------------|--------------------|----------|
| `VITE_APP_TITLE` | Application title displayed in the header and browser tab | `Well Management` | No       |

### Setting Variables Locally

Copy the example file and update values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_APP_TITLE=Well Management
```

Files in the `.env.local` pattern are git-ignored and will not be committed to the repository.

### Setting Variables on Vercel

1. Navigate to your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings → Environment Variables**.
3. Add each variable with the appropriate value.
4. Select the environments where the variable should be available:
   - **Production** — the live deployment from the main branch.
   - **Preview** — deployments created from pull requests.
   - **Development** — used with `vercel dev` locally.
5. Click **Save**.

Vercel will automatically inject these variables during the build process. A redeployment is required for changes to take effect.

### Security Notes

- **Never store secrets** (API keys, database credentials, auth tokens) in `VITE_`-prefixed variables. These are embedded in the client-side JavaScript bundle and are visible to anyone inspecting the page source.
- The application currently uses `localStorage` for data persistence and does not require any server-side secrets.

---

## CI/CD Pipeline

### Automatic Deployments via Vercel + GitHub

When the Vercel GitHub integration is enabled, the following CI/CD workflow is automatic:

1. **Push to `main` branch** → Triggers a **production deployment**.
2. **Open a pull request** → Triggers a **preview deployment** with a unique URL.
3. **Merge the pull request** → Triggers a new **production deployment** from the updated `main` branch.
4. **Revert / rollback** → Available instantly from the Vercel dashboard by promoting a previous deployment.

### Recommended Branch Strategy

| Branch    | Vercel Environment | Purpose                              |
|-----------|--------------------|--------------------------------------|
| `main`    | Production         | Stable, released code                |
| `develop` | Preview            | Integration branch for feature work  |
| Feature   | Preview            | Individual feature branches via PRs  |

### Adding Pre-Deployment Checks

To ensure code quality before deployment, add a GitHub Actions workflow or use Vercel's build step:

**Option A: Vercel Build Command Override**

In the Vercel project settings, set the build command to:

```bash
npm run lint && npm test && npm run build
```

This ensures linting and tests pass before the build is created. If any step fails, the deployment is blocked.

**Option B: GitHub Actions Workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

This runs on every push and pull request, providing status checks that can be required before merging.

---

## Manual / Self-Hosted Deployment

If you are not using Vercel, the application can be deployed to any static hosting provider.

### Build and Serve

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Serve the dist directory
npx serve dist
```

### Server Configuration

Ensure your server rewrites all non-file requests to `index.html` for client-side routing support.

**Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache (.htaccess):**

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Other Static Hosting Providers

| Provider         | Build Command     | Output Directory | SPA Rewrite Support       |
|------------------|-------------------|------------------|---------------------------|
| Vercel           | `npm run build`   | `dist`           | `vercel.json` rewrites    |
| Netlify          | `npm run build`   | `dist`           | `_redirects` file         |
| GitHub Pages     | `npm run build`   | `dist`           | 404.html workaround       |
| AWS S3 + CloudFront | `npm run build` | `dist`          | CloudFront error pages    |
| Firebase Hosting | `npm run build`   | `dist`           | `firebase.json` rewrites  |

For **Netlify**, create a `public/_redirects` file:

```
/*    /index.html   200
```

---

## Production Considerations

### Performance

- **Vite Code Splitting** — Vite automatically splits the bundle by route, so only the code needed for the current page is loaded.
- **Asset Hashing** — All built assets include content hashes in their filenames (e.g., `index-abc123.js`), enabling aggressive browser caching with long `Cache-Control` headers.
- **Tree Shaking** — Unused code is eliminated during the production build.
- **Minification** — JavaScript and CSS are minified automatically by Vite's production build.

### Caching Strategy

Static assets in `dist/assets/` are content-hashed and can be cached indefinitely:

```
Cache-Control: public, max-age=31536000, immutable
```

The `index.html` file should have a short cache duration or no-cache to ensure users always get the latest version:

```
Cache-Control: no-cache
```

Vercel handles this automatically with its default caching behavior.

### Data Persistence

- The application uses **localStorage** for all data persistence. Data is stored under the key `wellManagement.wells`.
- On first load, the application hydrates from **seed data** (30 pre-populated well records) if localStorage is empty.
- localStorage is scoped to the origin (protocol + domain + port). Different deployment URLs will have independent data stores.
- localStorage has a typical limit of **5–10 MB** per origin. The application enforces a maximum of **200 well records** to stay well within this limit.

### Browser Support

The application targets modern evergreen browsers:

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

Vite's default build target is `es2015` (ES6), which is supported by all modern browsers.

### Security

- **No server-side component** — The application is entirely client-side. There are no API endpoints, authentication flows, or server-side secrets to protect.
- **Content Security Policy** — Consider adding CSP headers via Vercel's `headers` configuration in `vercel.json` for additional protection against XSS.
- **HTTPS** — Vercel provides HTTPS by default for all deployments. If self-hosting, ensure HTTPS is configured.

### Monitoring

- Vercel provides built-in **deployment logs**, **build logs**, and **analytics** (on Pro plans).
- For error tracking in production, consider integrating a client-side error monitoring service (e.g., Sentry) in a future release.

---

## Troubleshooting

### Common Issues

**Build fails with "out of memory":**

Increase the Node.js memory limit:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Routes return 404 in production:**

Ensure the SPA rewrite is configured correctly. On Vercel, verify that `vercel.json` is present at the repository root with the rewrite rule. On other platforms, configure the equivalent rewrite (see [Manual / Self-Hosted Deployment](#manual--self-hosted-deployment)).

**Environment variables are undefined:**

- Verify the variable is prefixed with `VITE_`.
- Verify the variable is set in the Vercel dashboard for the correct environment (Production / Preview / Development).
- Redeploy after adding or changing environment variables.
- Locally, ensure the variable is in `.env.local` (not `.env.example`).

**localStorage data is lost after deployment:**

- localStorage is scoped to the origin. If the deployment URL changes (e.g., from a preview URL to the production URL), data will not carry over.
- Clearing browser data or using incognito mode will also clear localStorage.
- The application will automatically re-hydrate from seed data if localStorage is empty.

**Stale content after deployment:**

- Hard refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bypass the cache.
- Vercel automatically invalidates the CDN cache on each deployment, but browser caches may retain the old `index.html` briefly.

### Vercel Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel Guide](https://vercel.com/docs/frameworks/vite)
- [Environment Variables on Vercel](https://vercel.com/docs/environment-variables)
- [SPA Rewrites on Vercel](https://vercel.com/docs/projects/project-configuration#rewrites)