import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Sparkles,
  RotateCcw,
  BookOpen,
  Filter,
  Search,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Bot,
  Zap,
  Check,
  X,
  GraduationCap,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { QuizModule, QuizQuestion, QuizResult } from '../types';

export const ModuleQuizView: React.FC = () => {
  const {
    subjects,
    quizModules,
    quizResults,
    recordQuizAttempt,
    generateCustomAiQuiz,
    openAeronixWithPrompt,
  } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Quiz State
  const [activeModule, setActiveModule] = useState<QuizModule | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  // Custom AI Quiz Generator Modal state
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState('Database Management Systems');
  const [customModuleTitle, setCustomModuleTitle] = useState('Module 3: Normalization & BCNF');
  const [customDifficulty, setCustomDifficulty] = useState('Medium');
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState(false);
  const [aiQuizError, setAiQuizError] = useState('');

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Filtered modules
  const filteredModules = quizModules.filter((mod) => {
    const matchesSubject = selectedSubjectId === 'all' || mod.subjectId === selectedSubjectId;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      mod.moduleTitle.toLowerCase().includes(q) ||
      mod.subjectName.toLowerCase().includes(q) ||
      mod.subjectCode.toLowerCase().includes(q) ||
      (mod.description && mod.description.toLowerCase().includes(q));

    return matchesSubject && matchesQuery;
  });

  // Calculate Overall Quiz Stats
  const totalAttemptedCount = quizResults.length;
  const masteredCount = quizModules.filter((m) => (m.bestScore || 0) >= 80).length;
  const averageScore =
    totalAttemptedCount > 0
      ? Math.round(
          quizResults.reduce((sum, r) => sum + r.percentage, 0) / totalAttemptedCount
        )
      : 0;

  // Start a Quiz
  const handleStartQuiz = (mod: QuizModule) => {
    setActiveModule(mod);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsQuizCompleted(false);
    setTimeSpentSeconds(0);
    const start = Date.now();
    setQuizStartTime(start);

    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      setTimeSpentSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    setTimerInterval(interval);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isQuizCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleFinishQuiz = () => {
    if (!activeModule) return;
    if (timerInterval) clearInterval(timerInterval);

    let correctCount = 0;
    activeModule.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const total = activeModule.questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const result: QuizResult = {
      moduleId: activeModule.id,
      moduleTitle: `${activeModule.subjectCode} M${activeModule.moduleNumber}: ${activeModule.moduleTitle}`,
      score: correctCount,
      totalQuestions: total,
      percentage,
      date: new Date().toISOString().split('T')[0],
      userAnswers: selectedAnswers,
      timeSpentSeconds,
    };

    recordQuizAttempt(result);
    setIsQuizCompleted(true);
  };

  const handleGenerateAiQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiQuizError('');
    setIsGeneratingAiQuiz(true);

    try {
      const generatedQuestions = await generateCustomAiQuiz(
        customSubjectName,
        customModuleTitle,
        5,
        customDifficulty
      );

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('Could not generate quiz questions. Please try again.');
      }

      const newModule: QuizModule = {
        id: 'quiz-ai-' + Date.now(),
        subjectId: 'sub-custom',
        subjectCode: 'AI-GEN',
        subjectName: customSubjectName,
        moduleNumber: 99,
        moduleTitle: customModuleTitle,
        description: `Custom AI-generated module quiz created with ChatBOT for ${customSubjectName}.`,
        difficulty: customDifficulty as any,
        questions: generatedQuestions,
      };

      setIsAiQuizModalOpen(false);
      handleStartQuiz(newModule);
    } catch (err: any) {
      setAiQuizError(err.message || 'Failed to generate quiz');
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                SIT Mangalore Module Assessment
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs">
                {quizModules.length} Modules Available
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Subject Module Quizzes
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
              Test your conceptual grasp across VTU & Srinivas Institute of Technology syllabus modules. Instant explanations, performance scores, and AI diagnostic feedback.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setIsAiQuizModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Generate AI Quiz with ChatBOT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Quizzes Taken</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalAttemptedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all subjects</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{averageScore}%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Accuracy rate</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Mastered Modules</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{masteredCount}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Scored 80% or higher</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Modules</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{quizModules.length}</div>
          <p className="text-[11px] text-purple-600 font-medium mt-1">SIT 5th Sem Curriculum</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search module title, topics..."
            className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Subject:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-700 cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Module Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => {
          const isMastered = (mod.bestScore || 0) >= 80;
          const hasAttempted = mod.attemptsCount && mod.attemptsCount > 0;

          return (
            <div
              key={mod.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                    {mod.subjectCode} • Module {mod.moduleNumber}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      mod.difficulty === 'Hard'
                        ? 'bg-rose-100 text-rose-800'
                        : mod.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {mod.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {mod.moduleTitle}
                </h3>

                <p className="text-xs text-slate-500 font-medium mt-1">
                  {mod.subjectName}
                </p>

                {mod.description && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {mod.description}
                  </p>
                )}
              </div>

              {/* Footer info & Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-500 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {mod.questions.length} Questions
                  </span>

                  {hasAttempted ? (
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isMastered ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isMastered && <Award className="w-3.5 h-3.5 text-amber-500" />}
                      Best: {mod.bestScore}%
                    </span>
                  ) : (
                    <span className="text-slate-400">Not taken yet</span>
                  )}
                </div>

                <button
                  onClick={() => handleStartQuiz(mod)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{hasAttempted ? 'Retake Module Quiz' : 'Start Module Quiz'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Quiz Runner Modal */}
      {activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-mono">
                    {activeModule.subjectCode} M{activeModule.moduleNumber}
                  </span>
                  <span className="text-xs text-blue-200 font-medium">
                    {activeModule.subjectName}
                  </span>
                </div>
                <h2 className="font-extrabold text-base sm:text-lg text-white mt-0.5">
                  {activeModule.moduleTitle}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-xl text-blue-200 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatSeconds(timeSpentSeconds)}</span>
                </div>

                <button
                  onClick={() => {
                    setActiveModule(null);
                    if (timerInterval) clearInterval(timerInterval);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {!isQuizCompleted ? (
                /* Active Question Answering Interface */
                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>Question {currentQuestionIndex + 1} of {activeModule.questions.length}</span>
                      <span>
                        {Math.round(((currentQuestionIndex + 1) / activeModule.questions.length) * 100)}% Completed
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / activeModule.questions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  {(() => {
                    const currentQ = activeModule.questions[currentQuestionIndex];
                    if (!currentQ) return null;

                    return (
                      <div className="space-y-4">
                        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
                          {currentQ.conceptTested && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md inline-block mb-2">
                              Concept: {currentQ.conceptTested}
                            </span>
                          )}
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                            {currentQ.question}
                          </h3>
                        </div>

                        {/* Options */}
                        <div className="space-y-2.5">
                          {currentQ.options.map((option, optIdx) => {
                            const isSelected = selectedAnswers[currentQ.id] === optIdx;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(currentQ.id, optIdx)}
                                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-blue-950 font-semibold' : 'text-slate-800'}`}>
                                  {option}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Question Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                    >
                      Previous
                    </button>

                    {currentQuestionIndex < activeModule.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishQuiz}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Submit & View Results</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Completed Scorecard & Detailed Explanation Review */
                <div className="space-y-6">
                  {/* Scorecard Hero */}
                  {(() => {
                    let score = 0;
                    activeModule.questions.forEach((q) => {
                      if (selectedAnswers[q.id] === q.correctIndex) score += 1;
                    });
                    const total = activeModule.questions.length;
                    const pct = Math.round((score / total) * 100);
                    const isPassed = pct >= 60;
                    const isOutstanding = pct >= 80;

                    return (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 text-center space-y-3">
                        <div className="inline-flex p-3 rounded-2xl bg-white shadow-md text-amber-500">
                          {isOutstanding ? <Award className="w-8 h-8 text-amber-500" /> : <GraduationCap className="w-8 h-8 text-blue-600" />}
                        </div>

                        <div>
                          <h3 className="text-2xl font-black text-slate-900">
                            {score} / {total} Correct ({pct}%)
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-indigo-900 mt-1">
                            {isOutstanding
                              ? '🎉 Outstanding Module Mastery! You are thoroughly prepared for this section.'
                              : isPassed
                              ? '👍 Good Effort! Review the missed questions below to lock in full marks.'
                              : '📖 Concept Needs Revision. Read the explanations and consider retaking.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-xs text-slate-600 pt-2">
                          <span>Time Spent: <strong>{formatSeconds(timeSpentSeconds)}</strong></span>
                          <span>•</span>
                          <span>Accuracy: <strong>{pct}%</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Question Breakdown and Explanations */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Question Review & Explanations</span>
                    </h4>

                    {activeModule.questions.map((q, idx) => {
                      const userAns = selectedAnswers[q.id];
                      const isCorrect = userAns === q.correctIndex;

                      return (
                        <div
                          key={q.id}
                          className={`p-4.5 rounded-2xl border transition-all ${
                            isCorrect
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="font-bold text-xs text-slate-900">
                              Question {idx + 1}
                            </span>

                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Correct</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Incorrect</span>
                                </>
                              )}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3">
                            {q.question}
                          </p>

                          {/* Options Review */}
                          <div className="space-y-1.5 text-xs">
                            {q.options.map((opt, oIdx) => {
                              const isThisCorrect = oIdx === q.correctIndex;
                              const isThisUser = oIdx === userAns;

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-lg flex items-center justify-between ${
                                    isThisCorrect
                                      ? 'bg-emerald-100/70 text-emerald-900 font-semibold border border-emerald-300'
                                      : isThisUser
                                      ? 'bg-rose-100/70 text-rose-900 font-semibold border border-rose-300'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  <span>
                                    <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                                  </span>
                                  {isThisCorrect && (
                                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Correct Answer</span>
                                  )}
                                  {!isThisCorrect && isThisUser && (
                                    <span className="text-[10px] font-bold text-rose-800 uppercase">Your Answer</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Detailed Explanation */}
                          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                            <strong className="text-blue-900 flex items-center gap-1">
                              <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                              Technical Explanation:
                            </strong>
                            <p>{q.explanation}</p>
                          </div>

                          {/* Ask ChatBOT Button for Missed Questions */}
                          {!isCorrect && (
                            <button
                              onClick={() => {
                                const promptText = `ChatBOT, in the ${activeModule.subjectName} quiz for "${activeModule.moduleTitle}", I missed this question:\n\n"${q.question}"\n\nCorrect Answer: "${q.options[q.correctIndex]}"\nMy Answer: "${userAns !== undefined ? q.options[userAns] : 'None'}"\n\nPlease break down this concept and explain the intuition simply so I don't miss it in the exam.`;
                                openAeronixWithPrompt(promptText, true);
                              }}
                              className="mt-2 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>Ask ChatBOT to explain why I missed this</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Scorecard Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleStartQuiz(activeModule)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Quiz</span>
                    </button>

                    <button
                      onClick={() => setActiveModule(null)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Done / Back to Modules
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom AI Quiz Generator Modal */}
      {isAiQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Generate Custom AI Module Quiz</span>
              </h3>
              <button
                onClick={() => setIsAiQuizModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              ChatBOT will generate 5 brand-new, challenging questions specifically tailored to your syllabus module or exam portion.
            </p>

            {aiQuizError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiQuizError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateAiQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name
                </label>
                <select
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                  <option value="Machine Learning & Deep Learning">Machine Learning & Deep Learning</option>
                  <option value="Compiler Design">Compiler Design</option>
                  <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Module or Topic Focus
                </label>
                <input
                  type="text"
                  value={customModuleTitle}
                  onChange={(e) => setCustomModuleTitle(e.target.value)}
                  placeholder="e.g. Module 3: CPU Scheduling or BCNF"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Easy">Easy (Fundamentals & Definitions)</option>
                  <option value="Medium">Medium (Application & Standard SIT IA Level)</option>
                  <option value="Hard">Hard (Deep Logic & Numerical Problems)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAiQuizModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGeneratingAiQuiz}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingAiQuiz ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Quiz (5 Questions)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
