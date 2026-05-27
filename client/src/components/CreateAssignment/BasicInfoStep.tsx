'use client';

import React from 'react';
import { BookOpen, GraduationCap, Calendar, Type } from 'lucide-react';
import Input from '@/components/ui/Input';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function BasicInfoStep() {
  const { formFields, setField, validationErrors } = useAssignmentStore();

  return (
    <div className="step-form" style={{ animationDelay: '0.1s' }}>
      <h2 className="step-form-title">📋 Basic Information</h2>
      <p className="step-form-description">
        Provide the essential details for your assessment. This information will appear on the question paper header.
      </p>

      <div className="step-form-fields">
        <Input
          label="Assessment Title"
          placeholder="e.g., Mid-Term Mathematics Exam 2025"
          value={formFields.title}
          onChange={(e) => setField('title', e.target.value)}
          error={validationErrors.title}
          required
          icon={<Type size={18} />}
        />

        <div className="step-form-row">
          <Input
            label="Subject"
            placeholder="e.g., Mathematics"
            value={formFields.subject}
            onChange={(e) => setField('subject', e.target.value)}
            error={validationErrors.subject}
            required
            icon={<BookOpen size={18} />}
          />

          <Input
            label="Grade / Class"
            placeholder="e.g., Grade 10, Class XII"
            value={formFields.grade}
            onChange={(e) => setField('grade', e.target.value)}
            error={validationErrors.grade}
            required
            icon={<GraduationCap size={18} />}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          value={formFields.dueDate}
          onChange={(e) => setField('dueDate', e.target.value)}
          hint="Optional - when the assessment is due"
          icon={<Calendar size={18} />}
        />
      </div>
    </div>
  );
}
