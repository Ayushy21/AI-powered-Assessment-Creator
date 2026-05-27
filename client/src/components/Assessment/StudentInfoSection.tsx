'use client';

import React from 'react';

export default function StudentInfoSection() {
  return (
    <div className="student-info">
      <div className="student-info-field">
        <span className="student-info-label">Name:</span>
        <div className="student-info-line" />
      </div>
      <div className="student-info-field">
        <span className="student-info-label">Roll No:</span>
        <div className="student-info-line" />
      </div>
      <div className="student-info-field">
        <span className="student-info-label">Section:</span>
        <div className="student-info-line" />
      </div>
      <div className="student-info-field">
        <span className="student-info-label">Date:</span>
        <div className="student-info-line" />
      </div>
    </div>
  );
}
