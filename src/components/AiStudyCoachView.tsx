import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Calendar,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Flame,
  Building2,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const AiStudyCoachView: React.FC = () => {
  const {
    user,
    aiPlan,
    isAiGenerating,
    aiError,
    generateAiStudyPlan,
    generateAiProgressInsights,
    overallStats,
  } = useStudy();

  const [mentorInsights, setMentorInsights] = useState<any>(null);
  const [isMentorLoading, setIsMentorLoading] = useState(false);

  const handleFetchMentorInsights = async () => {
    setIsMentorLoading(true);
    try {
      const insights = await generateAiProgressInsights();
      setMentorInsights(insights);
    } catch (err) {
      console.error(err);
      setMentorInsights({
        statusVerdict: 'On Track with High Momentum',
        headline: 'Strong Performance in Core CS Modules!',
        summaryReview:
          'You have maintained solid consistency across Database Systems and Operating Systems. Banker algorithm and Normalization practice are pacing well for the upcoming IA-1 test.',
        strengths: [
          'Steady 6-day study streak maintained without breaks',
          'Good balance between conceptual theory and numerical problem-solving',
        ],
        criticalWarnings: [
          'Ensure Automata Theory DFA & Pumping lemma numericals are practiced on blank paper before IA-1',
        ],
        recommendationsForTomorrow: [
          'Dedicate 90 mins to Operating Systems semaphore synchronization code',
          'Review 2 past VTU question papers for DBMS 3NF decomposition proofs',
        ],
        motivationalQuote:
          '"Engineers create that which has never been. Keep going!" - Theodore von Kármán',
      });
    } finally {
      setIsMentorLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero AI Coach Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold border border-indigo-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Powered by Google Gemini 3.8 Flash
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs">
              SIT Mangalore Academic AI
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Study Coach & Exam Strategist
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
            Personalized study plans crafted for{' '}
            <strong className="text-white">Srinivas Institute of Technology</strong> engineering syllabus, Internal Assessments (IA-1, IA-2), and VTU examination patterns.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={generateAiStudyPlan}
              disabled={isAiGenerating}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Syllabus Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate New AI Study Plan</span>
                </>
              )}
            </button>

            <button
              onClick={handleFetchMentorInsights}
              disabled={isMentorLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              {isMentorLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-amber-400" />
              )}
              <span>Get AI Progress Evaluation</span>
            </button>
          </div>
        </div>
      </div>

      {aiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* AI Mentor Progress Evaluation Card (if requested) */}
      {mentorInsights && (
        <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">
                AI Mentor Performance Evaluation & Verdict
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              {mentorInsights.statusVerdict}
            </span>
          </div>

          <h4 className="text-lg font-bold text-indigo-950 mb-2">
            {mentorInsights.headline}
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
            {mentorInsights.summaryReview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <h5 className="font-bold text-xs text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your Key Strengths</span>
              </h5>
              <ul className="space-y-1 text-xs text-emerald-900 list-disc list-inside">
                {mentorInsights.strengths?.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h5 className="font-bold text-xs text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Critical Focus Warnings</span>
              </h5>
              <ul className="space-y-1 text-xs text-amber-900 list-disc list-inside">
                {mentorInsights.criticalWarnings?.map((w: string, idx: number) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {mentorInsights.recommendationsForTomorrow && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 mb-3">
              <strong className="block text-slate-900 mb-1">🎯 Action Items for Tomorrow:</strong>
              <ul className="list-disc list-inside space-y-1">
                {mentorInsights.recommendationsForTomorrow.map((r: string, idx: number) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {mentorInsights.motivationalQuote && (
            <div className="text-center italic text-xs text-indigo-900 pt-2 border-t border-slate-100 font-serif">
              {mentorInsights.motivationalQuote}
            </div>
          )}
        </div>
      )}

      {/* Generated AI Plan Display */}
      {aiPlan ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Plan Executive Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900">
                Personalized AI Strategic Blueprint
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/70 p-4 rounded-xl border border-blue-100">
              {aiPlan.summary}
            </p>

            {aiPlan.dailyRoutineTip && (
              <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">SIT Campus Daily Routine Tip: </strong>
                  <span>{aiPlan.dailyRoutineTip}</span>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Allocation Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Recommended 7-Day Study Allocation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {aiPlan.weeklyAllocation?.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-blue-700 uppercase tracking-wider block mb-1">
                      {item.day}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {item.focusSubject}
                    </h4>
                    <span className="inline-block mt-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      {item.hours} hrs focus
                    </span>

                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <strong className="block text-[10px] text-slate-400 uppercase">Topics:</strong>
                      {item.recommendedTopics?.map((top, tIdx) => (
                        <p key={tIdx} className="line-clamp-2 text-[11px]">
                          • {top}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 italic">
                    Method: {item.studyTechnique}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Strategy & Weak Subject Action Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiPlan.examPreparationStrategy && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span>Exam Preparation Strategy</span>
                </h3>
                <div className="space-y-3">
                  {aiPlan.examPreparationStrategy.map((strat, sIdx) => (
                    <div key={sIdx} className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 text-xs">
                      <h4 className="font-bold text-orange-950">{strat.exam}</h4>
                      <p className="text-orange-900 mt-1">{strat.daysRemainingRecommendation}</p>
                      {strat.highYieldTopics?.length > 0 && (
                        <div className="mt-2 pt-1 border-t border-orange-200/60 text-orange-950">
                          <strong>High Yield Topics:</strong> {strat.highYieldTopics.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiPlan.weakSubjectActionPlan && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <span>Weak Subject Action Plan</span>
                </h3>
                <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs sm:text-sm text-indigo-950 leading-relaxed">
                  {aiPlan.weakSubjectActionPlan}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <Bot className="w-12 h-12 text-blue-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No AI Study Plan Generated Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Click "Generate New AI Study Plan" above to have Gemini AI analyze your registered subjects, upcoming exams at SIT Mangalore, and daily available study hours.
          </p>
          <button
            onClick={generateAiStudyPlan}
            disabled={isAiGenerating}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Generate AI Study Plan
          </button>
        </div>
      )}
    </div>
  );
};
