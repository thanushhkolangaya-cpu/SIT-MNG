import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  FolderOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PdfCategory } from '../types';

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: PdfCategory;
  defaultSubjectId?: string;
}

export const UploadPdfModal: React.FC<UploadPdfModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'notes',
  defaultSubjectId = '',
}) => {
  const { subjects, user, addPdfDocument } = useStudy();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [category, setCategory] = useState<PdfCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('1.5 MB');
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file (.pdf)');
      return;
    }

    setSelectedFileName(file.name);
    // Auto-fill title if empty
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Format size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeStr(`${sizeInMb} MB`);

    // Read as Data URL
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      setPdfDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a document title');
      return;
    }

    const selectedSub = subjects.find((s) => s.id === subjectId);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    addPdfDocument({
      title: title.trim(),
      subjectId: subjectId || undefined,
      subjectName: selectedSub?.name,
      category,
      fileSize: fileSizeStr || '2.0 MB',
      pageCount: 12,
      fileUrl: pdfDataUrl || undefined,
      author: user?.name || 'SIT Student',
      description: description.trim() || undefined,
      tags: parsedTags.length > 0 ? parsedTags : [category, selectedSub?.code || 'SIT'],
      isPreloaded: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Upload Academic PDF</h3>
              <p className="text-xs text-slate-500">SIT Notes, Project Reports, & Question Banks</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-5 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-blue-600">
                <FolderOpen className="w-6 h-6" />
              </div>
              {selectedFileName ? (
                <div>
                  <p className="text-xs font-bold text-blue-900 truncate max-w-xs">{selectedFileName}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{fileSizeStr} • PDF Ready</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Click to browse or drag & drop PDF file
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports syllabus notes, project documentation, or lab reports (.pdf)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems Banker Algorithm Numericals"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Course</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PDF Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PdfCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="notes">Subject Notes</option>
                <option value="project">Project Report</option>
                <option value="lab_record">Lab Record</option>
                <option value="formula_sheet">Formula Sheet</option>
                <option value="question_bank">Question Bank</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Summary</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief overview of modules or implementation covered in this PDF"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="VTU, Module 1, ER Diagram, Numericals"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Save & Add PDF</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
