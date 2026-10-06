/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { TimetableCalendarView } from './components/TimetableCalendarView';
import { ExamsAssignmentsView } from './components/ExamsAssignmentsView';
import { AnalyticsChartsView } from './components/AnalyticsChartsView';
import { AiStudyCoachView } from './components/AiStudyCoachView';
import { AuthModal } from './components/AuthModal';
import { PomodoroTimerModal } from './components/PomodoroTimerModal';
import { DailyWeeklySummaryModal } from './components/DailyWeeklySummaryModal';
import { Building2, GraduationCap, Heart } from 'lucide-react';

function MainLayout() {
  const { user } = useStudy();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setActiveTab}
            onOpenPomodoro={() => setIsPomodoroOpen(true)}
          />
        )}
        {activeTab === 'subjects' && <SubjectsView />}
        {activeTab === 'timetable' && <TimetableCalendarView />}
        {activeTab === 'exams' && <ExamsAssignmentsView />}
        {activeTab === 'analytics' && <AnalyticsChartsView />}
        {activeTab === 'ai-coach' && <AiStudyCoachView />}
      </main>

      {/* Footer with SIT Mangalore Engineering Campus Information */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Srinivas Institute of Technology (SIT)</strong>, Valachil, Merlapadavu, Mangalore - 574143
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Autonomous & VTU Academic Study Tracker</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted for SIT Engineers <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <PomodoroTimerModal isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />
      <DailyWeeklySummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <MainLayout />
    </StudyProvider>
  );
}
