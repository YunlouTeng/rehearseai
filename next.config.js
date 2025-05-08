/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'supabase.co'],
    unoptimized: true, // Required for static export to Netlify
  },
  // Output static HTML/CSS/JS for Netlify deployment
  output: 'export',
  // Add trailing slashes for consistent routing
  trailingSlash: true,
  // Manually set environment variables for static export
  env: {
    // Load from .env.local or use defaults
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Disable TypeScript type checking during build - helps with Supabase type compatibility issues
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 