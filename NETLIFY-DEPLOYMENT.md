# Deploying RehearseAI to Netlify

This guide walks you through deploying your RehearseAI application to Netlify.

## 1. Prepare Your Next.js Application

First, update your `next.config.js` to optimize for Netlify deployment:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Creates static HTML/CSS/JS files
  images: {
    unoptimized: true, // Required for static export
  },
  // Add this if your app uses trailing slashes in routes
  trailingSlash: true,
}

module.exports = nextConfig
```

## 2. Create a Netlify Account

1. Go to [Netlify](https://www.netlify.com/) and sign up for an account if you don't already have one
2. Log in to your Netlify account

## 3. Deploy Your Site to Netlify

### Option 1: Deploy from Git repository (Recommended)

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. In Netlify, click **Add new site** > **Import an existing project**
3. Connect to your Git provider and select your RehearseAI repository
4. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
5. Click **Deploy site**

### Option 2: Manual Deploy

If you prefer to deploy manually:

1. Run the build locally:
   ```bash
   npm run build
   ```
2. In Netlify, click **Add new site** > **Deploy manually**
3. Drag and drop the `out` directory that was created during the build

## 4. Configure Environment Variables

You need to add your Supabase credentials to Netlify:

1. Go to **Site settings** > **Build & deploy** > **Environment variables**
2. Add the following variables with the same values you have in your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Configure Redirects for Single Page Application

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "out"

# Handle SPA redirects
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 6. Set Up a Custom Domain (Optional)

1. Go to **Site settings** > **Domain management**
2. Click **Add custom domain**
3. Follow the instructions to configure your domain

## 7. Enable HTTPS (Automatically handled by Netlify)

Netlify automatically provisions SSL certificates for your site, including custom domains.

## 8. Test Your Deployed Application

1. Once deployment is complete, click on the URL Netlify provides
2. Test the following functionality:
   - User authentication (signup/login)
   - Video recording
   - Saving recordings to Supabase
   - Viewing previous recordings

## Troubleshooting

If you encounter issues:

1. **CORS errors**: Make sure your Supabase project allows requests from your Netlify domain
   - Go to your Supabase dashboard > Project Settings > API
   - Add your Netlify URL to the "Additional Allowed Headers" section

2. **Authentication issues**: Ensure your Supabase project has the correct redirect URLs
   - Go to your Supabase dashboard > Authentication > URL Configuration
   - Add your Netlify URL to the "Site URL" and "Redirect URLs" sections

3. **Build errors**: Check the build logs in Netlify for specific errors

4. **API route issues**: Note that with static export, API routes won't work. If your app uses Next.js API routes, you may need to switch to Netlify Functions or refactor to use Supabase directly.

## Continuous Deployment

If you connected your Git repository, Netlify will automatically rebuild and deploy your site when you push changes to your repository. 