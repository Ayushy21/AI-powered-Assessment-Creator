'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Brain, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getAssignment, regenerateAssignment, Assignment, GeneratedPaper } from '@/lib/api';
import { getSocket, joinAssignment, leaveAssignment } from '@/lib/socket';
import QuestionPaper from '@/components/Assessment/QuestionPaper';
import ActionBar from '@/components/Assessment/ActionBar';
import Button from '@/components/ui/Button';

type PageStatus = 'loading' | 'generating' | 'completed' | 'failed';

export default function AssessmentPage() {
  const params = useParams();
  const id = params.id as string;

  const [status, setStatus] = useState<PageStatus>('loading');
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [generationText, setGenerationText] = useState('Loading assessment...');
  const [progress, setProgress] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = useCallback(async () => {
    try {
      const response = await getAssignment(id);
      const data = (response.data || response) as Assignment;

      setAssignment(data);

      if (data.status === 'completed' && data.generatedPaper) {
        setPaper(data.generatedPaper);
        setStatus('completed');
        setProgress(100);
      } else if (data.status === 'failed') {
        setStatus('failed');
        setError('Assessment generation failed. Please try regenerating.');
      } else if (data.status === 'generating' || data.status === 'pending') {
        setStatus('generating');
        setGenerationText('AI is generating your assessment...');
        setProgress(20);
      } else {
        // If status is unknown but has paper, show it
        if (data.generatedPaper) {
          setPaper(data.generatedPaper);
          setStatus('completed');
        } else {
          setStatus('generating');
          setGenerationText('Preparing your assessment...');
        }
      }
    } catch (err) {
      console.error('Failed to fetch assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
      setStatus('failed');
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchAssignment();
    }
  }, [id, fetchAssignment]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (!id) return;

    let socket: ReturnType<typeof getSocket>;

    try {
      socket = getSocket();
      joinAssignment(id);

      socket.on('generation:started', (data: { assignmentId: string }) => {
        if (data.assignmentId === id) {
          setStatus('generating');
          setGenerationText('AI is analyzing your requirements...');
          setProgress(15);
        }
      });

      socket.on('generation:progress', (data: { assignmentId: string; progress: number; message?: string }) => {
        if (data.assignmentId === id) {
          setProgress(data.progress);
          if (data.message) {
            setGenerationText(data.message);
          }
        }
      });

      socket.on('generation:completed', (data: { assignmentId: string; paper?: GeneratedPaper }) => {
        if (data.assignmentId === id) {
          setProgress(100);
          setGenerationText('Assessment generated successfully!');
          if (data.paper) {
            setPaper(data.paper);
            setStatus('completed');
          } else {
            // Refetch to get the paper
            fetchAssignment();
          }
          toast.success('Assessment generated successfully!');
        }
      });

      socket.on('generation:failed', (data: { assignmentId: string; error?: string }) => {
        if (data.assignmentId === id) {
          setStatus('failed');
          setError(data.error || 'Generation failed. Please try again.');
          toast.error('Assessment generation failed');
        }
      });
    } catch (err) {
      console.error('Socket connection error:', err);
    }

    return () => {
      try {
        leaveAssignment(id);
        if (socket) {
          socket.off('generation:started');
          socket.off('generation:progress');
          socket.off('generation:completed');
          socket.off('generation:failed');
        }
      } catch {
        // ignore cleanup errors
      }
    };
  }, [id, fetchAssignment]);

  // Polling fallback if socket doesn't update
  useEffect(() => {
    if (status !== 'generating') return;

    const interval = setInterval(() => {
      fetchAssignment();
    }, 5000);

    return () => clearInterval(interval);
  }, [status, fetchAssignment]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      toast.loading('Regenerating assessment...', { id: 'regenerate' });
      await regenerateAssignment(id);
      setStatus('generating');
      setGenerationText('Regenerating your assessment...');
      setProgress(10);
      setPaper(null);
      toast.success('Regeneration started!', { id: 'regenerate' });
    } catch (err) {
      console.error('Regeneration failed:', err);
      toast.error('Failed to regenerate. Please try again.', { id: 'regenerate' });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="generation-container">
        <div className="generation-brain">
          <Brain size={36} color="white" />
        </div>
        <div className="loader-dots">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
        <h2 className="generation-title">Loading Assessment</h2>
        <p className="generation-status">Please wait while we fetch your assessment...</p>
      </div>
    );
  }

  // Generating state
  if (status === 'generating') {
    return (
      <div className="generation-container">
        <div className="generation-brain">
          <Brain size={36} color="white" />
        </div>
        <h2 className="generation-title">Generating Your Assessment</h2>
        <p className="generation-status">{generationText}</p>
        <div className="generation-progress-bar">
          <div
            className="generation-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted">
          This may take 15-30 seconds depending on complexity
        </p>
        <div className="loader-dots" style={{ marginTop: 8 }}>
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
      </div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className="generation-container">
        <div
          className="generation-brain"
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
          }}
        >
          <AlertCircle size={36} color="white" />
        </div>
        <h2 className="generation-title">Generation Failed</h2>
        <p className="generation-status">{error || 'Something went wrong while generating the assessment.'}</p>
        <div className="flex gap-12">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRegenerate}
            loading={isRegenerating}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="ghost" size="lg" icon={<ArrowLeft size={18} />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Completed state — show the paper
  if (status === 'completed' && paper) {
    return (
      <div className="animate-fadeIn" style={{ paddingBottom: 100 }}>
        <div className="flex items-center justify-between mb-24">
          <Link href="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <QuestionPaper paper={paper} />
        <ActionBar
          onRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
          paperTitle={paper.title || assignment?.title}
        />
      </div>
    );
  }

  return null;
}
