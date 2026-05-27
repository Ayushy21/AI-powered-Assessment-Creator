import { Document } from 'mongoose';

// ── Input types ──────────────────────────────────────────────────────────────

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate?: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  additionalInstructions?: string;
  uploadedFileText?: string;
}

// ── Generated paper types ────────────────────────────────────────────────────

export interface MCQOption {
  label: string;   // A, B, C, D
  text: string;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  type: string;                         // mcq, short-answer, long-answer, true-false, fill-in-the-blank, etc.
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: MCQOption[];                 // only for MCQ questions
}

export interface Section {
  title: string;                         // e.g. "Section A – Multiple Choice"
  instruction: string;                   // e.g. "Attempt all questions. Each carries 1 mark."
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration: string;                      // e.g. "2 hours"
  sections: Section[];
}

// ── Mongoose document type ───────────────────────────────────────────────────

export interface AssignmentDocument extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate?: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  uploadedFileText?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedPaper: GeneratedPaper | null;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}
