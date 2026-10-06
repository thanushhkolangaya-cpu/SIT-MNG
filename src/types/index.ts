export type SubjectDifficulty = 'Easy' | 'Medium' | 'Hard';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TopicStatus = 'not_started' | 'in_progress' | 'completed';
export type SessionStatus = 'scheduled' | 'completed' | 'missed' | 'rescheduled';

export interface UserProfile {
  id: string;
  name: string;
  usn: string; // University Seat Number (VTU / Srinivas format)
  email: string;
  department: string;
  semester: number;
  collegeName: string;
  targetCgpa: string;
  dailyAvailableHours: number;
  preferredStudySlots: string[];
  streakDays: number;
  lastStudiedDate?: string;
  joinedAt: string;
  password?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  estimatedHours: number;
  actualHoursSpent: number;
  difficulty: SubjectDifficulty;
  status: TopicStatus;
  completedAt?: string;
  notes?: string;
  keyFormulas?: string;
  pdfUrl?: string;
}

export type PdfCategory = 'notes' | 'project' | 'lab_record' | 'question_bank' | 'formula_sheet';

export interface PdfDocument {
  id: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  topicId?: string;
  topicName?: string;
  assignmentId?: string;
  category: PdfCategory;
  fileSize: string;
  pageCount: number;
  uploadDate: string;
  fileUrl?: string; // base64 Data URL or Blob URL
  author?: string;
  description?: string;
  tags: string[];
  isPreloaded?: boolean;
}

export interface Subject {
  id: string;
  code: string; // e.g. 21CS51
  name: string;
  credits: number;
  color: string;
  difficulty: SubjectDifficulty;
  priority: PriorityLevel;
  targetScore: number;
  topics: Topic[];
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string; // e.g. "Internal Assessment 1 (IA-1)"
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  syllabusPortion: string;
  weightageMarks: number;
  notes?: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  deadline: string; // YYYY-MM-DD
  estimatedHours: number;
  status: 'pending' | 'submitted';
  submissionType: 'Written Assignment' | 'Coding / Project' | 'Lab Record' | 'Seminar';
  priority: PriorityLevel;
  notes?: string;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot?: string; // e.g. "18:00 - 19:30"
  subjectId: string;
  topicId?: string;
  topicName: string;
  durationHours: number;
  status: SessionStatus;
  priority: PriorityLevel;
  type: 'Topic Study' | 'Exam Revision' | 'Assignment Work' | 'Problem Solving';
  notes?: string;
  completedAt?: string;
}

export interface WeeklyStudyAvailability {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface ClassPeriod {
  periodNumber: number; // 1 to 6
  time: string; // e.g. "09:00 AM - 09:55 AM"
  subjectId: string; // matches subject id or 'free' or 'lab'
  subjectCode: string; // e.g. "21CS51"
  subjectName: string; // e.g. "Database Management Systems"
  room?: string; // e.g. "LH-302"
  faculty?: string; // e.g. "Dr. Suresh M"
  isLab?: boolean;
}

export interface DayClassTimetable {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: ClassPeriod[];
}

export type WeeklyClassTimetable = DayClassTimetable[];

export interface StudyLog {
  id: string;
  date: string;
  hours: number;
  subjectId: string;
  topicName: string;
  rating?: number; // 1-5 focus rating
  notes?: string;
}

export interface AIPlanResponse {
  summary: string;
  weeklyAllocation: Array<{
    day: string;
    focusSubject: string;
    hours: number;
    recommendedTopics: string[];
    studyTechnique: string;
  }>;
  examPreparationStrategy: Array<{
    exam: string;
    daysRemainingRecommendation: string;
    highYieldTopics: string[];
  }>;
  weakSubjectActionPlan: string;
  dailyRoutineTip: string;
}

export interface ChatAttachment {
  name: string;
  type: 'pdf' | 'image';
  mimeType: string;
  data: string; // base64
  size?: string;
  pageCount?: number;
}

export type AnswerDepthLevel = 'graduated' | 'basic' | 'intermediate' | 'advanced';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isQuestionAnalysis?: boolean;
  conceptTags?: string[];
  attachment?: ChatAttachment;
  isQuizMessage?: boolean;
  answerLevel?: AnswerDepthLevel;
}

export type QuizQuestionType = 'mcq' | 'true_false' | 'short_answer';

export interface ChatQuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  conceptTested: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pageReference?: string;
}

export interface ChatQuizSession {
  id: string;
  title: string;
  sourceType: 'pdf' | 'image' | 'topic' | 'general';
  sourceName?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: ChatQuizQuestion[];
  userAnswers: Array<{
    questionId: string;
    studentAnswer: string;
    isCorrect: boolean;
    explanation: string;
    conceptTested: string;
  }>;
  score: number;
  isComplete: boolean;
  strongTopics: string[];
  weakTopics: string[];
  currentDifficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTested?: string;
}

export interface QuizModule {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  moduleNumber: number;
  moduleTitle: string;
  description?: string;
  difficulty: SubjectDifficulty;
  questions: QuizQuestion[];
  bestScore?: number;
  lastScore?: number;
  attemptsCount?: number;
}

export interface QuizResult {
  moduleId: string;
  moduleTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  userAnswers: Record<string, number>;
  timeSpentSeconds: number;
}
