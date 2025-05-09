// OpenAI API integration for generating personalized interview questions
import runtimeConfig from './runtime-config';

/**
 * Generate tailored interview questions based on resume and job description
 * 
 * @param resumeText The text extracted from the user's resume
 * @param jobDescription The job description text provided by the user
 * @returns An array of tailored interview questions
 */
export async function generateTailoredQuestions(resumeText: string, jobDescription: string): Promise<string[]> {
  try {
    // Get the OpenAI API key from runtime config
    const apiKey = runtimeConfig.openai.apiKey;
    
    console.log(`OpenAI API key available: ${!!apiKey}`);
    
    if (!apiKey) {
      console.warn('OpenAI API key not found, falling back to mock questions');
      return generateMockQuestions(resumeText, jobDescription);
    }
    
    // Check if we're in Chrome browser (which might have special requirements)
    const isChrome = typeof window !== 'undefined' && 
      window.navigator.userAgent.indexOf("Chrome") > -1 && 
      window.navigator.userAgent.indexOf("Safari") > -1;
    
    if (isChrome) {
      console.log('Chrome browser detected, using optimized OpenAI request');
    }
    
    // In a production app, you would use the OpenAI API directly
    // For now, we'll use the fetch API to call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional recruiter helping to prepare candidates for job interviews.'
          },
          {
            role: 'user',
            content: `Based on the following resume and job description, generate 8-10 tailored interview questions that would likely be asked in an interview for this position. The questions should be specific to the candidate's experience and the job requirements.
            
Resume:
${resumeText}

Job Description:
${jobDescription}

Please format your response as a numbered list of questions only, with no additional explanation or text.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to get response text');
      console.error(`OpenAI API request failed with status ${response.status}: ${response.statusText}`, errorText);
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate the response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from OpenAI:', data);
      throw new Error('Invalid response from OpenAI API');
    }
    
    // Parse the response to extract just the questions
    const questionsText = data.choices[0].message.content.trim();
    
    // Split by newline and filter out any empty lines or non-question lines
    const questions = questionsText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.match(/^\d+\./) || line.match(/^- /))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^- /, ''));

    if (questions.length === 0) {
      console.warn('No questions extracted from OpenAI response, using mock questions instead');
      return generateMockQuestions(resumeText, jobDescription);
    }

    return questions;
  } catch (error) {
    console.error('Error generating tailored questions:', error);
    // Fall back to mock questions when an error occurs
    console.log('Falling back to mock questions due to API error');
    return generateMockQuestions(resumeText, jobDescription);
  }
}

/**
 * Mock function to generate questions without calling OpenAI API
 * Useful for development or when API key is not available
 */
export function generateMockQuestions(resumeText: string, jobDescription: string): string[] {
  // This function returns mock questions for testing purposes
  return [
    `Tell me about your experience with ${resumeText.includes('React') ? 'React development' : 'web development'}.`,
    `The job requires ${jobDescription.includes('team') ? 'teamwork' : 'independent work'}. How do you approach this?`,
    'Describe a challenging project you worked on and how you overcame obstacles.',
    'How do you stay updated with the latest technologies in your field?',
    'Describe your experience with agile development methodologies.',
    'How do you handle tight deadlines and prioritize tasks?',
    'What is your approach to debugging and troubleshooting issues?',
    'Tell me about a time you had to learn a new technology quickly.',
    'How do you handle feedback and criticism?',
    'What are your career goals for the next 3-5 years?'
  ];
} 