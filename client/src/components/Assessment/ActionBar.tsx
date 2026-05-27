'use client';

import React, { useState } from 'react';
import { RefreshCw, Download, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ActionBarProps {
  onRegenerate: () => void;
  isRegenerating?: boolean;
  paperTitle?: string;
}

export default function ActionBar({ onRegenerate, isRegenerating = false, paperTitle }: ActionBarProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('question-paper');
      if (!element) {
        toast.error('Question paper not found');
        return;
      }

      // Dynamically import html2pdf.js
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${paperTitle || 'Assessment'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#111122',
          logging: false,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (html2pdf() as any).set(options).from(element).save();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="action-bar">
      <Button
        variant="secondary"
        size="md"
        onClick={onRegenerate}
        loading={isRegenerating}
        icon={<RefreshCw size={18} />}
      >
        Regenerate
      </Button>

      <Button
        variant="primary"
        size="md"
        onClick={handleDownloadPDF}
        loading={isDownloading}
        icon={<Download size={18} />}
      >
        Download PDF
      </Button>

      <Button
        variant="ghost"
        size="md"
        onClick={handleShare}
        icon={<Share2 size={18} />}
      >
        Share
      </Button>
    </div>
  );
}
