'use client';

import React from 'react';
import DifficultyBadge from './DifficultyBadge';
import { Question } from '@/lib/api';

interface QuestionCardProps {
  question: Question;
  globalIndex?: number;
}

export default function QuestionCard({ question, globalIndex }: QuestionCardProps) {
  const displayNumber = globalIndex ?? question.questionNumber;

  return (
    <div className="question-card">
      <div className="question-card-header">
        <div className="flex items-start gap-8" style={{ flex: 1 }}>
          <span className="question-number">Q{displayNumber}.</span>
          <p className="question-text">{question.questionText}</p>
        </div>
        <div className="flex items-center gap-8">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="question-marks">{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
        </div>
      </div>

      {question.options && question.options.length > 0 && (
        <div className="question-options">
          {question.options.map((option, idx) => (
            <div key={idx} className="question-option">
              <span className="question-option-label">
                ({String.fromCharCode(97 + idx)})
              </span>
              <span>{option.text || option.label || String(option)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
