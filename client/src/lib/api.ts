const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    const headers = { ...config.headers } as Record<string, string>;
    delete headers['Content-Type'];
    config.headers = headers;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate?: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  fileContent?: string;
}

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  questionNumber: number;
  questionText: string;
  type: string;
  difficulty: string;
  marks: number;
  options?: QuestionOption[];
  answer?: string;
}

export interface Section {
  sectionTitle: string;
  sectionInstruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  institution?: string;
  title: string;
  subject: string;
  grade: string;
  date?: string;
  duration?: string;
  totalMarks: number;
  instructions?: string[];
  sections: Section[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate?: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions?: string;
  generatedPaper?: GeneratedPaper;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export async function createAssignment(data: AssignmentInput): Promise<ApiResponse<Assignment>> {
  return fetchApi<ApiResponse<Assignment>>('/assignments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAssignment(id: string): Promise<ApiResponse<Assignment>> {
  return fetchApi<ApiResponse<Assignment>>(`/assignments/${id}`);
}

export async function getAssignments(): Promise<ApiResponse<Assignment[]>> {
  return fetchApi<ApiResponse<Assignment[]>>('/assignments');
}

export async function regenerateAssignment(id: string): Promise<ApiResponse<Assignment>> {
  return fetchApi<ApiResponse<Assignment>>(`/assignments/${id}/regenerate`, {
    method: 'POST',
  });
}
