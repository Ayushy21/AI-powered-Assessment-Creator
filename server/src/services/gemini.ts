import { GoogleGenerativeAI } from '@google/generative-ai';
import { AssignmentInput, GeneratedPaper, Section } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Build a detailed prompt that instructs Gemini to return a structured exam paper.
 */
function buildPrompt(input: AssignmentInput): string {
  const questionTypesList = input.questionTypes.join(', ');

  const contextBlock = input.uploadedFileText
    ? `\n\nREFERENCE MATERIAL (use this as the knowledge base for the questions):\n"""\n${input.uploadedFileText}\n"""\n`
    : '';

  const additionalBlock = input.additionalInstructions
    ? `\nADDITIONAL INSTRUCTIONS FROM THE TEACHER:\n${input.additionalInstructions}\n`
    : '';

  return `You are an expert academic examination paper creator. Generate a high-quality assessment paper based on the specifications below.

SPECIFICATIONS:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade/Level: ${input.grade}
- Total Questions: ${input.numberOfQuestions}
- Total Marks: ${input.totalMarks}
- Difficulty: ${input.difficulty}
- Question Types Required: ${questionTypesList}
${input.dueDate ? `- Due Date: ${input.dueDate}` : ''}
${contextBlock}${additionalBlock}

REQUIREMENTS:
1. Create multiple sections (e.g., Section A, Section B, Section C) grouped logically by question type or difficulty level.
2. Each section MUST have:
   - "title": descriptive title (e.g., "Section A – Multiple Choice Questions")
   - "instruction": clear instruction (e.g., "Attempt all questions. Each question carries 1 mark.")
   - "questions": array of question objects
3. Each question object MUST have:
   - "id": unique string identifier (e.g., "q1", "q2", etc.)
   - "text": the full question text, well-written and academically appropriate for the grade level
   - "type": one of [${questionTypesList}]
   - "difficulty": one of ["easy", "medium", "hard"]
   - "marks": integer marks for this question
   - "options": array of {"label": "A", "text": "..."} objects — ONLY for MCQ and true-false questions; omit for other types
4. The total marks across ALL questions MUST sum to exactly ${input.totalMarks}.
5. The total number of questions MUST be exactly ${input.numberOfQuestions}.
6. ${input.difficulty === 'mixed' ? 'Distribute difficulty evenly across easy, medium, and hard.' : `Most questions should be "${input.difficulty}" difficulty.`}
7. Questions must be original, clear, unambiguous, and pedagogically sound for grade ${input.grade} ${input.subject}.
8. For MCQ questions, provide exactly 4 options (A, B, C, D) with one correct answer clearly being the best choice.
9. For true-false questions, provide 2 options: {"label": "A", "text": "True"} and {"label": "B", "text": "False"}.

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanation, no extra text.

JSON SCHEMA:
{
  "title": "string",
  "subject": "string",
  "grade": "string",
  "totalMarks": number,
  "duration": "string (e.g., '2 hours')",
  "sections": [
    {
      "title": "string",
      "instruction": "string",
      "questions": [
        {
          "id": "string",
          "text": "string",
          "type": "string",
          "difficulty": "easy" | "medium" | "hard",
          "marks": number,
          "options": [{"label": "string", "text": "string"}]  // only for mcq/true-false
        }
      ]
    }
  ]
}`;
}

/**
 * Strip markdown code fences (```json ... ```) if Gemini wraps the response.
 */
function stripCodeFences(text: string): string {
  let cleaned = text.trim();
  // Remove ```json or ``` prefix
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  // Remove trailing ```
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Validate that the parsed object looks like a GeneratedPaper.
 */
function validatePaper(paper: unknown): paper is GeneratedPaper {
  if (!paper || typeof paper !== 'object') return false;

  const p = paper as Record<string, unknown>;

  if (typeof p.title !== 'string') return false;
  if (typeof p.subject !== 'string') return false;
  if (typeof p.grade !== 'string') return false;
  if (typeof p.totalMarks !== 'number') return false;
  if (typeof p.duration !== 'string') return false;
  if (!Array.isArray(p.sections) || p.sections.length === 0) return false;

  for (const section of p.sections as Section[]) {
    if (typeof section.title !== 'string') return false;
    if (typeof section.instruction !== 'string') return false;
    if (!Array.isArray(section.questions) || section.questions.length === 0) return false;

    for (const q of section.questions) {
      if (typeof q.id !== 'string') return false;
      if (typeof q.text !== 'string') return false;
      if (typeof q.type !== 'string') return false;
      if (typeof q.difficulty !== 'string') return false;
      if (typeof q.marks !== 'number') return false;
    }
  }

  return true;
}

/**
 * Generate an assessment paper using Google Gemini 1.5 Flash.
 */
export async function generatePaper(input: AssignmentInput): Promise<GeneratedPaper> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = buildPrompt(input);

  console.log('🤖 Sending prompt to Gemini 1.5 Flash…');

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  console.log('📄 Received response from Gemini, parsing…');

  const cleanedText = stripCodeFences(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (parseError) {
    console.error('❌ Failed to parse Gemini response as JSON');
    console.error('Raw response (first 500 chars):', cleanedText.substring(0, 500));
    throw new Error('Failed to parse AI response as valid JSON. The model returned malformed output.');
  }

  if (!validatePaper(parsed)) {
    console.error('❌ Gemini response does not match GeneratedPaper schema');
    throw new Error('AI response does not match the expected paper structure.');
  }

  console.log(
    `✅ Paper generated: ${(parsed as GeneratedPaper).sections.length} sections, ${
      (parsed as GeneratedPaper).sections.reduce((acc, s) => acc + s.questions.length, 0)
    } questions`
  );

  return parsed as GeneratedPaper;
}

export default generatePaper;
