import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StudySession, WeeklyStudyAvailability } from '../types';

export const TimetableCalendarView: React.FC = () => {
  const {
    sessions,
    subjects,
    availability,
    updateAvailability,
    markSessionCompleted,
    markSessionMissed,
    rescheduleSession,
    regenerateSchedule,
    triggerAutoRevise,
  } = useStudy();

  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [isAvailabilityConfigOpen, setIsAvailabilityConfigOpen] = useState(false);

  // Temporary availability state for editor
  const [editAvailability, setEditAvailability] = useState<WeeklyStudyAvailability>({
    ...availability,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate dates for current 7 days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayFullName: d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklyStudyAvailability,
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  const activeDay = weekDays[selectedDayOffset] || weekDays[0];

  const handleSaveAvailability = () => {
    updateAvailability(editAvailability);
    setIsAvailabilityConfigOpen(false);
    regenerateSchedule();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Scheduling Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span>Study Timetable & Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Intelligent time allocations balanced around SIT exam deadlines and your available study hours
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAvailabilityConfigOpen(!isAvailabilityConfigOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span>Set Study Hours</span>
          </button>

          <button
            onClick={triggerAutoRevise}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Auto-redistribute missed topics into upcoming days"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Catch-Up / Auto-Revise</span>
          </button>

          <button
            onClick={regenerateSchedule}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Regenerate full 7-day schedule with prioritization"
          >
            <Sparkles className="w-4 h-4" />
            <span>Regenerate Schedule</span>
          </button>
        </div>
      </div>

      {/* Available Study Hours Configuration Accordion */}
      {isAvailabilityConfigOpen && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Configure Available Study Hours Per Day</span>
              </h3>
              <p className="text-xs text-slate-500">
                Specify how many hours you can devote to self-study after college classes at SIT Mangalore.
              </p>
            </div>
            <button
              onClick={() => setIsAvailabilityConfigOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
            {(
              [
                ['monday', 'Monday'],
                ['tuesday', 'Tuesday'],
                ['wednesday', 'Wednesday'],
                ['thursday', 'Thursday'],
                ['friday', 'Friday'],
                ['saturday', 'Saturday'],
                ['sunday', 'Sunday'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="block text-xs font-bold text-slate-700 mb-1">{label}</span>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="12"
                    value={editAvailability[key]}
                    onChange={(e) =>
                      setEditAvailability({
                        ...editAvailability,
                        [key]: Math.max(0.5, Number(e.target.value)),
                      })
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-sm bg-white border border-slate-300 rounded-lg"
                  />
                  <span className="text-xs text-slate-500">hrs</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsAvailabilityConfigOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAvailability}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Update Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle & Day Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {weekDays.map((w, idx) => {
              const isSelected = selectedDayOffset === idx;
              const isToday = idx === 0;
              const daySessions = sessions.filter((s) => s.date === w.dateStr);
              const completedCount = daySessions.filter((s) => s.status === 'completed').length;

              return (
                <button
                  key={w.dateStr}
                  onClick={() => setSelectedDayOffset(idx)}
                  className={`flex flex-col items-center px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {isToday ? 'Today' : w.dayName}
                  </span>
                  <span className="text-base font-extrabold">{w.dayNum}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    {completedCount}/{daySessions.length} done
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Week Grid
            </button>
          </div>
        </div>

        {/* Selected Day Header */}
        <div className="pt-3 px-2 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-800 text-sm">
            {activeDay.date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
            Available: {availability[activeDay.dayFullName]} hrs/day
          </span>
        </div>
      </div>

      {/* Main Timetable Content */}
      {viewMode === 'day' ? (
        /* Single Day In-Depth View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Study Schedule for {activeDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>

          {sessions.filter((s) => s.date === activeDay.dateStr).length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No sessions allocated for this day.</p>
              <button
                onClick={regenerateSchedule}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-blue-700"
              >
                Auto-Generate Study Plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .filter((s) => s.date === activeDay.dateStr)
                .map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    subjects={subjects}
                    onComplete={markSessionCompleted}
                    onMissed={markSessionMissed}
                    onReschedule={rescheduleSession}
                  />
                ))}
            </div>
          )}
        </div>
      ) : (
        /* 7-Day Week Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDays.map((w, idx) => {
            const daySessions = sessions.filter((s) => s.date === w.dateStr);
            const isToday = idx === 0;

            return (
              <div
                key={w.dateStr}
                className={`bg-white rounded-2xl border p-4 flex flex-col justify-between shadow-xs ${
                  isToday ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                    <div>
                      <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                        {w.dayName} {w.dayNum}
                      </span>
                      {isToday && (
                        <span className="block text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">
                          TODAY
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {availability[w.dayFullName]}h max
                    </span>
                  </div>

                  {daySessions.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      Free day / Rest
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {daySessions.map((session) => {
                        const sub = subjects.find((s) => s.id === session.subjectId);
                        const isDone = session.status === 'completed';

                        return (
                          <div
                            key={session.id}
                            className={`p-2.5 rounded-xl border text-xs transition-all ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200 opacity-80'
                                : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className="font-bold text-[10px] px-1.5 py-0.2 rounded text-white"
                                style={{ backgroundColor: sub?.color || '#2563eb' }}
                              >
                                {sub?.code || 'SIT'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {session.durationHours}h
                              </span>
                            </div>

                            <p className={`font-bold leading-tight ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {session.topicName}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/50">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {session.timeSlot?.split(' - ')[0] || ''}
                              </span>

                              {isDone ? (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Done
                                </span>
                              ) : (
                                <button
                                  onClick={() => markSessionCompleted(session.id)}
                                  className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {daySessions.reduce((acc, s) => acc + s.durationHours, 0).toFixed(1)}h planned
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface SessionCardProps {
  session: StudySession;
  subjects: any[];
  onComplete: (id: string) => void;
  onMissed: (id: string) => void;
  onReschedule: (id: string, date: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  subjects,
  onComplete,
  onMissed,
  onReschedule,
}) => {
  const subject = subjects.find((s) => s.id === session.subjectId);
  const isCompleted = session.status === 'completed';
  const isMissed = session.status === 'missed';

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200'
          : isMissed
          ? 'bg-rose-50/50 border-rose-200'
          : 'bg-white border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-3 h-10 rounded-full shrink-0"
            style={{ backgroundColor: subject?.color || '#2563eb' }}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded text-white font-mono"
                style={{ backgroundColor: subject?.color || '#2563eb' }}
              >
                {subject?.code}
              </span>
              <span className="text-xs font-semibold text-slate-600">{subject?.name}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  session.priority === 'Urgent'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {session.priority}
              </span>
            </div>

            <h4 className={`text-sm font-bold mt-1 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {session.topicName}
            </h4>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {session.timeSlot || 'Flexible'}
              </span>
              <span>•</span>
              <span>{session.durationHours} hrs duration</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">{session.type}</span>
            </div>

            {session.notes && (
              <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 px-2 py-1 rounded">
                💡 {session.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Finished</span>
            </span>
          ) : (
            <>
              <button
                onClick={() => onComplete(session.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </button>
              <button
                onClick={() => {
                  const d = new Date(session.date);
                  d.setDate(d.getDate() + 1);
                  onReschedule(session.id, d.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                title="Push session to next day"
              >
                Push +1d
              </button>
              <button
                onClick={() => onMissed(session.id)}
                className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Missed
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
