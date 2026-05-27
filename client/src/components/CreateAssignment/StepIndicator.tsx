'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <div className="step-item">
              <div
                className={`step-circle ${
                  isActive
                    ? 'step-circle-active'
                    : isCompleted
                    ? 'step-circle-completed'
                    : ''
                }`}
              >
                {isCompleted ? <Check size={20} /> : stepNumber}
              </div>
              <span
                className={`step-label ${
                  isActive
                    ? 'step-label-active'
                    : isCompleted
                    ? 'step-label-completed'
                    : ''
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`step-line ${
                  isCompleted
                    ? 'step-line-completed'
                    : isActive
                    ? 'step-line-active'
                    : ''
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
