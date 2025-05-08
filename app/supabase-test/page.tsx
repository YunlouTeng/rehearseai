import SupabaseConnectionTest from '../components/SupabaseConnectionTest';

export default function SupabaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Supabase Connection Test</h1>
        <SupabaseConnectionTest />
      </div>
    </div>
  );
} 