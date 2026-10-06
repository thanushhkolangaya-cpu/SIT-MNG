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
  Building2,
  School,
  Trash2,
  CalendarCheck2,
  Layers,
  Settings,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StudySession, WeeklyStudyAvailability, ClassPeriod } from '../types';
import { SetTimetableModal } from './SetTimetableModal';

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
    deleteSession,
    classTimetable,
  } = useStudy();

  const [scheduleType, setScheduleType] = useState<'study' | 'college'>('study');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [isSetTimetableOpen, setIsSetTimetableOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'class' | 'add-session' | 'study-hours'>('class');
  const [modalTargetDate, setModalTargetDate] = useState<string | undefined>(undefined);

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

  const handleOpenSetTimetable = (tab: 'class' | 'add-session' | 'study-hours', date?: string) => {
    setModalInitialTab(tab);
    setModalTargetDate(date || activeDay.dateStr);
    setIsSetTimetableOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Scheduling Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <span>Timetable & Schedule Planner</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              SIT Mangalore
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your College Class Timetable and AI-balanced self-study schedules
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PRIMARY: SET TIMETABLE OPTION */}
          <button
            onClick={() => handleOpenSetTimetable('class')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer border border-blue-400/30"
            title="Configure College Class Timetable or Add Study Slots"
          >
            <CalendarCheck2 className="w-4 h-4 text-amber-300" />
            <span>Set Timetable</span>
          </button>

          {/* Quick Add Session Button */}
          <button
            onClick={() => handleOpenSetTimetable('add-session')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Add a custom study session to any date"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Session</span>
          </button>

          {/* Set Daily Study Hours */}
          <button
            onClick={() => handleOpenSetTimetable('study-hours')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            title="Adjust daily self-study hours"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span>Study Hours</span>
          </button>

          {/* Auto-Revise */}
          <button
            onClick={triggerAutoRevise}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Auto-redistribute missed topics into upcoming days"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Auto-Revise</span>
          </button>

          {/* Regenerate Schedule */}
          <button
            onClick={regenerateSchedule}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Regenerate full 7-day schedule with prioritization"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Re-balance</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher: Self-Study vs College Routine */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setScheduleType('study')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scheduleType === 'study'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Self-Study Schedule</span>
            </button>

            <button
              onClick={() => setScheduleType('college')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                scheduleType === 'college'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>SIT College Class Routine</span>
            </button>
          </div>

          {scheduleType === 'study' ? (
            /* Day View vs Week Grid Switcher */
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'week' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Week Grid
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'day' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Day In-Depth
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleOpenSetTimetable('class')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Class Routine Periods</span>
            </button>
          )}
        </div>

        {/* Day Selector Tabs for Self-Study view */}
        {scheduleType === 'study' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
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

            <div className="flex items-center gap-3 text-xs text-slate-500 pr-2">
              <span className="font-semibold text-slate-800">
                {activeDay.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                Available: {availability[activeDay.dayFullName]}h
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE TYPE 1: COLLEGE CLASS ROUTINE */}
      {scheduleType === 'college' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Srinivas Institute of Technology — Class Timetable (Weekly Routine)
                </h3>
                <p className="text-xs text-slate-500">
                  Valachil Campus • Department of Computer Science & Engineering (Semester 5)
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenSetTimetable('class')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Set / Customize Routine</span>
            </button>
          </div>

          {/* Timetable Weekly Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                  <th className="p-3 w-28">Day</th>
                  <th className="p-3">P1 (9:00-9:55)</th>
                  <th className="p-3">P2 (10:00-10:55)</th>
                  <th className="p-3">P3 (11:15-12:10)</th>
                  <th className="p-3">P4 (12:10-1:05)</th>
                  <th className="p-3">P5 (2:00-2:55)</th>
                  <th className="p-3">P6 (3:00-3:55)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {classTimetable.map((dayRow) => (
                  <tr key={dayRow.day} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>{dayRow.day}</span>
                      </div>
                    </td>

                    {dayRow.periods.map((p) => {
                      const sub = subjects.find((s) => s.id === p.subjectId);
                      const isLab = p.isLab;
                      const isFree = p.subjectId === 'free';

                      return (
                        <td key={p.periodNumber} className="p-2.5 align-top">
                          <div
                            className={`p-2 rounded-xl border text-xs transition-all ${
                              isLab
                                ? 'bg-amber-50/80 border-amber-300'
                                : isFree
                                ? 'bg-slate-50 border-slate-200 text-slate-400'
                                : 'bg-blue-50/60 border-blue-200/80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded text-white font-mono ${
                                  isLab ? 'bg-amber-600' : 'bg-blue-600'
                                }`}
                              >
                                {p.subjectCode}
                              </span>
                              {p.room && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {p.room}
                                </span>
                              )}
                            </div>

                            <p className="font-bold text-[11px] text-slate-800 line-clamp-2 leading-tight">
                              {p.subjectName}
                            </p>

                            {p.faculty && (
                              <p className="text-[10px] text-slate-500 mt-1 truncate">
                                👨‍🏫 {p.faculty}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Theory Lectures
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-600"></span> Lab & Practical Batches
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-400"></span> Library / Tutorial
              </span>
            </div>
            <span>Tea Break: 10:55-11:15 AM • Lunch Break: 1:05-2:00 PM</span>
          </div>
        </div>
      )}

      {/* SCHEDULE TYPE 2: SELF-STUDY PLANNER */}
      {scheduleType === 'study' && (
        <>
          {viewMode === 'day' ? (
            /* Single Day In-Depth View */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Study Schedule for {activeDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>

                <button
                  onClick={() => handleOpenSetTimetable('add-session', activeDay.dateStr)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Session on {activeDay.dayName}</span>
                </button>
              </div>

              {sessions.filter((s) => s.date === activeDay.dateStr).length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No study sessions scheduled for this day.</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={() => handleOpenSetTimetable('add-session', activeDay.dateStr)}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      + Add Study Session
                    </button>
                    <button
                      onClick={regenerateSchedule}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
                    >
                      Auto-Generate Plan
                    </button>
                  </div>
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
                        onDelete={deleteSession}
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

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenSetTimetable('add-session', w.dateStr)}
                            className="w-5 h-5 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-500 flex items-center justify-center transition-colors"
                            title={`Add session on ${w.dayName}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-mono text-slate-400">
                            {availability[w.dayFullName]}h
                          </span>
                        </div>
                      </div>

                      {daySessions.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic space-y-2">
                          <p>Free day / Rest</p>
                          <button
                            onClick={() => handleOpenSetTimetable('add-session', w.dateStr)}
                            className="text-[10px] font-semibold text-blue-600 hover:underline inline-block"
                          >
                            + Add Session
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {daySessions.map((session) => {
                            const sub = subjects.find((s) => s.id === session.subjectId);
                            const isDone = session.status === 'completed';

                            return (
                              <div
                                key={session.id}
                                className={`p-2.5 rounded-xl border text-xs transition-all relative group ${
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
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => markSessionCompleted(session.id)}
                                        className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                                      >
                                        Done
                                      </button>
                                      <button
                                        onClick={() => deleteSession(session.id)}
                                        className="text-[10px] text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                                        title="Delete session"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {daySessions.reduce((acc, s) => acc + s.durationHours, 0).toFixed(1)}h planned
                      </span>
                      <button
                        onClick={() => handleOpenSetTimetable('add-session', w.dateStr)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                        title="Add session to this day"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Set Timetable Modal */}
      <SetTimetableModal
        isOpen={isSetTimetableOpen}
        onClose={() => setIsSetTimetableOpen(false)}
        initialTab={modalInitialTab}
        selectedDate={modalTargetDate}
      />
    </div>
  );
};

interface SessionCardProps {
  session: StudySession;
  subjects: any[];
  onComplete: (id: string) => void;
  onMissed: (id: string) => void;
  onReschedule: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  subjects,
  onComplete,
  onMissed,
  onReschedule,
  onDelete,
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
              <button
                onClick={() => onDelete(session.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
