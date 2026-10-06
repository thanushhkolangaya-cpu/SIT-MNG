import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FileCheck2,
  BarChart3,
  Sparkles,
  Flame,
  Timer,
  LogOut,
  User,
  Clock,
  Building2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPomodoro: () => void;
  onOpenSummary: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPomodoro,
  onOpenSummary,
  onOpenAuth,
}) => {
  const { user, logout } = useStudy();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects & Topics', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'exams', label: 'Exams & Tasks', icon: FileCheck2 },
    { id: 'quizzes', label: 'Module Quizzes', icon: HelpCircle, badge: 'QUIZ' },
    { id: 'pdf-hub', label: 'Notes & Project PDFs', icon: FileText, badge: 'PDF' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-coach', label: 'AI Coach', icon: Sparkles, badge: 'AI' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top SIT Mangalore College Branding Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span className="font-semibold tracking-wide">
            SRINIVAS INSTITUTE OF TECHNOLOGY (SIT), MANGALORE
          </span>
          <span className="hidden sm:inline-block text-blue-300">
            • Valachil, Merlapadavu Campus • Academic Study & Exam Tracker
          </span>
        </div>
        <div className="flex items-center gap-3 text-blue-200 text-xs">
          {user && (
            <>
              <span className="hidden md:inline bg-blue-800/80 px-2 py-0.5 rounded text-blue-100 font-mono">
                USN: {user.usn}
              </span>
              <span className="hidden md:inline bg-indigo-800/80 px-2 py-0.5 rounded text-indigo-100">
                Sem {user.semester} • {user.department.split('&')[0]}
              </span>
              <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{user.streakDays}d Streak</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 leading-tight">StudyMate</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                  SIT Mangalore
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                Notes, Projects, Exams & Schedule Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools & User Profile */}
          <div className="flex items-center gap-2">
            {/* Summary Report Quick Trigger */}
            <button
              onClick={onOpenSummary}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Daily & Weekly Progress Summary"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Summary</span>
            </button>

            {/* Pomodoro Focus Timer Button */}
            <button
              onClick={onOpenPomodoro}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-xs"
              title="Open Pomodoro Study Timer"
            >
              <Timer className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Focus Timer</span>
            </button>

            {/* Sign Out / Exit button */}
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Sign out to return to the SIT Registration & Login Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            {/* User Profile / Login dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden md:block pr-1">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">{user.usn}</div>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="border-b border-slate-100 pb-2 mb-2">
                      <p className="font-bold text-sm text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{user.usn}</p>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">{user.department}</p>
                      <p className="text-[11px] text-slate-400">Srinivas Institute of Technology, Mangalore</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pb-2 mb-2 border-b border-slate-100">
                      <div className="flex justify-between">
                        <span>Target CGPA:</span>
                        <span className="font-semibold text-slate-900">{user.targetCgpa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Available Time:</span>
                        <span className="font-semibold text-slate-900">{user.dailyAvailableHours} hrs/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Study Streak:</span>
                        <span className="font-semibold text-amber-600">{user.streakDays} days 🔥</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onOpenAuth();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Switch Account</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
