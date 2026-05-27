'use client';

import React from 'react';
import { ClipboardList, Sparkles } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import FileUpload from './FileUpload';

export default function AdditionalOptionsStep() {
  const { formFields, setField } = useAssignmentStore();

  return (
    <div className="step-form" style={{ animationDelay: '0.1s' }}>
      <h2 className="step-form-title">✨ Final Details</h2>
      <p className="step-form-description">
        Add reference material and additional instructions. Review your configuration before generating.
      </p>

      <div className="step-form-fields">
        {/* Summary of previous steps */}
        <div className="summary-section">
          <h3 className="summary-title">
            <ClipboardList size={16} />
            Configuration Summary
          </h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-item-label">Title</span>
              <span className="summary-item-value">{formFields.title || '—'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Subject</span>
              <span className="summary-item-value">{formFields.subject || '—'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Grade</span>
              <span className="summary-item-value">{formFields.grade || '—'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Due Date</span>
              <span className="summary-item-value">{formFields.dueDate || 'Not set'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Question Types</span>
              <span className="summary-item-value">
                {formFields.questionTypes.length > 0
                  ? formFields.questionTypes.join(', ')
                  : '—'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Questions</span>
              <span className="summary-item-value">{formFields.numberOfQuestions}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Total Marks</span>
              <span className="summary-item-value">{formFields.totalMarks}</span>
            </div>
            <div className="summary-item">
              <span className="summary-item-label">Difficulty</span>
              <span className="summary-item-value">{formFields.difficulty}</span>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <FileUpload />

        {/* Additional Instructions */}
        <div className="form-group">
          <label className="form-label" htmlFor="instructions">
            <Sparkles size={16} />
            Additional Instructions
          </label>
          <textarea
            id="instructions"
            className="form-input"
            placeholder="e.g., Focus on chapters 5-8, include application-based questions, avoid repetitive patterns..."
            value={formFields.additionalInstructions}
            onChange={(e) => setField('additionalInstructions', e.target.value)}
            rows={5}
          />
          <span className="form-hint">
            Optional — Give the AI specific instructions for generating your questions
          </span>
        </div>
      </div>
    </div>
  );
}
