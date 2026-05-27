import type { Metadata } from 'next';
import '@/styles/globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ToastProvider from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Create professional AI-powered assessments, question papers, and exams in seconds with VedaAI.',
  keywords: ['AI', 'Assessment', 'Question Paper', 'Exam Creator', 'VedaAI', 'Education'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Header />
            <div className="page-content">
              {children}
            </div>
          </div>
        </div>
        <ToastProvider />
      </body>
    </html>
  );
}
