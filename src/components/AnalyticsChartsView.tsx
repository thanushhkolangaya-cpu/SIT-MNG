import React from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Target,
  Zap,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const AnalyticsChartsView: React.FC = () => {
  const {
    subjects,
    predictions,
    advisories,
    studyLogs,
    availability,
    user,
    triggerAutoRevise,
  } = useStudy();

  // Compute last 7 days study hours for the bar chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayFullName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof availability;
    const hoursLogged = studyLogs
      .filter((log) => log.date === dateStr)
      .reduce((sum, log) => sum + log.hours, 0);
    const targetHours = availability[dayFullName] || 3.0;

    return {
      dateStr,
      dayName,
      hoursLogged,
      targetHours,
    };
  });

  const maxDailyHours = Math.max(6, ...last7Days.map((d) => Math.max(d.hoursLogged, d.targetHours)));

  // Difficulty breakdown
  const allTopics = subjects.flatMap((s) => s.topics);
  const easyCount = allTopics.filter((t) => t.difficulty === 'Easy').length;
  const mediumCount = allTopics.filter((t) => t.difficulty === 'Medium').length;
  const hardCount = allTopics.filter((t) => t.difficulty === 'Hard').length;
  const totalTopicsCount = allTopics.length || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Progress Analytics & Predictions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Performance velocity tracking, exam readiness projections, and smart advisory
          </p>
        </div>

        <button
          onClick={triggerAutoRevise}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Apply Advisory & Revise Schedule</span>
        </button>
      </div>

      {/* Grid: Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Subject Syllabus Completion */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Subject Syllabus Coverage (%)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Completed vs Target Score for SIT Semester Exams
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {subjects.map((sub) => {
              const total = sub.topics.length;
              const completed = sub.topics.filter((t) => t.status === 'completed').length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                      {sub.name} ({sub.code})
                    </span>
                    <span className="font-mono text-slate-600">
                      {completed}/{total} topics • <strong className="text-slate-900">{pct}%</strong> (Target: {sub.targetScore}%)
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    {/* Target marker line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                      style={{ left: `${sub.targetScore}%` }}
                      title={`Target: ${sub.targetScore}%`}
                    />
                    {/* Actual progress bar */}
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-4 text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Actual Completion
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-3 bg-slate-900 rounded-xs" /> Target Benchmark
            </span>
          </div>
        </div>

        {/* Chart 2: Daily Study Hours (Last 7 Days) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Daily Study Hours: Actual vs Target</span>
              </h3>
              <p className="text-xs text-slate-500">
                Consistency over the past 7 days against your SIT study budget
              </p>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
            {last7Days.map((item, idx) => {
              const actualHeightPct = (item.hoursLogged / maxDailyHours) * 100;
              const targetHeightPct = (item.targetHours / maxDailyHours) * 100;
              const isToday = idx === 6;

              return (
                <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Target Bar (Ghost) */}
                    <div
                      className="w-3 bg-slate-200 rounded-t-xs transition-all"
                      style={{ height: `${Math.max(4, targetHeightPct)}%` }}
                      title={`Target: ${item.targetHours}h`}
                    />
                    {/* Actual Bar */}
                    <div
                      className={`w-3.5 rounded-t-xs transition-all ${
                        item.hoursLogged >= item.targetHours
                          ? 'bg-emerald-500'
                          : item.hoursLogged > 0
                          ? 'bg-blue-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ height: `${Math.max(4, actualHeightPct)}%` }}
                      title={`Logged: ${item.hoursLogged}h`}
                    />
                  </div>

                  <span className={`text-[10px] font-bold ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                    {item.dayName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono -mt-1">
                    {item.hoursLogged}h
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> Target Met (≥ Target)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" /> Logged Study Hours
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-slate-200 rounded-xs" /> Target Goal
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Predictive Syllabus Completion Engine (Bonus Feature) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Predictive Pace & Exam Readiness Projections</span>
            </h3>
            <p className="text-xs text-slate-500">
              Calculates whether your current velocity will complete 100% of the syllabus in time for SIT Internal Assessments
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="pb-3">Subject</th>
                <th className="pb-3">Remaining Hours</th>
                <th className="pb-3">Allocated Pace</th>
                <th className="pb-3">Projected Finish</th>
                <th className="pb-3">Upcoming Exam</th>
                <th className="pb-3">Readiness Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {predictions.map((p) => {
                const isSafe = p.status === 'safe';
                const isTight = p.status === 'tight';

                return (
                  <tr key={p.subjectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">{p.subjectName}</td>
                    <td className="py-3 font-mono text-slate-700">{p.remainingHours} hrs</td>
                    <td className="py-3 font-mono text-slate-700">{p.currentVelocityHoursPerDay}h / day</td>
                    <td className="py-3 font-bold text-slate-800">{p.projectedCompletionDate}</td>
                    <td className="py-3">
                      {p.nearestExamTitle ? (
                        <div>
                          <span className="font-semibold text-slate-800">{p.nearestExamTitle}</span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            in {p.daysUntilExam} days ({p.nearestExamDate})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None scheduled</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isSafe
                            ? 'bg-emerald-100 text-emerald-800'
                            : isTight
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isSafe ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Safe Buffer</span>
                          </>
                        ) : isTight ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Tight Margin</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Lag Alert</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Weak Subject Advisories & Recommendations */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center gap-2 mb-3 text-amber-950 font-bold text-base">
          <Zap className="w-5 h-5 text-amber-600" />
          <span>Automated Weak Subject Advisories & Rebalancing</span>
        </div>
        <p className="text-xs text-amber-900 mb-4 max-w-3xl leading-relaxed">
          The smart scheduler monitors subject difficulty, IA exam dates, and incomplete modules to recommend targeted hours and study techniques.
        </p>

        {advisories.length === 0 ? (
          <div className="bg-white/80 p-4 rounded-xl border border-amber-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All subjects are currently on pace! No critical deficits detected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisories.map((adv) => (
              <div
                key={adv.subjectId}
                className="bg-white rounded-xl p-4 border border-amber-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{adv.subjectName}</h4>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                    +{adv.suggestedExtraHours}h / day Boost
                  </span>
                </div>
                <p className="text-xs text-slate-600">{adv.reason}</p>
                <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60 text-xs text-amber-950">
                  <strong>Action Plan:</strong> {adv.actionablePlan}
                </div>
                <div className="text-[11px] text-slate-500">
                  Recommended Extra Days: <strong className="text-slate-800">{adv.recommendedDays.join(', ')}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
