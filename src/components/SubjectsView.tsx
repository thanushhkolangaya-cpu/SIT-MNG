import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileQuestion,
  BookMarked,
  X,
  FileText,
  Bot,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Subject, Topic, SubjectDifficulty, PdfDocument } from '../types';
import { PdfViewerModal } from './PdfViewerModal';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    toggleTopicCompletion,
    deleteTopic,
    generateAiTopicGuide,
    generateNotesPdfUrl,
  } = useStudy();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(
    subjects[0]?.id || null
  );

  // PDF Viewer Modal State
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<PdfDocument | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | undefined>(undefined);

  // Modals state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState<string>('');

  // AI Topic Cram-sheet Modal
  const [activeAiGuide, setActiveAiGuide] = useState<{
    subjectName: string;
    topicName: string;
    data: any;
  } | null>(null);
  const [isGuideLoading, setIsGuideLoading] = useState(false);

  // Add Subject Form
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(3);
  const [newSubDifficulty, setNewSubDifficulty] = useState<SubjectDifficulty>('Medium');
  const [newSubColor, setNewSubColor] = useState('#2563eb');
  const [newSubTarget, setNewSubTarget] = useState(85);

  // Add Topic Form
  const [newTopName, setNewTopName] = useState('');
  const [newTopHours, setNewTopHours] = useState(2.5);
  const [newTopDifficulty, setNewTopDifficulty] = useState<SubjectDifficulty>('Medium');
  const [newTopNotes, setNewTopNotes] = useState('');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    addSubject({
      code: newSubCode.trim().toUpperCase(),
      name: newSubName.trim(),
      credits: Number(newSubCredits),
      difficulty: newSubDifficulty,
      priority: newSubDifficulty === 'Hard' ? 'High' : 'Medium',
      color: newSubColor,
      targetScore: Number(newSubTarget),
    });

    setNewSubCode('');
    setNewSubName('');
    setIsAddSubjectOpen(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopName.trim() || !selectedSubjectForTopic) return;

    addTopic(selectedSubjectForTopic, {
      name: newTopName.trim(),
      estimatedHours: Number(newTopHours),
      difficulty: newTopDifficulty,
      status: 'not_started',
      notes: newTopNotes.trim() || undefined,
    });

    setNewTopName('');
    setNewTopNotes('');
    setIsAddTopicOpen(false);
  };

  const handleOpenAiGuide = async (subject: Subject, topic: Topic) => {
    setIsGuideLoading(true);
    setActiveAiGuide({
      subjectName: subject.name,
      topicName: topic.name,
      data: null,
    });
    try {
      const guideData = await generateAiTopicGuide(subject.name, topic.name, topic.difficulty);
      setActiveAiGuide({
        subjectName: subject.name,
        topicName: topic.name,
        data: guideData,
      });
    } catch (err) {
      console.error(err);
      setActiveAiGuide({
        subjectName: subject.name,
        topicName: topic.name,
        data: {
          coreConcept: 'Key foundational engineering concept required for semester exam.',
          keyPoints: [
            'Revise definition and mathematical / architecture representation',
            'Memorize state transitions and algorithms',
            'Practice past 3 years SIT question paper questions',
          ],
          examQuestions: ['Explain the working with a neat block diagram (8 marks)'],
          proTip: 'Write point-wise answers with labeled diagrams for maximum marks.',
          timeBreakdown: '45 mins reading + 30 mins problem practice',
        },
      });
    } finally {
      setIsGuideLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Subjects & Curriculum Topics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Srinivas Institute of Technology Engineering Syllabus & Mastery Checklists
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* Subjects Accordion / Card List */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const isExpanded = expandedSubjectId === subject.id;
          const totalTopics = subject.topics.length;
          const completedTopics = subject.topics.filter((t) => t.status === 'completed').length;
          const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
          const totalEstHours = subject.topics.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

          return (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              {/* Subject Header Bar */}
              <div
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3.5 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2.5 py-0.5 rounded text-xs font-bold text-white font-mono"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{subject.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          subject.difficulty === 'Hard'
                            ? 'bg-rose-100 text-rose-700'
                            : subject.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {subject.difficulty} Difficulty
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {subject.credits} Credits • Target: {subject.targetScore}%
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <span>{completedTopics} of {totalTopics} topics completed</span>
                      <span>•</span>
                      <span>{totalEstHours} estimated study hours</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar & Expand trigger */}
                <div className="flex items-center gap-6 self-end md:self-center">
                  <div className="w-36 text-right">
                    <div className="text-sm font-bold text-slate-900">{progressPct}%</div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: subject.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Topics Detail Section */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Syllabus Topics Checklist ({totalTopics})
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = generateNotesPdfUrl(subject.id);
                          setViewingDoc({
                            id: 'pdf-sub-' + subject.id,
                            title: `${subject.name} (${subject.code}) - Revision Handbook & Syllabus Notes`,
                            subjectId: subject.id,
                            subjectName: subject.name,
                            category: 'notes',
                            fileSize: '3.1 MB',
                            pageCount: 24,
                            uploadDate: new Date().toISOString().split('T')[0],
                            tags: ['SIT Mangalore', subject.code, 'Notes', 'Syllabus'],
                            isPreloaded: false,
                          });
                          setPdfDataUrl(url);
                          setIsPdfViewerOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        title="View Official SIT Revision Handbook PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Syllabus Notes PDF</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubjectForTopic(subject.id);
                          setIsAddTopicOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Topic</span>
                      </button>
                    </div>
                  </div>

                  {subject.topics.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                      No topics added yet. Click "+ Add Topic" to insert your syllabus modules!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {subject.topics.map((topic) => {
                        const isDone = topic.status === 'completed';
                        return (
                          <div
                            key={topic.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isDone
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-white border-slate-200 hover:border-blue-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Checkbox & Topic Info */}
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleTopicCompletion(subject.id, topic.id)}
                                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                                  title={isDone ? 'Mark as Incomplete' : 'Mark as Completed!'}
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                      {topic.name}
                                    </span>
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                        topic.difficulty === 'Hard'
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : topic.difficulty === 'Medium'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {topic.difficulty}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1 font-mono">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {topic.estimatedHours} hrs study time
                                    </span>
                                    {topic.completedAt && (
                                      <span className="text-emerald-600 font-medium">
                                        ✓ Finished on {topic.completedAt}
                                      </span>
                                    )}
                                  </div>

                                  {topic.notes && (
                                    <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 px-2 py-1 rounded">
                                      📌 {topic.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action Tools */}
                              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                {/* AI Topic Cram Sheet button */}
                                <button
                                  onClick={() => handleOpenAiGuide(subject, topic)}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Generate AI Formula & Revision Cram-Sheet"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>AI Cram-Sheet</span>
                                </button>

                                <button
                                  onClick={() => deleteTopic(subject.id, topic.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete topic"
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

                  {/* Subject Delete & Settings */}
                  <div className="flex justify-end pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
                          deleteSubject(subject.id);
                        }
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Subject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-blue-600" />
                <span>Add SIT Subject / Course</span>
              </h3>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="21CS51"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Cloud Computing & DevOps"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newSubDifficulty}
                    onChange={(e) => setNewSubDifficulty(e.target.value as SubjectDifficulty)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Theme Color
                  </label>
                  <input
                    type="color"
                    value={newSubColor}
                    onChange={(e) => setNewSubColor(e.target.value)}
                    className="w-full h-9 p-1 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Score (%)
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={newSubTarget}
                  onChange={(e) => setNewSubTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Add Syllabus Topic</span>
              </h3>
              <button
                onClick={() => setIsAddTopicOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={newTopName}
                  onChange={(e) => setNewTopName(e.target.value)}
                  placeholder="e.g. Banker's Algorithm Numericals"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Study Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={newTopHours}
                    onChange={(e) => setNewTopHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topic Difficulty
                  </label>
                  <select
                    value={newTopDifficulty}
                    onChange={(e) => setNewTopDifficulty(e.target.value as SubjectDifficulty)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Important Notes or Formulas
                </label>
                <textarea
                  value={newTopNotes}
                  onChange={(e) => setNewTopNotes(e.target.value)}
                  rows={2}
                  placeholder="Need = Max - Allocation. Practice 2 state safety problems."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Cram-Sheet Modal */}
      {activeAiGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                  <span>SIT AI Revision Cram-Sheet</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  {activeAiGuide.topicName}
                </h3>
                <p className="text-xs text-slate-500">{activeAiGuide.subjectName}</p>
              </div>
              <button
                onClick={() => setActiveAiGuide(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isGuideLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Generating engineering exam cram-sheet using Gemini 3.8 Flash...
                </p>
                <p className="text-[11px] text-slate-400">
                  Summarizing core concepts and likely VTU / SIT test questions
                </p>
              </div>
            ) : activeAiGuide.data ? (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-1">💡 Core Concept</h4>
                  <p className="text-blue-800 leading-relaxed">
                    {activeAiGuide.data.coreConcept}
                  </p>
                </div>

                {activeAiGuide.data.keyPoints?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Must-Remember Points</span>
                    </h4>
                    <ul className="space-y-1 list-disc list-inside text-slate-700">
                      {activeAiGuide.data.keyPoints.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeAiGuide.data.examQuestions?.length > 0 && (
                  <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
                      <FileQuestion className="w-4 h-4 text-purple-700" />
                      <span>Likely SIT / VTU Exam Questions</span>
                    </h4>
                    <ul className="space-y-1 text-purple-900">
                      {activeAiGuide.data.examQuestions.map((q: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-bold shrink-0">•</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeAiGuide.data.proTip && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                    <strong className="block mb-0.5">⚡ Exam Strategy Tip:</strong>
                    <span>{activeAiGuide.data.proTip}</span>
                  </div>
                )}

                <div className="text-right pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveAiGuide(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Got It, Ready to Study!
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* PDF Revision Notes Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => {
          setIsPdfViewerOpen(false);
          setViewingDoc(null);
          setPdfDataUrl(undefined);
        }}
        document={viewingDoc}
        pdfDataUrl={pdfDataUrl}
      />
    </div>
  );
};
