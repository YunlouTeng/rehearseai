import Link from 'next/link';

export default function SetupErrorPage() {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Setup Error</h1>
      <p className="mb-4">
        The application is not properly configured. Please make sure to set up the required environment variables:
      </p>
      
      <ul className="list-disc pl-5 mb-6 text-gray-700">
        <li className="mb-2">
          <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
        </li>
        <li className="mb-2">
          <code className="bg-gray-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </li>
      </ul>
      
      <p className="mb-6">
        Please refer to the README file for setup instructions.
      </p>
      
      <Link 
        href="/"
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
} 