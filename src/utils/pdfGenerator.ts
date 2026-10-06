import { jsPDF } from 'jspdf';
import { PdfDocument, Assignment, Subject, UserProfile, Topic } from '../types';

/**
 * Generates an official SIT Mangalore formatted Project Report PDF
 */
export function generateProjectReportPdf(
  assignment: Assignment,
  user: UserProfile | null,
  subject?: Subject
): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const studentName = user?.name || 'Student';
  const usn = user?.usn || '4SN22CS045';
  const department = user?.department || 'Computer Science & Engineering';
  const semester = user?.semester || 5;
  const college = user?.collegeName || 'Srinivas Institute of Technology, Mangalore';
  const subjectName = subject?.name || 'Course Project';
  const subjectCode = subject?.code || '21CS51';

  // Header / Border
  doc.setDrawColor(37, 99, 235); // Blue
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277); // Outer page border

  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273); // Inner decorative border

  // College Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); // Dark blue
  doc.text('SRINIVAS INSTITUTE OF TECHNOLOGY', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Valachil, Merlapadavu, Mangalore - 574143', 105, 31, { align: 'center' });
  doc.text('Affiliated to VTU, Belagavi • Approved by AICTE, New Delhi', 105, 36, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(25, 40, 185, 40);

  // Department Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`DEPARTMENT OF ${department.toUpperCase()}`, 105, 48, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`ACADEMIC TERM: 2026-2027 • SEMESTER ${semester}`, 105, 54, { align: 'center' });

  // Report Title Badge
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(25, 62, 160, 28, 3, 3, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(25, 62, 160, 28, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text('PROJECT DOCUMENTATION REPORT', 105, 69, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  // Split long title if necessary
  const titleLines = doc.splitTextToSize(assignment.title, 150);
  doc.text(titleLines, 105, 77, { align: 'center' });

  // Submission Meta
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const startY = 100;
  doc.text(`Course Name: ${subjectName} (${subjectCode})`, 30, startY);
  doc.text(`Submission Type: ${assignment.submissionType}`, 30, startY + 7);
  doc.text(`Deadline Date: ${assignment.deadline}`, 30, startY + 14);
  doc.text(`Priority Level: ${assignment.priority}`, 30, startY + 21);

  // Student Details Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(25, 130, 160, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(25, 130, 160, 32, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('SUBMITTED BY:', 32, 138);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Candidate Name: ${studentName}`, 32, 146);
  doc.text(`University Seat Number (USN): ${usn}`, 32, 153);

  // Section 1: Executive Abstract
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text('1. Project Abstract & Objectives', 25, 175);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const abstractText =
    assignment.notes ||
    `This academic project report presents the systematic design, architectural schema, and functional validation for "${assignment.title}". Developed in fulfillment of curriculum requirements at Srinivas Institute of Technology Mangalore, the implementation emphasizes modular design, data consistency, and robust engineering principles in accordance with VTU standards.`;
  const splitAbstract = doc.splitTextToSize(abstractText, 160);
  doc.text(splitAbstract, 25, 183);

  // Section 2: Technical Specifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138);
  doc.text('2. Technical Environment & Requirements', 25, 210);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('• Target Framework: Engineering Lab Architecture (SIT Autonomous / VTU)', 25, 218);
  doc.text(`• Estimated Development Effort: ${assignment.estimatedHours} hours`, 25, 224);
  doc.text('• Evaluation Criteria: Schema Design, Execution Output, Code Quality & Viva', 25, 230);
  doc.text('• Verification: Internal Assessment Project Work (SIT Dept Evaluation)', 25, 236);

  // Faculty Signature / Verification Block
  doc.setDrawColor(203, 213, 225);
  doc.line(30, 265, 75, 265);
  doc.line(135, 265, 180, 265);

  doc.setFontSize(9);
  doc.text('Student Signature', 40, 270);
  doc.text('Faculty Evaluator Signature', 138, 270);

  // Footer Note
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('StudyMate • Srinivas Institute of Technology Mangalore Academic Portal', 105, 280, {
    align: 'center',
  });

  return doc.output('datauristring');
}

/**
 * Generates an official SIT Engineering Notes & Formula Cram-Sheet PDF
 */
export function generateNotesPdf(
  subject: Subject,
  topic?: Topic,
  user?: UserProfile | null,
  customNotes?: string
): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const studentName = user?.name || 'Student';
  const usn = user?.usn || '4SN22CS045';
  const department = user?.department || 'Computer Science & Engineering';
  const college = user?.collegeName || 'Srinivas Institute of Technology, Mangalore';
  const topicTitle = topic?.name || 'Complete Subject Revision Handbook';

  // Outer Border
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  // College Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('SRINIVAS INSTITUTE OF TECHNOLOGY, MANGALORE', 105, 20, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Department of ${department} • Academic Reference Notes`, 105, 25, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(20, 29, 190, 29);

  // Subject Pill
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(20, 34, 170, 22, 2, 2, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(20, 34, 170, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(67, 56, 202);
  doc.text(`${subject.name} (${subject.code})`, 105, 42, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Credits: ${subject.credits} • Difficulty: ${subject.difficulty} • Target Benchmark: ${subject.targetScore}%`,
    105,
    49,
    { align: 'center' }
  );

  // Topic Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`TOPIC: ${topicTitle}`, 20, 66);

  if (topic) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Estimated Study Duration: ${topic.estimatedHours} hrs • Status: ${
        topic.status === 'completed' ? 'Completed ✓' : 'In Progress'
      }`,
      20,
      72
    );
  }

  // Section 1: Core Concepts & Formulae
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('1. Core Concepts & Must-Remember Theory', 20, 84);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const notesText =
    customNotes ||
    topic?.notes ||
    `Fundamental engineering principles governing ${topicTitle}. Students must focus on definition clarity, state transitions, mathematical proofs, and schematic diagrams for Internal Assessment and VTU Semester examinations.`;
  const splitNotes = doc.splitTextToSize(notesText, 170);
  doc.text(splitNotes, 20, 91);

  // Section 2: Important Formulae & Equations
  let curY = 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('2. Key Formulas, Algorithms & Numerical Guidelines', 20, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text('• Formula / Notation 1: Verify boundary conditions and input constraint limits', 20, curY + 8);
  doc.text('• Algorithm Step: Trace step-by-step state changes using sample test numericals', 20, curY + 15);
  doc.text('• Complexity Metric: Analyze Best, Worst, and Average time/space complexity', 20, curY + 22);

  // Section 3: Likely VTU / SIT Exam Questions
  curY = 160;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('3. Likely SIT Internal Assessment & VTU Exam Questions', 20, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Q1. Explain the operational architecture of ${topicTitle} with a neat block diagram. [8 Marks]`, 20, curY + 8);
  doc.text(`Q2. Differentiate core algorithms with an illustrative numerical example. [6 Marks]`, 20, curY + 16);
  doc.text(`Q3. State and prove the fundamental theorems / properties applicable here. [6 Marks]`, 20, curY + 24);

  // Section 4: Study Strategy & Pro-Tips
  curY = 200;
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(20, curY, 170, 28, 2, 2, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(20, curY, 170, 28, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(146, 64, 14);
  doc.text('⚡ SIT Exam Strategy & Scorer Advice:', 25, curY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 53, 15);
  doc.text('• Draw labeled diagrams using a sharp pencil and ruler for maximum marks in VTU exams.', 25, curY + 15);
  doc.text('• Highlight final numerical results and state all assumptions clearly in your bluebook.', 25, curY + 22);

  // Footer Student Watermark
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Prepared for ${studentName} (USN: ${usn}) • Srinivas Institute of Technology Mangalore • StudyMate`,
    105,
    280,
    { align: 'center' }
  );

  return doc.output('datauristring');
}

/**
 * Pre-seeded sample PDF library for Notes and Projects
 */
export function getInitialPdfDocuments(user: UserProfile | null, subjects: Subject[]): PdfDocument[] {
  const dbmsSub = subjects.find((s) => s.code === '21CS51');
  const osSub = subjects.find((s) => s.code === '21CS52');
  const cnSub = subjects.find((s) => s.code === '21CS53');
  const tocSub = subjects.find((s) => s.code === '21CS54');
  const fsSub = subjects.find((s) => s.code === '21CS55');

  return [
    {
      id: 'pdf-notes-1',
      title: 'Database Management Systems (21CS51) - Module 1 to 3 Lecture Notes & SQL Drill',
      subjectId: dbmsSub?.id || 'sub-dbms',
      subjectName: 'Database Management Systems',
      category: 'notes',
      fileSize: '3.4 MB',
      pageCount: 42,
      uploadDate: '2026-09-28',
      author: 'Prof. SIT Dept of CSE',
      description: 'Comprehensive notes covering ER diagrams, Relational Algebra, SQL joins, subqueries, and Normalization (1NF, 2NF, 3NF, BCNF).',
      tags: ['DBMS', 'Syllabus Notes', 'VTU', 'Module 1-3'],
      isPreloaded: true,
    },
    {
      id: 'pdf-proj-1',
      title: 'SIT Library Management System ER Diagram & Normalization Case Study Report',
      subjectId: dbmsSub?.id || 'sub-dbms',
      subjectName: 'Database Management Systems',
      assignmentId: 'asg-1',
      category: 'project',
      fileSize: '2.8 MB',
      pageCount: 16,
      uploadDate: '2026-10-02',
      author: user?.name || 'Thanush Kolangaya',
      description: 'Complete mini-project report with Entity-Relationship schema, Relational Mapping, and 3NF decomposed relation tables.',
      tags: ['Project Report', 'DBMS Case Study', 'ER Model'],
      isPreloaded: true,
    },
    {
      id: 'pdf-notes-2',
      title: 'Operating Systems (21CS52) - CPU Scheduling & Semaphore Deadlocks Formula Handbook',
      subjectId: osSub?.id || 'sub-os',
      subjectName: 'Operating Systems',
      category: 'formula_sheet',
      fileSize: '1.9 MB',
      pageCount: 18,
      uploadDate: '2026-10-01',
      author: 'SIT Operating Systems Lab',
      description: 'Gantt chart numerical methods for Round Robin, SJF, Peterson algorithm proofs, and Banker algorithm safety matrices.',
      tags: ['Formula Sheet', 'OS Numericals', 'Banker Algorithm', 'Semaphores'],
      isPreloaded: true,
    },
    {
      id: 'pdf-proj-2',
      title: 'Producer-Consumer Process Synchronization Simulation Project in C/Pthreads',
      subjectId: osSub?.id || 'sub-os',
      subjectName: 'Operating Systems',
      assignmentId: 'asg-2',
      category: 'project',
      fileSize: '2.1 MB',
      pageCount: 12,
      uploadDate: '2026-10-03',
      author: user?.name || 'Thanush Kolangaya',
      description: 'System design document, thread lifecycle diagram, semaphore synchronization logic, and test bench execution outputs.',
      tags: ['OS Project', 'Pthreads', 'Synchronization', 'C Code'],
      isPreloaded: true,
    },
    {
      id: 'pdf-notes-3',
      title: 'Theory of Computation (21CS54) - Automata Solved Question Bank & State Diagrams',
      subjectId: tocSub?.id || 'sub-toc',
      subjectName: 'Theory of Computation & Automata',
      category: 'question_bank',
      fileSize: '4.2 MB',
      pageCount: 36,
      uploadDate: '2026-09-30',
      author: 'SIT Automata Research Group',
      description: 'Over 50 solved DFA/NFA transition tables, Pumping Lemma contradiction proofs, and Turing Machine state designs.',
      tags: ['Question Bank', 'Automata', 'DFA Numericals', 'Turing Machine'],
      isPreloaded: true,
    },
    {
      id: 'pdf-proj-3',
      title: 'Campus Food Ordering Portal Frontend & REST API Full Stack Project Report',
      subjectId: fsSub?.id || 'sub-fswd',
      subjectName: 'Full Stack Web Development',
      assignmentId: 'asg-3',
      category: 'project',
      fileSize: '3.6 MB',
      pageCount: 22,
      uploadDate: '2026-10-04',
      author: user?.name || 'Thanush Kolangaya',
      description: 'Full stack architecture documentation, React component hierarchy, Express routes, JWT auth flow, and UI screenshots.',
      tags: ['Web Dev Project', 'React', 'REST API', 'Documentation'],
      isPreloaded: true,
    },
    {
      id: 'pdf-notes-4',
      title: 'Computer Networks (21CS53) - Socket Programming Lab Manual & Wireshark Guide',
      subjectId: cnSub?.id || 'sub-cn',
      subjectName: 'Computer Networks',
      assignmentId: 'asg-4',
      category: 'lab_record',
      fileSize: '2.5 MB',
      pageCount: 20,
      uploadDate: '2026-10-02',
      author: 'SIT Networking Lab Faculty',
      description: 'Client-server socket programs in C/Java, CRC parity verification numericals, Dijkstra routing code, and packet traces.',
      tags: ['Lab Record', 'Wireshark', 'Socket Programming', 'Networks'],
      isPreloaded: true,
    },
  ];
}
