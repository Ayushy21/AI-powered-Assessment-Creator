'use client';

import React from 'react';
import QuestionCard from './QuestionCard';
import { Section } from '@/lib/api';

interface SectionBlockProps {
  section: Section;
  sectionIndex: number;
  questionOffset: number;
}

export default function SectionBlock({ section, sectionIndex, questionOffset }: SectionBlockProps) {
  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const sectionLetter = sectionLetters[sectionIndex] || String(sectionIndex + 1);

  return (
    <div className="section-block">
      <div className="section-block-header">
        <h3 className="section-block-title">
          Section {sectionLetter} — {section.sectionTitle}
        </h3>
      </div>
      {section.sectionInstruction && (
        <p className="section-block-instruction">{section.sectionInstruction}</p>
      )}
      <div>
        {section.questions.map((question, idx) => (
          <QuestionCard
            key={idx}
            question={question}
            globalIndex={questionOffset + idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
