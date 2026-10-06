import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Target,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileCheck,
  RotateCcw,
  Zap,
  TrendingUp,
  Brain,
  Timer,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenPomodoro: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenPomodoro }) => {
  const {
    user,
    subjects,
    exams,
    assignments,
    sessions,
    overallStats,
    advisories,
    predictions,
    markSessionCompleted,
    markSessionMissed,
    rescheduleSession,
    triggerAutoRevise,
    toggleAssignmentStatus,
  } = useStudy();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's sessions
  const todaySessions = sessions.filter((s) => s.date === todayStr);

  // Filter upcoming exams sorted by date
  const upcomingExams = [...exams]
    .map((e) => {
      const examDate = new Date(e.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...e, diffDays };
    })
    .filter((e) => e.diffDays >= 0)
    .sort((a, b) => a.diffDays - b.diffDays);

  // Filter pending assignments
  const pendingAssignments = [...assignments]
    .filter((a) => a.status === 'pending')
    .map((a) => {
      const due = new Date(a.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...a, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-400/30">
                Srinivas Institute of Technology • Mangalore
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {user?.streakDays || 1}-Day Study Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}! 🎓
            </h1>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              Targeting <strong className="text-white font-semibold">{user?.targetCgpa || '8.5'} CGPA</strong> in Semester {user?.semester || 5} ({user?.department || 'Engineering'}).
              {upcomingExams.length > 0 && (
                <span>
                  {' '}Next exam is <span className="text-amber-300 font-bold underline underline-offset-4">{upcomingExams[0].title}</span> in{' '}
                  <span className="text-amber-300 font-bold">{upcomingExams[0].diffDays} days</span>.
                </span>
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={onOpenPomodoro}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Timer className="w-4 h-4" />
              <span>Start 25m Focus Session</span>
            </button>
            <button
              onClick={() => onNavigateTab('ai-coach')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Ask AI Study Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Syllabus Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Syllabus Covered</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{overallStats.overallProgressPct}%</span>
            <span className="text-xs text-slate-500 font-medium">
              ({overallStats.completedTopics}/{overallStats.totalTopics} topics)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallStats.overallProgressPct}%` }}
            />
          </div>
        </div>

        {/* Study Hours Logged */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hours Logged</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{overallStats.totalCompletedHours.toFixed(1)}h</span>
            <span className="text-xs text-slate-500 font-medium">
              of {overallStats.totalPlannedHours}h total
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (overallStats.totalCompletedHours / Math.max(1, overallStats.totalPlannedHours)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Upcoming Exams Countdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Exams</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{upcomingExams.length}</span>
            <span className="text-xs font-medium text-purple-600">
              {upcomingExams[0] ? `${upcomingExams[0].diffDays}d to next IA` : 'No exams'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            {upcomingExams[0]?.title || 'All exams completed'}
          </p>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assignments Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{overallStats.pendingAssignmentsCount}</span>
            <span className="text-xs text-amber-600 font-medium">
              {pendingAssignments[0] ? `Due in ${pendingAssignments[0].diffDays}d` : 'None pending'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            {pendingAssignments[0]?.title || 'All submissions up to date'}
          </p>
        </div>
      </div>

      {/* Weak Subjects Advisory Alert Banner (Bonus Feature) */}
      {advisories.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">
                  Smart Advisory: Additional Study Time Suggested
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800">
                  {advisories.length} Subject{advisories.length > 1 ? 's' : ''} Lagging
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {advisories[0].reason} We recommend allocating an extra{' '}
                <strong>+{advisories[0].suggestedExtraHours} hours/day</strong> on{' '}
                {advisories[0].recommendedDays.join(', ')}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={triggerAutoRevise}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Auto-Revise Schedule</span>
            </button>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              View Analytics
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Today's Mission & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Study Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Today's Study Mission</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} • Planned based on SIT syllabus
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerAutoRevise}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Automatically rebalance schedule if you fall behind"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Auto-Revise</span>
                </button>
                <button
                  onClick={() => onNavigateTab('timetable')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Full Timetable</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sessions List */}
            {todaySessions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">
                  No pending sessions scheduled for today!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You can generate upcoming sessions or pick topics from your subjects syllabus.
                </p>
                <button
                  onClick={() => onNavigateTab('timetable')}
                  className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-blue-700 transition-colors"
                >
                  Plan Next Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.map((session) => {
                  const subject = subjects.find((s) => s.id === session.subjectId);
                  const isCompleted = session.status === 'completed';
                  const isMissed = session.status === 'missed';

                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/60 border-emerald-200 opacity-90'
                          : isMissed
                          ? 'bg-rose-50/60 border-rose-200'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Subject Color Pill */}
                          <div
                            className="w-3 h-10 rounded-full shrink-0"
                            style={{ backgroundColor: subject?.color || '#2563eb' }}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded text-white"
                                style={{ backgroundColor: subject?.color || '#2563eb' }}
                              >
                                {subject?.code || 'SIT'}
                              </span>
                              <span className="text-xs font-semibold text-slate-600">
                                {subject?.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  session.priority === 'Urgent'
                                    ? 'bg-rose-100 text-rose-700'
                                    : session.priority === 'High'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {session.priority} Priority
                              </span>
                            </div>

                            <h3 className={`text-sm font-bold mt-1 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {session.topicName}
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {session.timeSlot || 'Flexible Slot'}
                              </span>
                              <span>•</span>
                              <span>{session.durationHours} hrs duration</span>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">{session.type}</span>
                            </div>

                            {session.notes && (
                              <p className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded mt-2 border border-slate-100">
                                💡 {session.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => markSessionCompleted(session.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Done</span>
                              </button>
                              <button
                                onClick={() => {
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  rescheduleSession(session.id, tomorrow.toISOString().split('T')[0]);
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                title="Reschedule to tomorrow"
                              >
                                Push +1d
                              </button>
                              <button
                                onClick={() => markSessionMissed(session.id)}
                                className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                title="Mark as missed to trigger auto-rebalance"
                              >
                                Missed
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subject Progress Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>SIT Subject Syllabus Tracker</span>
                </h2>
                <p className="text-xs text-slate-500">
                  5th Semester CSE Curriculum & Topic Completion Rates
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('subjects')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Manage Subjects</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {subjects.map((sub) => {
                const total = sub.topics.length;
                const completed = sub.topics.filter((t) => t.status === 'completed').length;
                const inProgress = sub.topics.filter((t) => t.status === 'in_progress').length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const pred = predictions.find((p) => p.subjectId === sub.id);

                return (
                  <div key={sub.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="font-bold text-sm text-slate-900">{sub.name}</span>
                        <span className="text-xs font-mono text-slate-500 font-medium">({sub.code})</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {sub.credits} Credits
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          {completed}/{total} Topics
                        </span>
                        <span className="text-sm font-bold text-slate-900">{pct}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>

                    {/* Prediction summary */}
                    {pred && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>
                          {inProgress > 0 ? `${inProgress} topic in progress • ` : ''}
                          Est. Completion: <strong className="text-slate-700">{pred.projectedCompletionDate}</strong>
                        </span>
                        <span
                          className={`font-semibold ${
                            pred.status === 'safe'
                              ? 'text-emerald-600'
                              : pred.status === 'tight'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {pred.status === 'safe'
                            ? '✓ On Pace'
                            : pred.status === 'tight'
                            ? '⚠ Tight Margin'
                            : '⚡ Exam Lag Warning'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Upcoming Exams & Deadlines */}
        <div className="space-y-6">
          {/* Upcoming Examinations Countdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Internal & VTU Exams</span>
              </h2>
              <button
                onClick={() => onNavigateTab('exams')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                All Exams
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.slice(0, 4).map((exam) => {
                const sub = subjects.find((s) => s.id === exam.subjectId);
                const isUrgent = exam.diffDays <= 4;
                const isSoon = exam.diffDays <= 8;

                return (
                  <div
                    key={exam.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isUrgent
                        ? 'bg-rose-50/70 border-rose-200'
                        : isSoon
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {sub?.code || 'SIT Exam'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">
                          {exam.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {sub?.name}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-extrabold ${
                            isUrgent
                              ? 'bg-rose-600 text-white animate-pulse'
                              : isSoon
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {exam.diffDays === 0 ? 'TODAY!' : `${exam.diffDays}d left`}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {exam.date}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-200/60 pt-1.5 flex justify-between items-center">
                      <span className="truncate max-w-[180px]">{exam.syllabusPortion}</span>
                      <span className="font-semibold text-slate-700">{exam.weightageMarks} Marks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Assignments & Deadlines */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Assignment Deadlines</span>
              </h2>
              <button
                onClick={() => onNavigateTab('exams')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {pendingAssignments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No assignments due. Good job!
                </p>
              ) : (
                pendingAssignments.slice(0, 3).map((asg) => {
                  const sub = subjects.find((s) => s.id === asg.subjectId);
                  const isUrgent = asg.diffDays <= 3;

                  return (
                    <div
                      key={asg.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={asg.status === 'submitted'}
                            onChange={() => toggleAssignmentStatus(asg.id)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              {asg.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {sub?.name} • {asg.submissionType}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-700 font-extrabold'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {asg.diffDays}d left
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick AI Advisor Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>SIT AI Academic Mentor</span>
            </div>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Have an upcoming test in Operating Systems or Automata? Get instant formula cheat-sheets, likely VTU exam questions, and study plans tailored for SIT.
            </p>
            <button
              onClick={() => onNavigateTab('ai-coach')}
              className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open AI Study Coach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
