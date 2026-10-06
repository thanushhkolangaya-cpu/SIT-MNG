import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  Building2,
  TrendingUp,
  Target,
  Flame,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface DailyWeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyWeeklySummaryModal: React.FC<DailyWeeklySummaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, subjects, studyLogs, sessions, overallStats, exams, assignments } = useStudy();
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Daily calculations
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayCompletedSessions = todaySessions.filter((s) => s.status === 'completed');
  const todayHoursLogged = studyLogs
    .filter((log) => log.date === todayStr)
    .reduce((sum, log) => sum + log.hours, 0);

  // Weekly calculations (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const weeklyLogs = studyLogs.filter((l) => last7Days.includes(l.date));
  const weeklyHoursTotal = weeklyLogs.reduce((sum, l) => sum + l.hours, 0);

  const upcomingExamsNext7Days = exams.filter((e) => {
    const d = new Date(e.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  const generateReportText = () => {
    if (tab === 'daily') {
      return `[SIT Mangalore Daily Study Summary - ${todayStr}]
Student: ${user?.name} (USN: ${user?.usn})
Department: ${user?.department} - Semester ${user?.semester}
Streak: ${user?.streakDays} days
Hours Logged Today: ${todayHoursLogged.toFixed(1)} hrs
Completed Sessions: ${todayCompletedSessions.length} / ${todaySessions.length}
Overall Syllabus Covered: ${overallStats.overallProgressPct}%
Upcoming Exams: ${upcomingExamsNext7Days.map((e) => `${e.title} (${e.date})`).join(', ') || 'None this week'}`;
    } else {
      return `[SIT Mangalore Weekly Progress Review]
Student: ${user?.name} (USN: ${user?.usn})
Total Weekly Hours Logged: ${weeklyHoursTotal.toFixed(1)} hrs
Overall Syllabus Progress: ${overallStats.overallProgressPct}% (${overallStats.completedTopics}/${overallStats.totalTopics} topics)
Active Streak: ${user?.streakDays} days
Campus: Srinivas Institute of Technology (SIT), Valachil, Mangalore`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                Srinivas Institute of Technology
              </span>
            </div>
            <h3 className="font-bold text-lg text-white mt-0.5">
              Academic Progress Briefing
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('daily')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tab === 'daily' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Daily Briefing
            </button>
            <button
              onClick={() => setTab('weekly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tab === 'weekly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Weekly Retrospective
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {tab === 'daily' ? (
            /* Daily Briefing */
            <div className="space-y-4">
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-blue-950">
                      Today's Study Log ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})
                    </h4>
                    <p className="text-xs text-blue-800 mt-0.5">
                      Student: {user?.name} • USN: <span className="font-mono">{user?.usn}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {user?.streakDays}d Streak
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-200/60 text-center">
                  <div>
                    <span className="text-[10px] text-blue-700 uppercase font-semibold">Hours Logged</span>
                    <p className="text-lg font-extrabold text-blue-950">{todayHoursLogged.toFixed(1)}h</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-700 uppercase font-semibold">Tasks Done</span>
                    <p className="text-lg font-extrabold text-blue-950">
                      {todayCompletedSessions.length} / {todaySessions.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-700 uppercase font-semibold">Syllabus Covered</span>
                    <p className="text-lg font-extrabold text-blue-950">{overallStats.overallProgressPct}%</p>
                  </div>
                </div>
              </div>

              {/* Today Sessions */}
              <div>
                <h5 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider">
                  Today's Session Breakdown
                </h5>
                {todaySessions.length === 0 ? (
                  <p className="text-slate-500 italic text-xs">No sessions planned for today.</p>
                ) : (
                  <div className="space-y-2">
                    {todaySessions.map((sess) => {
                      const sub = subjects.find((s) => s.id === sess.subjectId);
                      const isDone = sess.status === 'completed';
                      return (
                        <div
                          key={sess.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{sess.topicName}</span>
                            <span className="text-xs text-slate-500 block">
                              {sub?.code} • {sess.durationHours} hrs
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isDone ? 'Done ✓' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming alert */}
              {upcomingExamsNext7Days.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                  <strong>⚡ Exam Alert within 7 Days: </strong>
                  {upcomingExamsNext7Days.map((e) => `${e.title} (${e.date})`).join(', ')}
                </div>
              )}
            </div>
          ) : (
            /* Weekly Retrospective */
            <div className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-sm text-emerald-950">
                  Weekly Engineering Study Summary (Past 7 Days)
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Srinivas Institute of Technology Mangalore • {user?.department}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-200/60 text-center">
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold">Total Hours Logged</span>
                    <p className="text-lg font-extrabold text-emerald-950">{weeklyHoursTotal.toFixed(1)}h</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold">Topics Finished</span>
                    <p className="text-lg font-extrabold text-emerald-950">{overallStats.completedTopics}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold">Pending Tasks</span>
                    <p className="text-lg font-extrabold text-emerald-950">{overallStats.pendingAssignmentsCount}</p>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div>
                <h5 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wider">
                  Course Completion Progress
                </h5>
                <div className="space-y-2">
                  {subjects.map((sub) => {
                    const total = sub.topics.length;
                    const done = sub.topics.filter((t) => t.status === 'completed').length;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                    return (
                      <div key={sub.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-800">
                            {sub.name} ({sub.code})
                          </span>
                          <span className="font-mono text-slate-600">
                            {done}/{total} topics • {pct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: sub.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
