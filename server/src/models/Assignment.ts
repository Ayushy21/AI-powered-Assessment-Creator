import mongoose, { Schema } from 'mongoose';
import { AssignmentDocument } from '../types';

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    dueDate: {
      type: String,
      default: '',
    },
    questionTypes: {
      type: [String],
      default: ['mcq'],
    },
    numberOfQuestions: {
      type: Number,
      required: [true, 'Number of questions is required'],
      min: [1, 'Must have at least 1 question'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'medium',
    },
    additionalInstructions: {
      type: String,
      default: '',
    },
    uploadedFileText: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    generatedPaper: {
      type: Schema.Types.Mixed,
      default: null,
    },
    jobId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient listing sorted by newest first
AssignmentSchema.index({ createdAt: -1 });

const Assignment = mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema);

export default Assignment;
