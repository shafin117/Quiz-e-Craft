import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Question Generator Endpoint
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic, difficulty = 'Medium', count = 5, questionType = 'mixed' } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a valid topic.' });
    }

    const requestedCount = Math.min(Math.max(parseInt(count) || 5, 1), 10);

    const typeInstruction = 
      questionType === 'single' ? 'All questions must be single-choice multiple choice questions (single correct option).' :
      questionType === 'multiple' ? 'All questions must be multiple-select questions (two or more correct options).' :
      questionType === 'boolean' ? 'All questions must be True/False questions (options must be "True" and "False").' :
      questionType === 'text' ? 'All questions must be short answer questions (text match with expected answer strings).' :
      'Provide a balanced mix of single-choice MCQ, multiple-select, True/False, and short-answer questions.';

    const prompt = `You are an expert educator and exam author.
Generate ${requestedCount} high-quality quiz questions about "${topic.trim()}" at a "${difficulty}" difficulty level.
${typeInstruction}

Rules:
1. Every question must be accurate, clearly phrased, and educational.
2. For single-choice MCQ ('single'), provide 4 options. Option IDs must be "opt1", "opt2", "opt3", "opt4". Exactly 1 option ID must be in correctAnswers.
3. For multiple-select ('multiple'), provide 4 options ("opt1", "opt2", "opt3", "opt4"). At least 2 option IDs must be in correctAnswers.
4. For True/False ('boolean'), provide 2 options: "opt1" with text "True" and "opt2" with text "False". Exactly 1 option ID must be in correctAnswers.
5. For short-answer ('text'), leave options as empty array []. correctAnswers must be an array of 1 to 3 valid variations of the concise answer string (e.g. ["Paris"], ["H2O", "Water"]).
6. Each question must include an explanation explaining why the correct answer is right and correcting common misconceptions.
7. Points should be an integer between 1 and 3 (default 1).

Respond ONLY with valid JSON matching this structure:
{
  "questions": [
    {
      "text": "Question text here",
      "type": "single", // "single" | "multiple" | "boolean" | "text"
      "options": [
        { "id": "opt1", "text": "Option A" },
        { "id": "opt2", "text": "Option B" },
        { "id": "opt3", "text": "Option C" },
        { "id": "opt4", "text": "Option D" }
      ],
      "correctAnswers": ["opt1"],
      "points": 1,
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from AI model.');
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Attempt to clean markdown code fences if any
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    }

    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid JSON format received from AI model.');
    }

    // Sanitize and ensure IDs
    const sanitizedQuestions = parsed.questions.map((q: any, idx: number) => {
      const qType = ['single', 'multiple', 'boolean', 'text'].includes(q.type) ? q.type : 'single';
      let options = Array.isArray(q.options) ? q.options : [];
      
      if (qType === 'boolean' && options.length !== 2) {
        options = [
          { id: 'opt1', text: 'True' },
          { id: 'opt2', text: 'False' }
        ];
      }

      // Ensure options have proper ids
      options = options.map((opt: any, oIdx: number) => ({
        id: String(opt.id || `opt${oIdx + 1}`),
        text: String(opt.text || `Option ${oIdx + 1}`).trim()
      }));

      return {
        id: `gen_q_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        text: String(q.text || 'Untitled Question').trim(),
        type: qType,
        options,
        correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers.map(String) : [],
        points: Math.max(1, parseInt(q.points) || 1),
        explanation: String(q.explanation || 'No explanation provided.').trim(),
      };
    });

    return res.json({ questions: sanitizedQuestions });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate questions. Please try again.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`QuizCraft server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
