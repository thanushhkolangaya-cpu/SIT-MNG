import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  Building2,
  Sliders,
  Plus,
  Check,
  RotateCcw,
  Sparkles,
  School,
  AlertCircle,
  GraduationCap,
  Save,
  Trash2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ClassPeriod, WeeklyClassTimetable, WeeklyStudyAvailability } from '../types';

interface SetTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'class' | 'add-session' | 'study-hours';
  selectedDate?: string;
}

export const SetTimetableModal: React.FC<SetTimetableModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'class',
  selectedDate,
}) => {
  const {
    subjects,
    classTimetable,
    setClassTimetable,
    updateClassPeriod,
    availability,
    updateAvailability,
    regenerateSchedule,
    addSession,
    triggerConfetti,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'class' | 'add-session' | 'study-hours'>(initialTab);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable copy of college class timetable
  const [localClassTimetable, setLocalClassTimetable] = useState<WeeklyClassTimetable>(() => {
    return JSON.parse(JSON.stringify(classTimetable));
  });

  // New Study Session Form State
  const todayStr = selectedDate || new Date().toISOString().split('T')[0];
  const [sessionDate, setSessionDate] = useState(todayStr);
  const [sessionSubjectId, setSessionSubjectId] = useState(subjects[0]?.id || '');
  const [sessionTopicName, setSessionTopicName] = useState('');
  const [sessionTimeSlot, setSessionTimeSlot] = useState('06:00 PM - 07:45 PM');
  const [sessionDuration, setSessionDuration] = useState<number>(1.5);
  const [sessionType, setSessionType] = useState<'Topic Study' | 'Exam Revision' | 'Assignment Work' | 'Problem Solving'>('Topic Study');
  const [sessionPriority, setSessionPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [sessionNotes, setSessionNotes] = useState('');

  // Editable availability
  const [editAvailability, setEditAvailability] = useState<WeeklyStudyAvailability>({
    ...availability,
  });

  if (!isOpen) return null;

  const currentDaySchedule = localClassTimetable.find(
    (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
  ) || localClassTimetable[0];

  const handlePeriodChange = (periodNum: number, field: keyof ClassPeriod, value: any) => {
    setLocalClassTimetable((prev) =>
      prev.map((d) => {
        if (d.day.toLowerCase() !== selectedDay.toLowerCase()) return d;
        return {
          ...d,
          periods: d.periods.map((p) => {
            if (p.periodNumber !== periodNum) return p;
            const updated = { ...p, [field]: value };
            // If changing subject, update name and code automatically if matching known subject
            if (field === 'subjectId') {
              const matched = subjects.find((s) => s.id === value);
              if (matched) {
                updated.subjectName = matched.name;
                updated.subjectCode = matched.code;
              }
            }
            return updated;
          }),
        };
      })
    );
  };

  const handleSaveClassTimetable = () => {
    setClassTimetable(localClassTimetable);
    setSaveSuccess(true);
    triggerConfetti();
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveAvailability = () => {
    updateAvailability(editAvailability);
    regenerateSchedule();
    setSaveSuccess(true);
    triggerConfetti();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleAddSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopicName.trim() || !sessionSubjectId) return;

    addSession({
      date: sessionDate,
      timeSlot: sessionTimeSlot,
      subjectId: sessionSubjectId,
      topicName: sessionTopicName.trim(),
      durationHours: Number(sessionDuration),
      status: 'scheduled',
      priority: sessionPriority,
      type: sessionType,
      notes: sessionNotes.trim() || undefined,
    });

    triggerConfetti();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  // Branch Presets for Srinivas Institute of Technology
  const handleLoadPreset = (branch: 'cse' | 'ise' | 'aiml' | 'ece') => {
    if (branch === 'cse') {
      // Restore standard 5th sem CSE timetable
      const cseSubjects = subjects;
      setLocalClassTimetable((prev) =>
        prev.map((d) => ({
          ...d,
          periods: d.periods.map((p) => {
            const sub = cseSubjects[(p.periodNumber - 1) % cseSubjects.length];
            return {
              ...p,
              subjectId: sub?.id || p.subjectId,
              subjectCode: sub?.code || p.subjectCode,
              subjectName: sub?.name || p.subjectName,
            };
          }),
        }))
      );
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const selectedSubject = subjects.find((s) => s.id === sessionSubjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/40 border border-blue-400/40 flex items-center justify-center text-amber-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Set Timetable & Schedule</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  SIT Mangalore
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Configure your College Class Timetable, Add Custom Study Slots, or Set Daily Study Goals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1.5 flex border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('class')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'class'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>🏫 College Class Routine</span>
          </button>

          <button
            onClick={() => setActiveTab('add-session')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'add-session'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>➕ Add Study Session</span>
          </button>

          <button
            onClick={() => setActiveTab('study-hours')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'study-hours'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>⏱️ Daily Study Hours</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Timetable preferences updated and saved successfully!</span>
            </div>
          )}

          {/* TAB 1: COLLEGE CLASS ROUTINE */}
          {activeTab === 'class' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-200/60">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>SIT Weekly College Lecture & Lab Timetable</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Configure Monday through Saturday class periods (9:00 AM – 4:00 PM).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Quick Presets:</span>
                  <button
                    onClick={() => handleLoadPreset('cse')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white text-blue-700 hover:bg-blue-100 border border-blue-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    SIT 5th Sem CSE
                  </button>
                </div>
              </div>

              {/* Day Selector Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedDay === d
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Periods List for Selected Day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {selectedDay} Periods (6 Hours)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    College Timings: 9:00 AM – 3:55 PM
                  </span>
                </div>

                <div className="space-y-2.5">
                  {currentDaySchedule.periods.map((period) => (
                    <div
                      key={period.periodNumber}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors flex flex-col md:flex-row md:items-center gap-3 justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                          P{period.periodNumber}
                        </span>
                        <div>
                          <span className="text-xs font-mono text-slate-500 block">
                            {period.time}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {period.subjectCode} - {period.subjectName}
                          </span>
                        </div>
                      </div>

                      {/* Period Editor Controls */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Subject Select */}
                        <select
                          value={period.subjectId}
                          onChange={(e) =>
                            handlePeriodChange(period.periodNumber, 'subjectId', e.target.value)
                          }
                          className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
                        >
                          {subjects.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.code}: {sub.name}
                            </option>
                          ))}
                          <option value="free">Free Period / Self Study</option>
                          <option value="mini-project">Mini Project / Seminar</option>
                          <option value="training">Placement & Soft Skills</option>
                        </select>

                        {/* Room Number */}
                        <input
                          type="text"
                          placeholder="Room / Hall"
                          value={period.room || ''}
                          onChange={(e) =>
                            handlePeriodChange(period.periodNumber, 'room', e.target.value)
                          }
                          className="w-24 text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          title="Classroom / Hall Number"
                        />

                        {/* Faculty */}
                        <input
                          type="text"
                          placeholder="Faculty Name"
                          value={period.faculty || ''}
                          onChange={(e) =>
                            handlePeriodChange(period.periodNumber, 'faculty', e.target.value)
                          }
                          className="w-32 text-xs px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          title="Faculty Name"
                        />

                        {/* Lab Indicator Toggle */}
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer bg-white px-2 py-1.5 border border-slate-200 rounded-lg">
                          <input
                            type="checkbox"
                            checked={Boolean(period.isLab)}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'isLab', e.target.checked)
                            }
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>Lab</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={handleSaveClassTimetable}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save College Class Routine</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ADD STUDY SESSION */}
          {activeTab === 'add-session' && (
            <form onSubmit={handleAddSessionSubmit} className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/60">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Schedule a Custom Study Session</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Add an individual study block to your personal timetable for any date and subject.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Study Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                    required
                  />
                </div>

                {/* Subject Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject Focus
                  </label>
                  <select
                    value={sessionSubjectId}
                    onChange={(e) => {
                      setSessionSubjectId(e.target.value);
                      const sub = subjects.find((s) => s.id === e.target.value);
                      if (sub && sub.topics.length > 0) {
                        setSessionTopicName(sub.topics[0].name);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}: {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Topic / Focus Chapter</label>
                  {selectedSubject && selectedSubject.topics.length > 0 && (
                    <span className="text-[11px] text-slate-500">Pick from syllabus below or type</span>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="e.g. Banker's Algorithm Numericals & Safe State Verification"
                  value={sessionTopicName}
                  onChange={(e) => setSessionTopicName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                  required
                />

                {/* Quick Topic Chips from Subject */}
                {selectedSubject && selectedSubject.topics.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {selectedSubject.topics.slice(0, 4).map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setSessionTopicName(t.name)}
                        className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Slot & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={sessionTimeSlot}
                    onChange={(e) => setSessionTimeSlot(e.target.value)}
                    placeholder="e.g. 06:00 PM - 07:45 PM"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                  {/* Preset quick times */}
                  <div className="flex gap-1.5 mt-1.5">
                    {['06:00 AM - 07:30 AM', '06:00 PM - 07:45 PM', '08:30 PM - 10:00 PM'].map((time) => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSessionTimeSlot(time)}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 font-mono"
                      >
                        {time.split(' - ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.5"
                    max="6"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Session Type
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e: any) => setSessionType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Topic Study">Topic Study</option>
                    <option value="Exam Revision">Exam Revision</option>
                    <option value="Assignment Work">Assignment Work</option>
                    <option value="Problem Solving">Problem Solving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={sessionPriority}
                    onChange={(e: any) => setSessionPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Urgent">Urgent (Before Exam)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session Study Notes / Goals (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on past 3 years VTU exam numerical questions"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Study Session to Timetable</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DAILY STUDY HOURS */}
          {activeTab === 'study-hours' && (
            <div className="space-y-5">
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/60">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Configure Daily Self-Study Hours Available</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Adjust how many hours you dedicate to self-study after college classes. The AI will balance topics accordingly.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
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
                  <div key={key} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center hover:border-indigo-300 transition-colors">
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
                        className="w-16 px-2 py-1.5 text-center font-bold text-sm bg-white border border-slate-300 rounded-xl"
                      />
                      <span className="text-xs text-slate-500">h</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Weekly Total Planned Study</h4>
                  <p className="text-xs text-slate-500">
                    Total hours allocated for self-study across all 7 days
                  </p>
                </div>
                <span className="text-xl font-extrabold text-indigo-700">
                  {Object.values(editAvailability).reduce((a, b) => a + b, 0).toFixed(1)} hrs/week
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvailability}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Regenerate Schedule</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
