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
};

module.exports = nextConfig; 