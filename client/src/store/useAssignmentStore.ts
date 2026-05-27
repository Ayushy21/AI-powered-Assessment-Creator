'use client';

import { create } from 'zustand';
import { createAssignment, AssignmentInput, GeneratedPaper } from '@/lib/api';

export interface FormFields {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: string;
  additionalInstructions: string;
  fileContent: string;
  fileName: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

interface AssignmentStore {
  // Form fields
  formFields: FormFields;
  currentStep: number;

  // Generation state
  isGenerating: boolean;
  generationStatus: string;
  generationProgress: number;
  generatedPaper: GeneratedPaper | null;
  currentAssignmentId: string | null;
  error: string | null;

  // Validation
  validationErrors: ValidationErrors;

  // Actions
  setField: <K extends keyof FormFields>(field: K, value: FormFields[K]) => void;
  toggleQuestionType: (type: string) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  validateStep: (step: number) => boolean;

  // Generation actions
  submitAssignment: () => Promise<string | null>;
  setGeneratedPaper: (paper: GeneratedPaper) => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationStatus: (status: string) => void;
  setGenerationProgress: (progress: number) => void;
  setCurrentAssignmentId: (id: string | null) => void;
  setError: (error: string | null) => void;
}

const initialFormFields: FormFields = {
  title: '',
  subject: '',
  grade: '',
  dueDate: '',
  questionTypes: [],
  numberOfQuestions: 10,
  totalMarks: 50,
  difficulty: 'Medium',
  additionalInstructions: '',
  fileContent: '',
  fileName: '',
};

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  formFields: { ...initialFormFields },
  currentStep: 1,
  isGenerating: false,
  generationStatus: '',
  generationProgress: 0,
  generatedPaper: null,
  currentAssignmentId: null,
  error: null,
  validationErrors: {},

  setField: (field, value) => {
    set((state) => ({
      formFields: { ...state.formFields, [field]: value },
      validationErrors: { ...state.validationErrors, [field]: '' },
    }));
  },

  toggleQuestionType: (type: string) => {
    set((state) => {
      const types = state.formFields.questionTypes;
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];
      return {
        formFields: { ...state.formFields, questionTypes: newTypes },
        validationErrors: { ...state.validationErrors, questionTypes: '' },
      };
    });
  },

  validateStep: (step: number): boolean => {
    const { formFields } = get();
    const errors: ValidationErrors = {};

    if (step === 1) {
      if (!formFields.title.trim()) {
        errors.title = 'Title is required';
      }
      if (!formFields.subject.trim()) {
        errors.subject = 'Subject is required';
      }
      if (!formFields.grade.trim()) {
        errors.grade = 'Grade/Class is required';
      }
    }

    if (step === 2) {
      if (formFields.questionTypes.length === 0) {
        errors.questionTypes = 'Select at least one question type';
      }
      if (formFields.numberOfQuestions < 1 || formFields.numberOfQuestions > 50) {
        errors.numberOfQuestions = 'Number of questions must be between 1 and 50';
      }
      if (formFields.totalMarks < 1) {
        errors.totalMarks = 'Total marks must be at least 1';
      }
      if (!formFields.difficulty) {
        errors.difficulty = 'Select a difficulty level';
      }
    }

    set({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  },

  nextStep: (): boolean => {
    const { currentStep, validateStep } = get();
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        set({ currentStep: currentStep + 1 });
      }
      return true;
    }
    return false;
  },

  prevStep: () => {
    set((state) => ({
      currentStep: Math.max(1, state.currentStep - 1),
      validationErrors: {},
    }));
  },

  goToStep: (step: number) => {
    if (step >= 1 && step <= 3) {
      set({ currentStep: step, validationErrors: {} });
    }
  },

  resetForm: () => {
    set({
      formFields: { ...initialFormFields },
      currentStep: 1,
      isGenerating: false,
      generationStatus: '',
      generationProgress: 0,
      generatedPaper: null,
      currentAssignmentId: null,
      error: null,
      validationErrors: {},
    });
  },

  submitAssignment: async (): Promise<string | null> => {
    const { formFields, validateStep } = get();

    // Validate all steps
    if (!validateStep(1) || !validateStep(2)) {
      return null;
    }

    set({ isGenerating: true, error: null, generationStatus: 'Submitting assignment...', generationProgress: 0 });

    try {
      const payload: AssignmentInput = {
        title: formFields.title.trim(),
        subject: formFields.subject.trim(),
        grade: formFields.grade.trim(),
        dueDate: formFields.dueDate || undefined,
        questionTypes: formFields.questionTypes,
        numberOfQuestions: formFields.numberOfQuestions,
        totalMarks: formFields.totalMarks,
        difficulty: formFields.difficulty,
        additionalInstructions: formFields.additionalInstructions.trim() || undefined,
        fileContent: formFields.fileContent || undefined,
      };

      const response = await createAssignment(payload);

      // Handle different response shapes from backend
      const assignment = response.data || response;
      const id = (assignment as { _id?: string; id?: string })._id || (assignment as { _id?: string; id?: string }).id;

      if (id) {
        set({
          currentAssignmentId: id,
          generationStatus: 'Assignment created! Generating questions...',
          generationProgress: 10,
        });
        return id;
      }

      throw new Error('No assignment ID returned');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create assignment';
      set({
        error: errorMessage,
        isGenerating: false,
        generationStatus: '',
      });
      return null;
    }
  },

  setGeneratedPaper: (paper: GeneratedPaper) => {
    set({
      generatedPaper: paper,
      isGenerating: false,
      generationStatus: 'Complete!',
      generationProgress: 100,
    });
  },

  setGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },

  setGenerationStatus: (status: string) => {
    set({ generationStatus: status });
  },

  setGenerationProgress: (progress: number) => {
    set({ generationProgress: progress });
  },

  setCurrentAssignmentId: (id: string | null) => {
    set({ currentAssignmentId: id });
  },

  setError: (error: string | null) => {
    set({ error, isGenerating: false });
  },
}));
