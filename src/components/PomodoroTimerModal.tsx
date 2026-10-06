import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle2,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface PomodoroTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroTimerModal: React.FC<PomodoroTimerModalProps> = ({ isOpen, onClose }) => {
  const { subjects, logStudyHours, triggerConfetti } = useStudy();

  const [mode, setMode] = useState<'study25' | 'study50' | 'break5'>('study25');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTopicName, setSelectedTopicName] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Initialize selected topic if needed
  useEffect(() => {
    if (currentSubject && currentSubject.topics.length > 0 && !selectedTopicName) {
      setSelectedTopicName(currentSubject.topics[0].name);
    }
  }, [currentSubject, selectedTopicName]);

  const switchMode = (newMode: 'study25' | 'study50' | 'break5') => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'study25') setTimeLeft(25 * 60);
    else if (newMode === 'study50') setTimeLeft(50 * 60);
    else setTimeLeft(5 * 60);
  };

  const totalTimeForMode =
    mode === 'study25' ? 25 * 60 : mode === 'study50' ? 50 * 60 : 5 * 60;

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      triggerConfetti();

      // Beep notification using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33; // D5
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
        setTimeout(() => osc.stop(), 1000);
      } catch (e) {
        // audio fail safe
      }

      // Log study time if study session
      if (mode !== 'break5' && selectedSubjectId) {
        const hours = mode === 'study25' ? 0.42 : 0.83;
        logStudyHours(
          selectedSubjectId,
          selectedTopicName || 'Focused Study Session',
          Number(hours.toFixed(2)),
          sessionNotes || 'Completed Pomodoro focus session',
          5
        );
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, selectedSubjectId, selectedTopicName, sessionNotes]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPct = ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-base">SIT Focus Pomodoro Timer</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-center">
          {/* Mode Switcher */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl justify-center">
            <button
              onClick={() => switchMode('study25')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'study25' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => switchMode('study50')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'study50' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              50m Deep Work
            </button>
            <button
              onClick={() => switchMode('break5')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'break5' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              5m Break
            </button>
          </div>

          {/* Clock Display */}
          <div className="relative py-4">
            <div className="text-6xl font-extrabold text-slate-900 font-mono tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">
              {mode === 'break5' ? 'Rest & Recharge' : 'Active Engineering Study'}
            </p>

            {/* Linear Progress Bar */}
            <div className="w-48 mx-auto bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              onClick={() => switchMode(mode)}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Topic & Subject Selection (for logging) */}
          {mode !== 'break5' && (
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 pt-3">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Assign Study Time To:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                    Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      const sub = subjects.find((s) => s.id === e.target.value);
                      if (sub && sub.topics.length > 0) setSelectedTopicName(sub.topics[0].name);
                    }}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                    Topic
                  </label>
                  <select
                    value={selectedTopicName}
                    onChange={(e) => setSelectedTopicName(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    {currentSubject?.topics.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
