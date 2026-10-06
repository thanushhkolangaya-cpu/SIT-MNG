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
