import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">RehearseAI</h1>
      <p className="text-lg text-center mb-8 max-w-lg">
        Practice your job interview skills by recording yourself answering real interview questions.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/practice" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Practice Session
        </Link>
        <Link 
          href="/history" 
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          View Session History
        </Link>
      </div>
    </div>
  );
} 