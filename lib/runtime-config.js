// Runtime configuration that can be updated even after the build
const runtimeConfig = {
  // Default to actual environment variables if available
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yvktzaevvikkzmyquhsy.supabase.co",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  }
};

// If we're in the browser, check for config from window
if (typeof window !== 'undefined' && window.REHEARSEAI_CONFIG) {
  // Override with window config if available
  if (window.REHEARSEAI_CONFIG.supabase?.url) {
    runtimeConfig.supabase.url = window.REHEARSEAI_CONFIG.supabase.url;
  }
  if (window.REHEARSEAI_CONFIG.supabase?.anonKey) {
    runtimeConfig.supabase.anonKey = window.REHEARSEAI_CONFIG.supabase.anonKey;
  }
}

// Export config for use in the application
export default runtimeConfig; 