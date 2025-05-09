// Type declarations for global window object
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