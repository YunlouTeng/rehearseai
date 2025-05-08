import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RehearseAI - Practice Job Interviews',
  description: 'Practice job interviews with AI-powered feedback',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Load runtime configuration */}
        <Script id="supabase-config" strategy="beforeInteractive">{`
          window.REHEARSEAI_CONFIG = {
            supabase: {
              url: "${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}",
              anonKey: "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}"
            }
          };
        `}</Script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-50 pt-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
} 