// Types for runtime configuration
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface OpenAIConfig {
  apiKey: string;
}

interface RuntimeConfig {
  supabase: SupabaseConfig;
  openai: OpenAIConfig;
}

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Runtime configuration that can be updated even after the build
const runtimeConfig: RuntimeConfig = {
  // Default to actual environment variables if available
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yvktzaevvikkzmyquhsy.supabase.co",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  openai: {
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  }
};

// Define window interface
declare global {
  interface Window {
    REHEARSEAI_CONFIG?: {
      supabase?: {
        url?: string;
        anonKey?: string;
      };
      openai?: {
        apiKey?: string;
      };
    };
  }
}

// If we're in the browser, check for config from window
if (isBrowser && window.REHEARSEAI_CONFIG) {
  // Override with window config if available
  if (window.REHEARSEAI_CONFIG.supabase?.url) {
    runtimeConfig.supabase.url = window.REHEARSEAI_CONFIG.supabase.url;
  }
  if (window.REHEARSEAI_CONFIG.supabase?.anonKey) {
    runtimeConfig.supabase.anonKey = window.REHEARSEAI_CONFIG.supabase.anonKey;
  }
  if (window.REHEARSEAI_CONFIG.openai?.apiKey) {
    runtimeConfig.openai.apiKey = window.REHEARSEAI_CONFIG.openai.apiKey;
  }
}

// Export config for use in the application
export default runtimeConfig; 