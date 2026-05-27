'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import StepIndicator from '@/components/CreateAssignment/StepIndicator';
import BasicInfoStep from '@/components/CreateAssignment/BasicInfoStep';
import QuestionConfigStep from '@/components/CreateAssignment/QuestionConfigStep';
import AdditionalOptionsStep from '@/components/CreateAssignment/AdditionalOptionsStep';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const steps = [
  { label: 'Basic Info', description: 'Title, subject, and grade' },
  { label: 'Questions', description: 'Types, count, and difficulty' },
  { label: 'Finalize', description: 'Instructions and generate' },
];

export default function CreatePage() {
  const router = useRouter();
  const {
    currentStep,
    nextStep,
    prevStep,
    submitAssignment,
    isGenerating,
    validateStep,
  } = useAssignmentStore();

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep();
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleGenerate = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.loading('Creating your assessment...', { id: 'generating' });

    const assignmentId = await submitAssignment();

    if (assignmentId) {
      toast.success('Assessment created! Generating questions...', { id: 'generating' });
      router.push(`/assessment/${assignmentId}`);
    } else {
      toast.error('Failed to create assessment. Please try again.', { id: 'generating' });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <QuestionConfigStep />;
      case 3:
        return <AdditionalOptionsStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  return (
    <div className="create-page">
      <h1 className="create-page-title">Create New Assessment</h1>
      <p className="create-page-subtitle">
        Follow the steps below to configure and generate your AI-powered question paper.
      </p>

      <StepIndicator currentStep={currentStep} steps={steps} />

      {renderStep()}

      {/* Navigation Buttons */}
      <div className="step-form-actions">
        <div>
          {currentStep > 1 && (
            <Button
              variant="ghost"
              size="md"
              onClick={prevStep}
              icon={<ArrowLeft size={18} />}
            >
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-12">
          {currentStep < 3 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={<ArrowRight size={18} />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              loading={isGenerating}
              icon={<Sparkles size={20} />}
            >
              Generate Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
