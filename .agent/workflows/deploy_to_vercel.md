---
description: How to deploy TaijiFlow to Vercel (ai.taijiflow.org)
---

# Deploying TaijiFlow to Vercel

This guide explains how to host your static site on Vercel and configure the `ai.taijiflow.org` subdomain.

## Prerequisites

1.  **Vercel Account:** Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repository:** Ensure your code is pushed to a GitHub repository.
3.  **Domain Access:** Access to your domain registrar's DNS settings (where you bought `taijiflow.org`).

## Step 1: Import Project to Vercel

1.  Log in to your Vercel Dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository (`TaijiFlow`).
4.  **Framework Preset:** Vercel should automatically detect "Other" or "Static". Since this is a plain HTML/JS project, "Other" is correct.
5.  **Build Command:** Leave empty (unless you have a build step).
6.  **Output Directory:** Leave empty (default is root).
7.  Click **"Deploy"**.

## Step 2: Configure Subdomain

1.  Once deployed, go to the project **Settings**.
2.  Select **"Domains"** from the left menu.
3.  Enter `ai.taijiflow.org` in the input field and click **"Add"**.
4.  Vercel will provide the required DNS records.

## Step 3: Configure DNS (at your Registrar)

1.  Log in to the website where you bought your domain (e.g., Namecheap, GoDaddy, Google Domains, Cloudflare).
2.  Go to the **DNS Management** section for `taijiflow.org`.
3.  Add a new **CNAME** record:
    *   **Type:** `CNAME`
    *   **Name (Host):** `ai`
    *   **Value (Target):** `cname.vercel-dns.com` (Vercel will confirm the exact value, sometimes it's `cname.vercel-dns.com.`).
    *   **TTL:** Automatic or 3600.
4.  Save the record.

## Step 4: Verification

1.  Go back to Vercel Domain Settings.
2.  It may take a few minutes (up to 24h) for DNS to propagate.
3.  Once the indicator turns green (Valid Configuration), your site is live at `https://ai.taijiflow.org`.

## Alternative: Vercel CLI (Local Deployment)

If you don't want to use GitHub:
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in your project root.
3.  Follow the prompts to link/create the project.
4.  Run `vercel --prod` to deploy to production.
5.  Configure the domain in the dashboard as per Step 2-3.
