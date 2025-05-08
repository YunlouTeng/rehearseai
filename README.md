# RehearseAI

RehearseAI is a web application that helps users practice job interviews by recording themselves answering randomized behavioral and technical interview questions.

## Features

- Question generator with a variety of behavioral and technical interview questions
- Video recording capability using the MediaRecorder API
- Self-evaluation tools with rating and reflection notes
- Session history to review past practice sessions
- Secure storage of videos and metadata in Supabase

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend Services**: Supabase (PostgreSQL database and Storage)
- **Authentication**: Supabase Auth (can be implemented in future versions)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rehearse-ai.git
   cd rehearse-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project in [Supabase](https://supabase.com)
   - Create a `practice_sessions` table with the following schema:
     - `id`: int8, primary key, auto-increment
     - `created_at`: timestamp with time zone, default: now()
     - `question`: text, not null
     - `rating`: integer, not null
     - `notes`: text
     - `video_url`: text, not null
   - Create a storage bucket named `interview-recordings` with appropriate security rules

4. Configure environment variables:
   - Create a `.env.local` file in the root directory with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Start a practice session by clicking "Start Practice Session" on the home page
2. Select a question type (behavioral, technical, or both) and generate a random question
3. Record your answer using the built-in video recorder
4. Review your answer, rate your performance, and add reflection notes
5. Save your session to view later in your history

## Mobile Responsiveness

The application is designed to be fully responsive and works well on both desktop and mobile devices.

## Privacy

- All videos are stored in your private Supabase storage
- Videos are only accessible to the user who created them
- No video data is shared with third parties

## Future Enhancements

- AI-powered feedback on delivery and content
- Transcript generation for speech analysis
- More specialized interview question categories
- User authentication and multi-user support
- Sharing capabilities for getting feedback from others

## License

MIT 