import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PdfDocument } from '../types';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PdfDocument | null;
  pdfDataUrl?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  pdfDataUrl,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || (!document && !pdfDataUrl)) return null;

  const title = document?.title || 'Academic PDF Document';
  const category = document?.category || 'notes';
  const activeUrl = pdfDataUrl || document?.fileUrl;

  const handleDownload = () => {
    if (!activeUrl) return;
    const link = window.document.createElement('a');
    link.href = activeUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    notes: { label: 'Subject Notes', color: 'bg-blue-100 text-blue-800' },
    project: { label: 'Project Report', color: 'bg-emerald-100 text-emerald-800' },
    lab_record: { label: 'Lab Record', color: 'bg-purple-100 text-purple-800' },
    formula_sheet: { label: 'Formula Sheet', color: 'bg-amber-100 text-amber-800' },
    question_bank: { label: 'Question Bank', color: 'bg-rose-100 text-rose-800' },
  };

  const catInfo = categoryLabels[category] || { label: 'Document', color: 'bg-slate-100 text-slate-800' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 transition-all ${
          isFullscreen ? 'w-full h-full rounded-none' : 'max-w-5xl w-full h-[90vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-white/10 text-blue-300 shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catInfo.color}`}>
                  {catInfo.label}
                </span>
                {document?.subjectName && (
                  <span className="text-xs text-blue-200 font-medium truncate">
                    {document.subjectName}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white truncate mt-0.5" title={title}>
                {title}
              </h3>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {activeUrl && (
              <>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download PDF File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-100 overflow-hidden relative flex flex-col">
          {activeUrl ? (
            <iframe
              src={activeUrl}
              title={title}
              className="w-full h-full border-none"
            />
          ) : (
            /* Document Text Reader Fallback */
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-3xl mx-auto w-full bg-white my-4 shadow-sm rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 pb-4 mb-6 text-center">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-widest block mb-1">
                  Srinivas Institute of Technology Mangalore
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Author: {document?.author || 'SIT Faculty / Student'} • Uploaded: {document?.uploadDate}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Description & Syllabus Overview</h4>
                  <p>{document?.description || 'Official academic notes and project documentation.'}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Core Content & Technical Details</h4>
                  <p>
                    This document provides standard engineering course documentation, laboratory exercises, and
                    curriculum study topics prepared for students at Srinivas Institute of Technology (SIT),
                    Valachil, Mangalore in accordance with VTU standards.
                  </p>
                </div>

                {document?.tags && document.tags.length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1.5">Document Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {document.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Srinivas Institute of Technology (SIT), Valachil, Mangalore</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Size: {document?.fileSize || 'Standard PDF'}</span>
            <span>•</span>
            <span>{document?.pageCount || 1} Pages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
