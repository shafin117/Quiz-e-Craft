import { Question } from '../types';

export interface GenerateQuestionsParams {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
  questionType: 'mixed' | 'single' | 'multiple' | 'boolean' | 'text';
}

export async function generateQuestionsWithAI(params: GenerateQuestionsParams): Promise<Question[]> {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to generate questions';
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMsg = errorData.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid format returned by AI service.');
  }

  return data.questions;
}
