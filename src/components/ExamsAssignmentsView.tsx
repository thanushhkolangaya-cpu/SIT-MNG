import React, { useState } from 'react';
import {
  Calendar,
  FileCheck,
  Plus,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PriorityLevel } from '../types';

export const ExamsAssignmentsView: React.FC = () => {
  const {
    exams,
    assignments,
    subjects,
    addExam,
    deleteExam,
    addAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'exams' | 'assignments'>('exams');
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddAsgOpen, setIsAddAsgOpen] = useState(false);

  // Add Exam form state
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examTitle, setExamTitle] = useState('Internal Assessment 1 (IA-1)');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:30 AM - 11:00 AM');
  const [examLocation, setExamLocation] = useState('SIT Academic Block Room 304');
  const [examPortion, setExamPortion] = useState('Module 1 & 2');
  const [examMarks, setExamMarks] = useState(30);

  // Add Assignment form state
  const [asgSubjectId, setAsgSubjectId] = useState(subjects[0]?.id || '');
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDeadline, setAsgDeadline] = useState('');
  const [asgHours, setAsgHours] = useState(2.5);
  const [asgType, setAsgType] = useState<any>('Written Assignment');
  const [asgPriority, setAsgPriority] = useState<PriorityLevel>('High');
  const [asgNotes, setAsgNotes] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const enrichedExams = exams
    .map((e) => {
      const d = new Date(e.date);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...e, diffDays: diff };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  const enrichedAssignments = assignments
    .map((a) => {
      const d = new Date(a.deadline);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...a, diffDays: diff };
    })
    .sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || a.diffDays - b.diffDays);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate || !examTitle) return;

    addExam({
      subjectId: examSubjectId || subjects[0]?.id,
      title: examTitle,
      date: examDate,
      time: examTime,
      location: examLocation,
      syllabusPortion: examPortion,
      weightageMarks: Number(examMarks),
    });

    setIsAddExamOpen(false);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle || !asgDeadline) return;

    addAssignment({
      subjectId: asgSubjectId || subjects[0]?.id,
      title: asgTitle,
      deadline: asgDeadline,
      estimatedHours: Number(asgHours),
      status: 'pending',
      submissionType: asgType,
      priority: asgPriority,
      notes: asgNotes,
    });

    setAsgTitle('');
    setAsgNotes('');
    setIsAddAsgOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span>Exams & Assignment Deadlines</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Srinivas Institute of Technology Internal Assessments, Lab Exams & Submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'exams' ? (
            <button
              onClick={() => setIsAddExamOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add SIT Exam / Test</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddAsgOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment / Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('exams')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Internal & Semester Exams ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Assignments & Lab Records ({assignments.length})</span>
        </button>
      </div>

      {/* Tab 1: Exams */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedExams.map((exam) => {
            const subject = subjects.find((s) => s.id === exam.subjectId);
            const isUrgent = exam.diffDays >= 0 && exam.diffDays <= 4;
            const isPassed = exam.diffDays < 0;

            return (
              <div
                key={exam.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isUrgent
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white font-mono"
                      style={{ backgroundColor: subject?.color || '#7c3aed' }}
                    >
                      {subject?.code || 'SIT'}
                    </span>

                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        isPassed
                          ? 'bg-slate-100 text-slate-500'
                          : isUrgent
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {isPassed ? 'Completed' : exam.diffDays === 0 ? 'TODAY!' : `${exam.diffDays} Days Left`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{exam.title}</h3>
                  <p className="text-xs font-semibold text-slate-600">{subject?.name}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.date} • {exam.time}</span>
                    </div>
                    {exam.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.location}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">Portion: {exam.syllabusPortion}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700">
                    Weightage: {exam.weightageMarks} Marks
                  </span>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-3">
          {enrichedAssignments.map((asg) => {
            const subject = subjects.find((s) => s.id === asg.subjectId);
            const isDone = asg.status === 'submitted';
            const isUrgent = !isDone && asg.diffDays <= 3;

            return (
              <div
                key={asg.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isUrgent
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleAssignmentStatus(asg.id)}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded text-white font-mono"
                          style={{ backgroundColor: subject?.color || '#059669' }}
                        >
                          {subject?.code}
                        </span>
                        <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {asg.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {asg.submissionType}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Subject: {subject?.name}</span>
                        <span>•</span>
                        <span>Est. Effort: {asg.estimatedHours} hrs</span>
                        <span>•</span>
                        <span>Deadline: <strong className="text-slate-700">{asg.deadline}</strong></span>
                      </div>

                      {asg.notes && (
                        <p className="text-xs text-slate-600 mt-1 italic">
                          📝 {asg.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : isUrgent
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isDone ? 'Submitted ✓' : asg.diffDays <= 0 ? 'Due Today!' : `${asg.diffDays}d remaining`}
                    </span>

                    <button
                      onClick={() => deleteAssignment(asg.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Exam Modal */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Add Internal or Final Exam</span>
              </h3>
              <button onClick={() => setIsAddExamOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  value={examSubjectId}
                  onChange={(e) => setExamSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Internal Assessment 1 (IA-1)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="09:30 AM - 11:00 AM"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={examLocation}
                    onChange={(e) => setExamLocation(e.target.value)}
                    placeholder="Academic Block 304"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={examMarks}
                    onChange={(e) => setExamMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Portion / Topics Covered</label>
                <input
                  type="text"
                  value={examPortion}
                  onChange={(e) => setExamPortion(e.target.value)}
                  placeholder="Module 1 (Scheduling) & Module 2 (Deadlocks)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {isAddAsgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Add Assignment or Lab Task</span>
              </h3>
              <button onClick={() => setIsAddAsgOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                <select
                  value={asgSubjectId}
                  onChange={(e) => setAsgSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Normalization Case Study Report"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    value={asgDeadline}
                    onChange={(e) => setAsgDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="20"
                    value={asgHours}
                    onChange={(e) => setAsgHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Type</label>
                  <select
                    value={asgType}
                    onChange={(e) => setAsgType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Written Assignment">Written Assignment</option>
                    <option value="Coding / Project">Coding / Project</option>
                    <option value="Lab Record">Lab Record</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={asgPriority}
                    onChange={(e) => setAsgPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Guidelines / Notes</label>
                <textarea
                  value={asgNotes}
                  onChange={(e) => setAsgNotes(e.target.value)}
                  rows={2}
                  placeholder="Need to attach ER diagram and schema printouts"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAsgOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
