import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface StudyAlertToasterProps {
  onNavigateTab: (tab: string) => void;
}

interface AlertItem {
  id: string;
  type: 'exam' | 'assignment' | 'goal' | 'streak';
  title: string;
  message: string;
  urgency: 'high' | 'medium' | 'info';
  timestamp: string;
  actionTab?: string;
  actionLabel?: string;
}

export const StudyAlertToaster: React.FC<StudyAlertToasterProps> = ({ onNavigateTab }) => {
  const { exams, assignments, sessions, user, overallStats } = useStudy();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('sit_dismissed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Play a soft reminder chime via Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio not permitted or supported
    }
  };

  useEffect(() => {
    const newAlerts: AlertItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check upcoming exams
    exams.forEach((exam) => {
      const examDate = new Date(exam.date);
      const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
        newAlerts.push({
          id: `exam-${exam.id}-${exam.date}`,
          type: 'exam',
          title: diffDays === 0 ? `🚨 Exam TODAY: ${exam.title}` : `📅 Exam in ${diffDays} Day${diffDays > 1 ? 's' : ''}`,
          message: `${exam.title} (${exam.syllabusPortion}) - Weightage: ${exam.weightageMarks} Marks`,
          urgency: diffDays <= 2 ? 'high' : 'medium',
          timestamp: 'Upcoming',
          actionTab: 'exams',
          actionLabel: 'View Exam Syllabus',
        });
      }
    });

    // 2. Check assignments
    assignments
      .filter((a) => a.status === 'pending')
      .forEach((asg) => {
        const dueDate = new Date(asg.deadline);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
          newAlerts.push({
            id: `asg-${asg.id}-${asg.deadline}`,
            type: 'assignment',
            title: diffDays === 0 ? `⏰ Assignment Due Today!` : `📝 Assignment Due in ${diffDays}d`,
            message: `${asg.title} (${asg.submissionType})`,
            urgency: diffDays <= 1 ? 'high' : 'medium',
            timestamp: 'Due soon',
            actionTab: 'exams',
            actionLabel: 'Check Deadlines',
          });
        }
      });

    // 3. Daily Study Goal Tracker
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.date === todayStr);
    const plannedHours = todaySessions.reduce((acc, s) => acc + s.durationHours, 0);
    const completedHours = todaySessions
      .filter((s) => s.status === 'completed')
      .reduce((acc, s) => acc + s.durationHours, 0);

    if (plannedHours > 0 && completedHours < plannedHours) {
      const remaining = (plannedHours - completedHours).toFixed(1);
      newAlerts.push({
        id: `goal-today-${todayStr}`,
        type: 'goal',
        title: `🎯 Daily Study Goal Reminder`,
        message: `${completedHours.toFixed(1)}h done of ${plannedHours.toFixed(1)}h planned. ${remaining}h remaining today!`,
        urgency: 'info',
        timestamp: 'Today',
        actionTab: 'timetable',
        actionLabel: 'View Timetable',
      });
    }

    // 4. Streak Alert
    if (user && user.streakDays > 0) {
      newAlerts.push({
        id: `streak-${user.streakDays}`,
        type: 'streak',
        title: `🔥 ${user.streakDays}-Day Study Streak Active!`,
        message: `Complete today's revision session to keep your streak burning bright.`,
        urgency: 'info',
        timestamp: 'Active',
        actionTab: 'dashboard',
        actionLabel: 'Log Session',
      });
    }

    setAlerts(newAlerts);
  }, [exams, assignments, sessions, user]);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem('sit_dismissed_alerts', JSON.stringify(updated));
    } catch {}
  };

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <aside aria-label="Study Deadlines and Goals Alert Center" className="fixed bottom-4 right-4 z-50 max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {/* Toggle / Header Bar if collapsed */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 hover:text-blue-300 transition-colors text-left"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {activeAlerts.length} Study Alert{activeAlerts.length > 1 ? 's' : ''} & Deadlines
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playChime();
              }}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              title={soundEnabled ? 'Disable Alert Chime' : 'Enable Alert Chime'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              {isOpen ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Floating Toasts */}
        {isOpen && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {activeAlerts.map((alert) => {
              const isHigh = alert.urgency === 'high';
              const isMedium = alert.urgency === 'medium';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 duration-200 ${
                    isHigh
                      ? 'bg-rose-50/95 border-rose-300 text-slate-900 shadow-rose-500/10'
                      : isMedium
                      ? 'bg-amber-50/95 border-amber-300 text-slate-900 shadow-amber-500/10'
                      : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {alert.type === 'exam' && <Calendar className="w-4 h-4 text-purple-600 shrink-0" />}
                      {alert.type === 'assignment' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                      {alert.type === 'goal' && <Clock className="w-4 h-4 text-blue-600 shrink-0" />}
                      {alert.type === 'streak' && <Flame className="w-4 h-4 text-orange-500 shrink-0" />}
                      <span className="text-xs font-bold">{alert.title}</span>
                    </div>

                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                      title="Dismiss reminder"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed pl-5.5">
                    {alert.message}
                  </p>

                  {alert.actionTab && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex justify-end">
                      <button
                        onClick={() => onNavigateTab(alert.actionTab!)}
                        className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                          isHigh
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : isMedium
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <span>{alert.actionLabel || 'View Details'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
