'use client';

import React from 'react';
import { Brain } from 'lucide-react';

interface LoaderProps {
  text?: string;
  subText?: string;
  fullPage?: boolean;
}

export default function Loader({ text = 'Loading...', subText, fullPage = false }: LoaderProps) {
  const content = (
    <div className="loader-container">
      <div className="loader-icon">
        <Brain size={32} color="white" />
      </div>
      <div className="loader-dots">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>
      <p className="loader-text">{text}</p>
      {subText && <p className="loader-status">{subText}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="full-loader">{content}</div>;
  }

  return content;
}
