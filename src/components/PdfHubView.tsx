import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  BookOpen,
  FolderGit2,
  FileCode,
  Search,
  Filter,
  Sparkles,
  Printer,
  Trash2,
  Eye,
  Plus,
  ExternalLink,
  GraduationCap,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PdfDocument, PdfCategory } from '../types';
import { PdfViewerModal } from './PdfViewerModal';
import { UploadPdfModal } from './UploadPdfModal';

export const PdfHubView: React.FC = () => {
  const {
    pdfDocuments,
    subjects,
    assignments,
    deletePdfDocument,
    generateProjectPdfUrl,
    generateNotesPdfUrl,
  } = useStudy();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [viewingDoc, setViewingDoc] = useState<PdfDocument | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | undefined>(undefined);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filtered documents
  const filteredDocs = pdfDocuments.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSubject = selectedSubjectId === 'all' || doc.subjectId === selectedSubjectId;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      (doc.description && doc.description.toLowerCase().includes(q)) ||
      (doc.subjectName && doc.subjectName.toLowerCase().includes(q)) ||
      doc.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSubject && matchesQuery;
  });

  const handleOpenPdf = (doc: PdfDocument) => {
    setViewingDoc(doc);
    // If it's a preloaded document without fileUrl, dynamically generate the data URL on the fly!
    if (!doc.fileUrl) {
      if (doc.category === 'project' && doc.assignmentId) {
        const url = generateProjectPdfUrl(doc.assignmentId);
        setGeneratedPdfUrl(url);
      } else if (doc.subjectId) {
        const url = generateNotesPdfUrl(doc.subjectId);
        setGeneratedPdfUrl(url);
      } else {
        setGeneratedPdfUrl(undefined);
      }
    } else {
      setGeneratedPdfUrl(doc.fileUrl);
    }
    setIsViewerOpen(true);
  };

  const handleGenerateProjectReport = (assignmentId: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return;
    const url = generateProjectPdfUrl(assignmentId);
    setViewingDoc({
      id: 'gen-proj-' + Date.now(),
      title: `${asg.title} - Official SIT Project Report`,
      subjectId: asg.subjectId,
      category: 'project',
      fileSize: '2.5 MB',
      pageCount: 15,
      uploadDate: new Date().toISOString().split('T')[0],
      tags: ['SIT Project Report', 'Generated PDF'],
      isPreloaded: false,
    });
    setGeneratedPdfUrl(url);
    setIsViewerOpen(true);
  };

  const handleGenerateNotesPdf = (subjectId: string) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return;
    const url = generateNotesPdfUrl(subjectId);
    setViewingDoc({
      id: 'gen-notes-' + Date.now(),
      title: `${sub.name} (${sub.code}) - Revision Handbook & Formula Sheet`,
      subjectId: sub.id,
      category: 'notes',
      fileSize: '3.1 MB',
      pageCount: 24,
      uploadDate: new Date().toISOString().split('T')[0],
      tags: ['SIT Notes', sub.code, 'Formulas'],
      isPreloaded: false,
    });
    setGeneratedPdfUrl(url);
    setIsViewerOpen(true);
  };

  const categoryOptions = [
    { id: 'all', label: 'All Documents' },
    { id: 'notes', label: '📚 Subject Notes' },
    { id: 'project', label: '💻 Project Reports' },
    { id: 'lab_record', label: '🔬 Lab Records' },
    { id: 'formula_sheet', label: '⚡ Formula Sheets' },
    { id: 'question_bank', label: '❓ Question Banks' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                SIT Mangalore Academic Library
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs">
                {pdfDocuments.length} Documents Available
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Notes & Project PDFs
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
              Access curated VTU syllabus lecture notes, lab manuals, and official project reports for Srinivas Institute of Technology. Read documents directly in-app or export clean printable PDFs.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload My PDF File</span>
            </button>
            <button
              onClick={() => {
                if (assignments.length > 0) handleGenerateProjectReport(assignments[0].id);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Generate Project Report PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, projects, tags..."
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-700 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categoryOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveCategory(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === opt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No PDF Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or upload your first course notes / project document!
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Upload PDF Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const sub = subjects.find((s) => s.id === doc.subjectId);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white font-mono"
                      style={{ backgroundColor: sub?.color || '#2563eb' }}
                    >
                      {sub?.code || 'SIT PDF'}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.category === 'project'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.category === 'lab_record'
                          ? 'bg-purple-100 text-purple-800'
                          : doc.category === 'formula_sheet'
                          ? 'bg-amber-100 text-amber-800'
                          : doc.category === 'question_bank'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {doc.category === 'project'
                        ? 'Project Report'
                        : doc.category === 'lab_record'
                        ? 'Lab Record'
                        : doc.category === 'formula_sheet'
                        ? 'Formula Sheet'
                        : doc.category === 'question_bank'
                        ? 'Question Bank'
                        : 'Subject Notes'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 mt-1 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {doc.subjectName || 'Engineering Curriculum'}
                  </p>

                  {doc.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed bg-slate-50 p-2 rounded-lg">
                      {doc.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer details & Action buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span>{doc.fileSize} • {doc.pageCount} Pages</span>
                    <span>{doc.uploadDate}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenPdf(doc)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read / View PDF</span>
                    </button>

                    {!doc.isPreloaded && (
                      <button
                        onClick={() => deletePdfDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Generators Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-base text-indigo-950">
            Instant SIT Engineering PDF Generators
          </h3>
        </div>
        <p className="text-xs text-indigo-900 leading-relaxed max-w-2xl">
          Instantly generate official SIT formatted PDF documentation for your assignments, or download complete module notes with formulas for exam revision.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Project Generator Card */}
          <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <span>Generate Project Documentation PDF</span>
            </h4>
            <p className="text-xs text-slate-500">
              Creates formal cover page, abstract, and architecture specifications for any assignment.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              {assignments.map((asg) => (
                <button
                  key={asg.id}
                  onClick={() => handleGenerateProjectReport(asg.id)}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  Generate: {asg.title.slice(0, 28)}...
                </button>
              ))}
            </div>
          </div>

          {/* Notes Generator Card */}
          <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Generate Subject Revision Handbook PDF</span>
            </h4>
            <p className="text-xs text-slate-500">
              Exports syllabus modules, formula cheat-sheets, and likely exam questions into a single document.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleGenerateNotesPdf(sub.id)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                  {sub.code} Handbook
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setViewingDoc(null);
          setGeneratedPdfUrl(undefined);
        }}
        document={viewingDoc}
        pdfDataUrl={generatedPdfUrl}
      />

      {/* Upload PDF Modal */}
      <UploadPdfModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};
