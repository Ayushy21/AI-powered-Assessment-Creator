'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, Brain, Award, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import { getAssignments, Assignment } from '@/lib/api';

export default function DashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await getAssignments();
        const data = response.data || response;
        if (Array.isArray(data)) {
          setAssignments(data);
        } else if (Array.isArray((data as unknown as { assignments: Assignment[] }).assignments)) {
          setAssignments((data as unknown as { assignments: Assignment[] }).assignments);
        }
      } catch (err) {
        console.error('Failed to fetch assessments:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const totalQuestions = assignments.reduce((sum, a) => {
    if (a.generatedPaper?.sections) {
      return sum + a.generatedPaper.sections.reduce((s, sec) => s + sec.questions.length, 0);
    }
    return sum + (a.numberOfQuestions || 0);
  }, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success badge-status">Completed</span>;
      case 'generating':
        return <span className="badge badge-accent badge-status">Generating</span>;
      case 'failed':
        return <span className="badge badge-hard badge-status">Failed</span>;
      default:
        return <span className="badge badge-medium badge-status">Pending</span>;
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-icon">
          <Sparkles size={48} color="#a855f7" />
        </div>
        <h1 className="dashboard-hero-title">Welcome to VedaAI</h1>
        <p className="dashboard-hero-subtitle">
          AI-Powered Assessment Creator — Generate professional question papers in seconds
        </p>
        <Link href="/create">
          <Button variant="primary" size="xl" icon={<PlusCircle size={22} />}>
            Create New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-icon stat-card-icon-purple">
            <FileText size={22} />
          </div>
          <div className="stat-card-value">{assignments.length}</div>
          <div className="stat-card-label">Total Assessments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon stat-card-icon-green">
            <Brain size={22} />
          </div>
          <div className="stat-card-value">{totalQuestions}</div>
          <div className="stat-card-label">Questions Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon stat-card-icon-amber">
            <Award size={22} />
          </div>
          <div className="stat-card-value">{completedCount}</div>
          <div className="stat-card-label">Completed Papers</div>
        </div>
      </div>

      {/* Recent Assessments */}
      <h2 className="dashboard-section-title">
        <Calendar size={22} />
        Recent Assessments
      </h2>

      {isLoading ? (
        <div className="assessments-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : assignments.length > 0 ? (
        <div className="assessments-grid">
          {assignments.slice(0, 9).map((assignment) => (
            <Link href={`/assessment/${assignment._id}`} key={assignment._id}>
              <div className="assessment-card">
                <div className="assessment-card-header">
                  <div>
                    <h3 className="assessment-card-title">{assignment.title}</h3>
                    <p className="assessment-card-subject">{assignment.subject}</p>
                  </div>
                  {getStatusBadge(assignment.status)}
                </div>
                <div className="assessment-card-meta">
                  <div className="assessment-card-meta-item">
                    <FileText size={14} />
                    <span>{assignment.numberOfQuestions} questions</span>
                  </div>
                  <div className="assessment-card-meta-item">
                    <Award size={14} />
                    <span>{assignment.totalMarks} marks</span>
                  </div>
                  <div className="assessment-card-meta-item">
                    <Calendar size={14} />
                    <span>
                      {assignment.createdAt
                        ? format(new Date(assignment.createdAt), 'MMM d, yyyy')
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">No assessments yet</h3>
          <p className="empty-state-text">
            Create your first AI-powered assessment to get started!
          </p>
          <Link href="/create">
            <Button variant="primary" size="lg" icon={<PlusCircle size={18} />}>
              Create Assessment
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
