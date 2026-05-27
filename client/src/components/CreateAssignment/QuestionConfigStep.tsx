'use client';

import React from 'react';
import { Check, Hash, Award } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const questionTypes = [
  { value: 'MCQ', label: 'Multiple Choice', description: 'A, B, C, D options', icon: '🔘' },
  { value: 'Short Answer', label: 'Short Answer', description: '2-3 sentence response', icon: '📝' },
  { value: 'Long Answer', label: 'Long Answer', description: 'Detailed explanation', icon: '📄' },
  { value: 'True/False', label: 'True / False', description: 'Binary choice', icon: '✅' },
];

const difficulties = [
  { value: 'Easy', label: 'Easy', icon: '🌱', className: 'difficulty-easy' },
  { value: 'Medium', label: 'Medium', icon: '⚡', className: 'difficulty-medium' },
  { value: 'Hard', label: 'Hard', icon: '🔥', className: 'difficulty-hard' },
  { value: 'Mixed', label: 'Mixed', icon: '🎯', className: 'difficulty-mixed' },
];

export default function QuestionConfigStep() {
  const { formFields, setField, toggleQuestionType, validationErrors } = useAssignmentStore();

  return (
    <div className="step-form" style={{ animationDelay: '0.1s' }}>
      <h2 className="step-form-title">⚙️ Question Configuration</h2>
      <p className="step-form-description">
        Configure the types of questions, difficulty, and quantity for your assessment.
      </p>

      <div className="step-form-fields">
        {/* Question Types */}
        <div className="form-group">
          <label className="form-label">
            Question Types
            <span className="form-label-required">*</span>
          </label>
          <div className="question-type-grid">
            {questionTypes.map((type) => {
              const isSelected = formFields.questionTypes.includes(type.value);
              return (
                <div
                  key={type.value}
                  className={`question-type-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleQuestionType(type.value)}
                >
                  <div className="question-type-checkbox">
                    {isSelected && <Check size={14} color="white" />}
                  </div>
                  <div>
                    <div className="question-type-label">
                      <span style={{ marginRight: 6 }}>{type.icon}</span>
                      {type.label}
                    </div>
                    <div className="question-type-desc">{type.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {validationErrors.questionTypes && (
            <span className="form-error">{validationErrors.questionTypes}</span>
          )}
        </div>

        {/* Number and Marks */}
        <div className="step-form-row">
          <Input
            label="Number of Questions"
            type="number"
            min={1}
            max={50}
            value={formFields.numberOfQuestions}
            onChange={(e) => setField('numberOfQuestions', parseInt(e.target.value) || 1)}
            error={validationErrors.numberOfQuestions}
            required
            icon={<Hash size={18} />}
            hint="Between 1 and 50"
          />

          <Input
            label="Total Marks"
            type="number"
            min={1}
            value={formFields.totalMarks}
            onChange={(e) => setField('totalMarks', parseInt(e.target.value) || 1)}
            error={validationErrors.totalMarks}
            required
            icon={<Award size={18} />}
            hint="Total marks for the assessment"
          />
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label className="form-label">
            Difficulty Level
            <span className="form-label-required">*</span>
          </label>
          <div className="difficulty-grid">
            {difficulties.map((diff) => (
              <div
                key={diff.value}
                className={`difficulty-card ${diff.className} ${
                  formFields.difficulty === diff.value ? 'selected' : ''
                }`}
                onClick={() => setField('difficulty', diff.value)}
              >
                <span className="difficulty-icon">{diff.icon}</span>
                <span className="difficulty-label">{diff.label}</span>
              </div>
            ))}
          </div>
          {validationErrors.difficulty && (
            <span className="form-error">{validationErrors.difficulty}</span>
          )}
        </div>
      </div>
    </div>
  );
}
