'use client';

import React from 'react';
import { GeneratedPaper } from '@/lib/api';
import StudentInfoSection from './StudentInfoSection';
import SectionBlock from './SectionBlock';

interface QuestionPaperProps {
  paper: GeneratedPaper;
}

export default function QuestionPaper({ paper }: QuestionPaperProps) {
  let questionOffset = 0;

  return (
    <div className="question-paper" id="question-paper">
      {/* Gradient bar at top via CSS ::before */}

      {/* Paper Header */}
      <div className="paper-header">
        <h1 className="paper-institution">
          {paper.institution || 'Academic Institution'}
        </h1>
        <h2 className="paper-title">{paper.title}</h2>
        <div className="paper-meta">
          <div className="paper-meta-item">
            <strong>Subject:</strong> {paper.subject}
          </div>
          <div className="paper-meta-item">
            <strong>Class:</strong> {paper.grade}
          </div>
          {paper.date && (
            <div className="paper-meta-item">
              <strong>Date:</strong> {paper.date}
            </div>
          )}
          {paper.duration && (
            <div className="paper-meta-item">
              <strong>Duration:</strong> {paper.duration}
            </div>
          )}
          <div className="paper-meta-item">
            <strong>Total Marks:</strong> {paper.totalMarks}
          </div>
        </div>
      </div>

      {/* General Instructions */}
      {paper.instructions && paper.instructions.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            General Instructions:
          </h3>
          <ol style={{ paddingLeft: 20, listStyle: 'decimal' }}>
            {paper.instructions.map((instruction, idx) => (
              <li key={idx} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.6 }}>
                {instruction}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Student Info */}
      <StudentInfoSection />

      {/* Sections */}
      {paper.sections.map((section, idx) => {
        const offset = questionOffset;
        questionOffset += section.questions.length;
        return (
          <SectionBlock
            key={idx}
            section={section}
            sectionIndex={idx}
            questionOffset={offset}
          />
        );
      })}
    </div>
  );
}
