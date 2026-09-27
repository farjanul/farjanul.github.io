# Farjanul Notebook — GitBook-Style Modern Documentation CMS

> A high-performance, modern **GitBook-inspired knowledge base and Content Management System (CMS)** built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and cloud-hosted **Neon PostgreSQL**.

---

## 📑 Table of Contents
1. [Product Overview](#-product-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Deployment to GitHub Pages (github.io) via GitHub Actions](#-deployment-to-github-pages-githubio-via-github-actions)
   - [1. Deployment Architecture](#1-deployment-architecture)
   - [2. Setting Up GitHub Repository Secrets](#2-setting-up-github-repository-secrets)
   - [3. Next.js Configuration (next.config.ts)](#3-nextjs-configuration-nextconfigts)
   - [4. GitHub Actions Workflow (.github/workflows/deploy.yml)](#4-github-actions-workflow-file)
   - [5. Enabling GitHub Pages](#5-enabling-github-pages)
   - [6. Important Considerations for GitHub Pages](#6-important-considerations-for-github-pages)
5. [Alternative: 1-Click Deployment to Vercel (Full-Stack Recommended)](#-alternative-1-click-deployment-to-vercel-full-stack-recommended)
6. [Local Development Guide](#-local-development-guide)
7. [Directory Structure](#-directory-structure)

---

## 🎯 Product Overview

**Farjanul Notebook** is an enterprise-grade documentation and technical note-taking platform. It provides developers, architects, and engineering teams with a polished reading experience for system design, coding patterns, algorithms, and technical architecture guides.

The application consists of two integrated components:
- **Public Documentation Frontend:** A lightning-fast, SEO-optimized, bilingual documentation portal featuring full single-page application (SPA) client-side navigation, syntax highlighting, and an automated table of contents.
- **Admin CMS Dashboard (`/admin` and `/add-content`):** A web-based content administration interface allowing editors to create, update, reorder, and duplicate content groups, topics, and rich-text articles with live preview.

---

## ✨ Key Features

- ⚡ **GitBook-Inspired Interface:** Pixel-perfect layout with a collapsible sidebar, mobile drawer sheet, search bar, and breadcrumb navigation.
- 🔗 **SEO-Friendly Slug Routing (`/[slug]`):** Clean URLs for every article (e.g. `/overview-of-system-design`, `/hld-and-lld`). Supports browser history (`pushState` and `popstate`) for smooth, instantaneous client navigation without full-page reloads.
- 🌐 **Bilingual Support (English & Bengali):** Seamless, one-click language toggle across the entire application, allowing articles to maintain both English and Bengali content.
- 📋 **Smart Rich-Content Copy:** Dedicated header button that writes both rich formatted HTML (for Notion, Google Docs, Word) and plain text to the system clipboard simultaneously.
- 💻 **Syntax Highlighting with One-Click Copy:** Atom One Dark theme syntax highlighting with macOS-style window controls and dedicated copy buttons on every code snippet.
- 📊 **Responsive Table Card View:** Enhanced table wrappers with independent horizontal scrolling and cohesive light/dark mode styling (`#F9FAFB` in light mode, `#16181d` in dark mode).
- 🧭 **Dynamic "On This Page" Table of Contents:** Automatic heading parser generating smooth-scroll jump links for all `<h2>` headings within the active article.
- 🔍 **Keyboard Shortcut Search:** Instant modal search triggered via `Ctrl + K` or `Cmd + K`.
- 🛠️ **TipTap Rich Text Editor:** Embedded WYSIWYG editor supporting headings, lists, quotes, tables, code blocks, and custom FontAwesome icon pickers.
- ☁️ **Cloud-Native Serverless Postgres (Neon):** Managed serverless database connection pooling via `@prisma/client` singletons.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server Components, Server Actions, Dynamic Routes |
| **Language** | TypeScript | Full static type-safety across frontend and backend |
| **Styling** | Tailwind CSS + Custom CSS Tokens | Design system tokens, light/dark themes |
| **ORM** | Prisma ORM | Type-safe queries and automated schema migrations |
| **Rich Text** | TipTap Editor | Embedded rich-text editing in the admin panel |
| **Syntax** | Highlight.js | Automatic code syntax highlighting |
| **Icons** | FontAwesome 6 | System and content categorization icons |

---

## 🚀 Deployment to GitHub Pages (github.io) via GitHub Actions

GitHub Pages is a static hosting platform. Using Next.js's **Static Export (`output: 'export'`)** and **`generateStaticParams()`**, GitHub Actions connects to your Neon database at build time, pre-renders all dynamic slug pages into static HTML, and publishes the site directly to `github.io`.

### 1. Deployment Architecture
```
[Git Push to main] ──► [GitHub Actions Runner]
                             │
                             ├─► Connects to Neon PostgreSQL via DATABASE_URL
                             ├─► Runs `npx prisma generate`
                             ├─► Runs `npm run build` (Static Export to `out/`)
                             │
                             ▼
                    [GitHub Pages (github.io)]
```

---

### 2. Setting Up GitHub Repository Secrets

GitHub Actions requires your Neon connection string during the build step:

1. Open your repository on GitHub.
2. Navigate to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Click **New repository secret** and add the following two secrets:
   - **`DATABASE_URL`**: SQLite Pooled connection string:
     ```
     DATABASE_URL="file:./dev.db"
     ```

---

### 3. Next.js Configuration (`next.config.ts`)

The project is already configured to automatically enable static export when running inside GitHub Actions:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
let repo = "";
if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  const parts = process.env.GITHUB_REPOSITORY.split("/");
  const repoName = parts[1] || "";
  // If the repository is named `<username>.github.io`, basePath is empty
  if (!repoName.endsWith(".github.io")) {
    repo = `/${repoName}`;
  }
}

const nextConfig: NextConfig = {
  output: isGithubActions ? "export" : undefined,
  basePath: repo || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

---

### 4. Enabling GitHub Pages

1. In your GitHub repository, click **Settings** ➔ **Pages**.
2. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
3. Push your code to the `main` branch:
   ```bash
   git add .
   git commit -m "feat: setup neon postgres and github actions deployment"
   git push origin main
   ```
4. GitHub Actions will trigger, build the static export, and deploy your site to `https://<username>.github.io/<repository-name>/`.

---

### 6. Important Considerations for GitHub Pages

- **Read-Only Production Frontend:** Because GitHub Pages serves static files, Server Actions cannot execute live database writes directly from the browser on `github.io`.
- **Content Updates:** Whenever you create or modify content (via the local admin panel or CMS), trigger the GitHub Actions workflow (or push a commit). It will query Neon and re-generate the latest static pages.

---

## 💻 Local Development Guide

### 1. Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm, yarn, or pnpm

### 2. Installation
```bash
git clone <your-repo-url>
cd cms-app
npm install
```

### 3. Environment Variables
Ensure your `.env` file contains your Neon database connection strings:
```env
DATABASE_URL="file:./dev.db"
```

### 4. Database Setup
Synchronize your Prisma schema and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build Test
```bash
npm run build
npm run start
```

---

## 📂 Directory Structure

```
cms-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment automation
├── prisma/
│   └── schema.prisma           # Prisma schema (PostgreSQL provider for Neon)
├── src/
│   ├── app/
│   │   ├── [slug]/             # Dynamic slug route (e.g. /hld-and-lld)
│   │   │   └── page.tsx        # Pre-rendered with generateStaticParams()
│   │   ├── actions.ts          # Next.js Server Actions for CRUD operations
│   │   ├── add-content/        # Admin CMS dashboard
│   │   ├── admin/              # Admin login page
│   │   ├── api/cms/            # JSON REST endpoint for content groups
│   │   ├── globals.css         # Styling, light/dark table & code block themes
│   │   ├── layout.tsx          # Root layout and theme initialization
│   │   └── page.tsx            # Documentation home page & reader view
│   ├── components/
│   │   ├── GitbookHeader.tsx   # Header navigation, search, theme switcher
│   │   ├── GitbookSidebar.tsx  # Document tree sidebar with slug links
│   │   ├── GitbookTableOfContents.tsx # Floating right-hand TOC
│   │   └── TiptapEditor.tsx    # Rich text editor component
│   └── lib/
│       ├── prisma.ts           # Global Prisma Client singleton
│       └── slug.ts             # Unicode-friendly slug generator utility
├── next.config.ts              # Next.js configuration with conditional export
├── package.json
└── README_DEPLOYMENT.md        # Comprehensive deployment & product manual
```

---

© 2026 **Farjanul Notebook** | Built with Next.js, Prisma & Neon
