'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/create': 'Create Assessment',
};

export default function Header() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith('/assessment/')) return 'Assessment';
    return pageTitles[pathname] || 'VedaAI';
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{getTitle()}</h1>
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search className="header-search-icon" />
          <input type="text" placeholder="Search assessments..." />
        </div>

        <button className="header-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="header-notification-dot" />
        </button>

        <div className="header-avatar" title="Profile">
          V
        </div>
      </div>
    </header>
  );
}
