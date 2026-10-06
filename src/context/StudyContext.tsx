import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  Subject,
  Exam,
  Assignment,
  StudySession,
  WeeklyStudyAvailability,
  StudyLog,
  Topic,
  AIPlanResponse,
  AuthResult,
  PdfDocument,
  ChatMessage,
  ChatAttachment,
  ChatQuizSession,
  ChatQuizQuestion,
  AnswerDepthLevel,
  QuizModule,
  QuizQuestion,
  QuizResult,
  ClassPeriod,
  DayClassTimetable,
  WeeklyClassTimetable,
} from '../types';
import {
  INITIAL_USER,
  DEMO_USERS,
  INITIAL_SUBJECTS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_AVAILABILITY,
  INITIAL_SESSIONS,
  INITIAL_STUDY_LOGS,
  INITIAL_CLASS_TIMETABLE,
} from '../data/mockData';
import { INITIAL_QUIZ_MODULES } from '../data/quizData';
import {
  generateStudySchedule,
  autoReviseSchedule,
  calculatePredictions,
  generateWeakSubjectAdvisories,
  SubjectPrediction,
  WeakSubjectAdvisory,
} from '../utils/scheduler';
import { parseSITUSN } from '../utils/usnHelper';
import {
  generateProjectReportPdf,
  generateNotesPdf,
  getInitialPdfDocuments,
} from '../utils/pdfGenerator';

interface StudyContextType {
  user: UserProfile | null;
  registeredUsers: UserProfile[];
  demoUsers: UserProfile[];
  login: (credential: string, password?: string) => AuthResult;
  register: (profile: Omit<UserProfile, 'id' | 'streakDays' | 'joinedAt'>, password?: string) => AuthResult;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  pdfDocuments: PdfDocument[];
  addPdfDocument: (doc: Omit<PdfDocument, 'id' | 'uploadDate'>) => void;
  deletePdfDocument: (id: string) => void;
  generateProjectPdfUrl: (assignmentId: string) => string;
  generateNotesPdfUrl: (subjectId: string, topicId?: string) => string;

  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'topics'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addTopic: (subjectId: string, topic: Omit<Topic, 'id' | 'subjectId' | 'actualHoursSpent'>) => void;
  updateTopic: (subjectId: string, topicId: string, updates: Partial<Topic>) => void;
  toggleTopicCompletion: (subjectId: string, topicId: string) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;

  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  assignments: Assignment[];
  addAssignment: (asg: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleAssignmentStatus: (id: string) => void;

  availability: WeeklyStudyAvailability;
  updateAvailability: (newAvailability: WeeklyStudyAvailability) => void;

  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id'>) => void;
  updateSession: (sessionId: string, updates: Partial<StudySession>) => void;
  deleteSession: (sessionId: string) => void;
  markSessionCompleted: (sessionId: string, actualHours?: number) => void;
  markSessionMissed: (sessionId: string) => void;
  rescheduleSession: (sessionId: string, newDate: string, newTimeSlot?: string) => void;
  regenerateSchedule: () => void;
  triggerAutoRevise: () => void;

  // College Class Timetable
  classTimetable: WeeklyClassTimetable;
  setClassTimetable: (timetable: WeeklyClassTimetable) => void;
  updateClassPeriod: (day: string, periodNumber: number, updates: Partial<ClassPeriod>) => void;
  loadTimetablePreset: (branch: string) => void;

  studyLogs: StudyLog[];
  logStudyHours: (subjectId: string, topicName: string, hours: number, notes?: string, rating?: number) => void;

  predictions: SubjectPrediction[];
  advisories: WeakSubjectAdvisory[];

  aiPlan: AIPlanResponse | null;
  isAiGenerating: boolean;
  aiError: string | null;
  generateAiStudyPlan: () => Promise<void>;
  generateAiTopicGuide: (subjectName: string, topicName: string, difficulty: string) => Promise<any>;
  generateAiProgressInsights: () => Promise<any>;

  overallStats: {
    totalTopics: number;
    completedTopics: number;
    overallProgressPct: number;
    totalPlannedHours: number;
    totalCompletedHours: number;
    upcomingExamsCount: number;
    pendingAssignmentsCount: number;
  };

  // Module Quizzes
  quizModules: QuizModule[];
  quizResults: QuizResult[];
  recordQuizAttempt: (result: QuizResult) => void;
  generateCustomAiQuiz: (
    subjectName: string,
    moduleTitle: string,
    questionCount?: number,
    difficulty?: string
  ) => Promise<QuizQuestion[] | null>;

  // ChatBOT AI Assistant
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  activeAttachment: ChatAttachment | null;
  setActiveAttachment: (attachment: ChatAttachment | null) => void;
  answerLevel: AnswerDepthLevel;
  setAnswerLevel: (level: AnswerDepthLevel) => void;
  sendChatMessage: (
    text: string,
    isQuestionAnalysis?: boolean,
    attachmentOverride?: ChatAttachment | null,
    levelOverride?: AnswerDepthLevel
  ) => Promise<void>;
  clearChat: () => void;
  openAeronixWithPrompt: (promptText: string, isQuestionAnalysis?: boolean) => void;
  openChatBotWithPrompt: (promptText: string, isQuestionAnalysis?: boolean) => void;

  // Adaptive Chat Quiz
  quizSession: ChatQuizSession | null;
  isQuizLoading: boolean;
  startChatQuiz: (sourceType?: 'pdf' | 'image' | 'topic' | 'general', targetTopic?: string, weakTopicsToTest?: string[]) => Promise<void>;
  submitQuizAnswer: (questionId: string, answer: string | number) => Promise<void>;
  resetChatQuiz: () => void;

  triggerConfetti: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with SIT Mangalore mock data
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sit_registered_users_full');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_USERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sit_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null; // Start on the Registration and Login portal
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('sit_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('sit_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('sit_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [availability, setAvailability] = useState<WeeklyStudyAvailability>(() => {
    const saved = localStorage.getItem('sit_availability');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('sit_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [classTimetable, setClassTimetable] = useState<WeeklyClassTimetable>(() => {
    const saved = localStorage.getItem('sit_class_timetable');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CLASS_TIMETABLE;
  });

  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(() => {
    const saved = localStorage.getItem('sit_study_logs');
    return saved ? JSON.parse(saved) : INITIAL_STUDY_LOGS;
  });

  const [aiPlan, setAiPlan] = useState<AIPlanResponse | null>(() => {
    const saved = localStorage.getItem('sit_ai_plan');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [pdfDocuments, setPdfDocuments] = useState<PdfDocument[]>(() => {
    const saved = localStorage.getItem('sit_pdf_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return getInitialPdfDocuments(INITIAL_USER, INITIAL_SUBJECTS);
  });

  // Module Quizzes State
  const [quizModules, setQuizModules] = useState<QuizModule[]>(() => {
    const saved = localStorage.getItem('sit_quiz_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_QUIZ_MODULES;
  });

  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('sit_quiz_results');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // ChatBOT AI Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sit_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        text: `Hello! I am **ChatBOT**, your personal study assistant and academic mentor at Srinivas Institute of Technology (SIT), Mangalore.\n\nI can help you with:\n- 📎 **Analyzing uploaded PDFs** (summarize, explain chapters, extract formulas & questions)\n- 🖼️ **Analyzing photos** (textbook pages, handwritten notes, diagrams, math problems)\n- 🧠 **Adaptive Quiz Me Mode** (tests step-by-step, tracks scores, retests weak concepts)\n- 📝 **Solving questions & making revision notes**\n\nUpload a PDF or image, click **Quiz Me**, or ask any question to get started!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [activeAttachment, setActiveAttachment] = useState<ChatAttachment | null>(() => {
    const saved = localStorage.getItem('sit_chat_attachment');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [quizSession, setQuizSession] = useState<ChatQuizSession | null>(null);
  const [answerLevel, setAnswerLevel] = useState<AnswerDepthLevel>(() => {
    const saved = localStorage.getItem('sit_chat_answer_level');
    return (saved as AnswerDepthLevel) || 'graduated';
  });
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sit_chat_answer_level', answerLevel);
  }, [answerLevel]);

  // Sync state changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('sit_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sit_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sit_registered_users_full', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('sit_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('sit_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('sit_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('sit_availability', JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    localStorage.setItem('sit_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('sit_class_timetable', JSON.stringify(classTimetable));
  }, [classTimetable]);

  useEffect(() => {
    localStorage.setItem('sit_study_logs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    if (aiPlan) {
      localStorage.setItem('sit_ai_plan', JSON.stringify(aiPlan));
    }
  }, [aiPlan]);

  useEffect(() => {
    localStorage.setItem('sit_pdf_documents', JSON.stringify(pdfDocuments));
  }, [pdfDocuments]);

  useEffect(() => {
    localStorage.setItem('sit_quiz_modules', JSON.stringify(quizModules));
  }, [quizModules]);

  useEffect(() => {
    localStorage.setItem('sit_quiz_results', JSON.stringify(quizResults));
  }, [quizResults]);

  useEffect(() => {
    localStorage.setItem('sit_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch (e) {
      // ignore
    }
  };

  // Auth operations
  const login = (credential: string, password?: string): AuthResult => {
    const cleanCred = credential.trim().toLowerCase();
    if (!cleanCred) {
      return { success: false, error: 'Please enter your SIT USN or College Email.' };
    }

    const matched = registeredUsers.find(
      (u) => u.email.toLowerCase() === cleanCred || u.usn.toLowerCase() === cleanCred
    );

    if (matched) {
      if (matched.password && password && matched.password !== password) {
        return { success: false, error: 'Incorrect password. (For demo accounts, use: password123)' };
      }
      setUser(matched);
      return { success: true };
    }

    // If not found in registered list, but looks like a valid USN or email
    if (cleanCred.startsWith('4sn') || cleanCred.includes('@')) {
      const newUser: UserProfile = {
        id: 'user-' + Date.now(),
        name: credential.includes('@') ? credential.split('@')[0] : credential.toUpperCase(),
        usn: credential.toUpperCase(),
        email: credential.includes('@') ? credential : `${credential.toLowerCase()}@srinivasgroup.com`,
        department: 'Computer Science & Engineering',
        semester: 5,
        collegeName: 'Srinivas Institute of Technology, Mangalore',
        targetCgpa: '8.50',
        dailyAvailableHours: 3.5,
        preferredStudySlots: ['Evening (6:00 PM - 8:30 PM)', 'Night (9:30 PM - 11:30 PM)'],
        streakDays: 1,
        joinedAt: new Date().toISOString().split('T')[0],
        password: password || 'password123',
      };
      setRegisteredUsers((prev) => [...prev, newUser]);
      setUser(newUser);
      return { success: true };
    }

    return {
      success: false,
      error: 'Account not found with this USN/Email. Please check your details or register below.',
    };
  };

  const register = (
    profileData: Omit<UserProfile, 'id' | 'streakDays' | 'joinedAt'>,
    password?: string
  ): AuthResult => {
    const cleanUsn = profileData.usn.trim().toUpperCase();
    const cleanEmail = profileData.email.trim().toLowerCase();

    // Check if USN or Email is already registered
    const existing = registeredUsers.find(
      (u) => u.usn.toUpperCase() === cleanUsn || u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      return {
        success: false,
        error: `A student with USN "${cleanUsn}" or email "${cleanEmail}" is already registered. Please login instead.`,
      };
    }

    const newUser: UserProfile = {
      ...profileData,
      usn: cleanUsn,
      email: cleanEmail,
      id: 'user-' + Date.now(),
      streakDays: 1,
      joinedAt: new Date().toISOString().split('T')[0],
      password: password || 'password123',
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    triggerConfetti();
    return { success: true };
  };

  const switchUser = (userId: string) => {
    const target = registeredUsers.find((u) => u.id === userId);
    if (target) {
      setUser(target);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Subject operations
  const addSubject = (newSub: Omit<Subject, 'id' | 'topics'>) => {
    const id = 'sub-' + Date.now();
    const created: Subject = {
      ...newSub,
      id,
      topics: [],
    };
    setSubjects((prev) => [...prev, created]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setExams((prev) => prev.filter((e) => e.subjectId !== id));
    setAssignments((prev) => prev.filter((a) => a.subjectId !== id));
    setSessions((prev) => prev.filter((s) => s.subjectId !== id));
  };

  // Topic operations
  const addTopic = (
    subjectId: string,
    topicData: Omit<Topic, 'id' | 'subjectId' | 'actualHoursSpent'>
  ) => {
    const newTopic: Topic = {
      ...topicData,
      id: 'top-' + Date.now(),
      subjectId,
      actualHoursSpent: 0,
    };
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s))
    );
  };

  const updateTopic = (subjectId: string, topicId: string, updates: Partial<Topic>) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              topics: s.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
            }
          : s
      )
    );
  };

  const toggleTopicCompletion = (subjectId: string, topicId: string) => {
    let nowCompleted = false;
    let topicName = '';

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id !== topicId) return t;
            nowCompleted = t.status !== 'completed';
            topicName = t.name;
            return {
              ...t,
              status: nowCompleted ? 'completed' : 'in_progress',
              completedAt: nowCompleted ? new Date().toISOString().split('T')[0] : undefined,
              actualHoursSpent: nowCompleted ? Math.max(t.actualHoursSpent, t.estimatedHours) : t.actualHoursSpent,
            };
          }),
        };
      })
    );

    if (nowCompleted) {
      triggerConfetti();
      // Also update matching session if present
      setSessions((prev) =>
        prev.map((sess) =>
          sess.topicId === topicId
            ? { ...sess, status: 'completed', completedAt: new Date().toISOString().split('T')[0] }
            : sess
        )
      );
      // Log progress
      logStudyHours(subjectId, topicName, 1.5, 'Marked topic complete in tracker');
    }
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) }
          : s
      )
    );
  };

  // Exam operations
  const addExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...examData, id: 'exam-' + Date.now() };
    setExams((prev) => [...prev, newExam]);
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Assignment operations
  const addAssignment = (asgData: Omit<Assignment, 'id'>) => {
    const newAsg: Assignment = { ...asgData, id: 'asg-' + Date.now() };
    setAssignments((prev) => [...prev, newAsg]);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAssignmentStatus = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const nextStatus = a.status === 'submitted' ? 'pending' : 'submitted';
        if (nextStatus === 'submitted') triggerConfetti();
        return { ...a, status: nextStatus };
      })
    );
  };

  // PDF Operations for Notes and Projects
  const addPdfDocument = (doc: Omit<PdfDocument, 'id' | 'uploadDate'>) => {
    const newDoc: PdfDocument = {
      ...doc,
      id: 'pdf-' + Date.now(),
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setPdfDocuments((prev) => [newDoc, ...prev]);
    triggerConfetti();
  };

  const deletePdfDocument = (id: string) => {
    setPdfDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const generateProjectPdfUrl = (assignmentId: string): string => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return '';
    const sub = subjects.find((s) => s.id === asg.subjectId);
    return generateProjectReportPdf(asg, user, sub);
  };

  const generateNotesPdfUrl = (subjectId: string, topicId?: string): string => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return '';
    const top = topicId ? sub.topics.find((t) => t.id === topicId) : undefined;
    return generateNotesPdf(sub, top, user);
  };

  // Availability
  const updateAvailability = (newAvailability: WeeklyStudyAvailability) => {
    setAvailability(newAvailability);
  };

  // Session management & Revisions
  const markSessionCompleted = (sessionId: string, actualHours?: number) => {
    triggerConfetti();
    const sess = sessions.find((s) => s.id === sessionId);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'completed',
              completedAt: new Date().toISOString().split('T')[0],
              durationHours: actualHours !== undefined ? actualHours : s.durationHours,
            }
          : s
      )
    );

    if (sess) {
      // Mark matching topic as completed if associated
      if (sess.topicId && sess.subjectId) {
        setSubjects((prev) =>
          prev.map((sub) =>
            sub.id === sess.subjectId
              ? {
                  ...sub,
                  topics: sub.topics.map((t) =>
                    t.id === sess.topicId
                      ? {
                          ...t,
                          status: 'completed',
                          completedAt: new Date().toISOString().split('T')[0],
                          actualHoursSpent: (t.actualHoursSpent || 0) + (actualHours || sess.durationHours),
                        }
                      : t
                  ),
                }
              : sub
          )
        );
      }
      logStudyHours(
        sess.subjectId,
        sess.topicName,
        actualHours || sess.durationHours,
        'Study session marked as completed'
      );
    }
  };

  const markSessionMissed = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'missed' } : s))
    );
  };

  const rescheduleSession = (sessionId: string, newDate: string, newTimeSlot?: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              date: newDate,
              timeSlot: newTimeSlot || s.timeSlot,
              status: 'rescheduled',
            }
          : s
      )
    );
  };

  const addSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: 'sess-' + Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const updateSession = (sessionId: string, updates: Partial<StudySession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const updateClassPeriod = (day: string, periodNumber: number, updates: Partial<ClassPeriod>) => {
    setClassTimetable((prev) =>
      prev.map((d) =>
        d.day.toLowerCase() === day.toLowerCase()
          ? {
              ...d,
              periods: d.periods.map((p) =>
                p.periodNumber === periodNumber ? { ...p, ...updates } : p
              ),
            }
          : d
      )
    );
  };

  const loadTimetablePreset = (branch: string) => {
    // Can support different branch templates if needed, defaults to SIT autonomous CSE/IT
    setClassTimetable(INITIAL_CLASS_TIMETABLE);
  };

  const regenerateSchedule = () => {
    const fresh = generateStudySchedule(subjects, exams, assignments, availability, 7);
    // Keep already completed sessions from past
    const pastCompleted = sessions.filter((s) => s.status === 'completed');
    setSessions([...pastCompleted, ...fresh]);
  };

  const triggerAutoRevise = () => {
    const revised = autoReviseSchedule(sessions, subjects, exams, assignments, availability);
    setSessions(revised);
  };

  // Study log
  const logStudyHours = (
    subjectId: string,
    topicName: string,
    hours: number,
    notes?: string,
    rating: number = 4
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: StudyLog = {
      id: 'log-' + Date.now(),
      date: todayStr,
      subjectId,
      topicName,
      hours,
      notes,
      rating,
    };
    setStudyLogs((prev) => [newLog, ...prev]);

    // Update student streak
    setUser((prev) => {
      if (!prev) return null;
      const isToday = prev.lastStudiedDate === todayStr;
      return {
        ...prev,
        lastStudiedDate: todayStr,
        streakDays: isToday ? prev.streakDays : prev.streakDays + 1,
      };
    });
  };

  // Predictions & Advisories
  const predictions = calculatePredictions(subjects, exams, user?.dailyAvailableHours || 3.0);
  const advisories = generateWeakSubjectAdvisories(subjects, exams);

  // Overall Stats
  const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
  const completedTopics = subjects.reduce(
    (sum, s) => sum + s.topics.filter((t) => t.status === 'completed').length,
    0
  );
  const overallProgressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const totalPlannedHours = subjects.reduce(
    (sum, s) => sum + s.topics.reduce((tSum, t) => tSum + (t.estimatedHours || 0), 0),
    0
  );
  const totalCompletedHours = studyLogs.reduce((sum, l) => sum + l.hours, 0);
  const upcomingExamsCount = exams.filter((e) => {
    const diff = Math.ceil((new Date(e.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  }).length;
  const pendingAssignmentsCount = assignments.filter((a) => a.status === 'pending').length;

  // AI Generation Calls via Server Backend
  const generateAiStudyPlan = async () => {
    setIsAiGenerating(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({
            name: s.name,
            code: s.code,
            difficulty: s.difficulty,
            topicsCount: s.topics.length,
            completedCount: s.topics.filter((t) => t.status === 'completed').length,
            pendingTopics: s.topics.filter((t) => t.status !== 'completed').map((t) => t.name),
          })),
          exams: exams.map((e) => ({
            title: e.title,
            subject: subjects.find((s) => s.id === e.subjectId)?.name,
            date: e.date,
            portion: e.syllabusPortion,
          })),
          dailyHours: user?.dailyAvailableHours || 3.5,
          targetGrade: user?.targetCgpa || '8.8 CGPA',
          weakAreas: advisories.map((a) => a.subjectName).join(', '),
          collegeInfo: {
            collegeName: user?.collegeName || 'Srinivas Institute of Technology Mangalore',
            department: user?.department || 'Computer Science & Engineering',
            semester: user?.semester || 5,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        setAiPlan(data.plan);
        triggerConfetti();
      } else {
        throw new Error(data.error || 'Failed to generate study plan');
      }
    } catch (err: any) {
      console.error('AI plan error:', err);
      setAiError(err.message || 'Could not connect to AI service');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const generateAiTopicGuide = async (subjectName: string, topicName: string, difficulty: string) => {
    const res = await fetch('/api/ai/topic-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectName, topicName, difficulty }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch topic guide');
    return data.guide;
  };

  const generateAiProgressInsights = async () => {
    const res = await fetch('/api/ai/summarize-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: user?.name,
        stats: {
          completedHours: totalCompletedHours,
          totalPlannedHours,
          completedTopics,
          totalTopics,
          velocity: `${user?.dailyAvailableHours || 3.5} hrs/day`,
        },
        subjects: subjects.map((s) => ({
          name: s.name,
          progress: s.topics.length ? Math.round((s.topics.filter((t) => t.status === 'completed').length / s.topics.length) * 100) : 0,
          difficulty: s.difficulty,
        })),
        upcomingDeadlines: [
          ...exams.map((e) => ({ type: 'Exam', title: e.title, date: e.date })),
          ...assignments.filter((a) => a.status === 'pending').map((a) => ({ type: 'Assignment', title: a.title, date: a.deadline })),
        ],
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to generate progress insights');
    return data.insights;
  };

  // Module Quiz Operations
  const recordQuizAttempt = (result: QuizResult) => {
    setQuizResults((prev) => [result, ...prev]);

    setQuizModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== result.moduleId) return mod;
        const currentBest = mod.bestScore || 0;
        const newBest = Math.max(currentBest, result.percentage);
        const attempts = (mod.attemptsCount || 0) + 1;
        return {
          ...mod,
          bestScore: newBest,
          lastScore: result.percentage,
          attemptsCount: attempts,
        };
      })
    );

    if (result.percentage >= 80) {
      triggerConfetti();
    }
  };

  const generateCustomAiQuiz = async (
    subjectName: string,
    moduleTitle: string,
    questionCount: number = 5,
    difficulty: string = 'Medium'
  ): Promise<QuizQuestion[] | null> => {
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName, moduleName: moduleTitle, questionCount, difficulty }),
      });
      const data = await res.json();
      if (data.success && data.quiz?.questions) {
        return data.quiz.questions;
      }
      return null;
    } catch (e) {
      console.error('Failed to generate custom AI quiz:', e);
      return null;
    }
  };

  // ChatBOT AI Assistant & Adaptive Quiz Operations
  const startChatQuiz = async (
    sourceType?: 'pdf' | 'image' | 'topic' | 'general',
    targetTopic?: string,
    weakTopicsToTest?: string[]
  ) => {
    setIsQuizLoading(true);
    setIsChatOpen(true);

    try {
      const attachmentToUse = activeAttachment;
      const topic = targetTopic || (attachmentToUse ? attachmentToUse.name : 'Core Curriculum');
      const subject = subjects[0]?.name || 'Computer Science & Engineering';

      const res = await fetch('/api/ai/chat-quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeAttachment: attachmentToUse ? {
            type: attachmentToUse.type,
            name: attachmentToUse.name,
            mimeType: attachmentToUse.mimeType,
            data: attachmentToUse.data,
          } : undefined,
          subjectName: subject,
          topicName: topic,
          questionCount: 5,
          currentDifficulty: 'Medium',
          weakTopics: weakTopicsToTest || [],
        }),
      });

      const data = await res.json();
      const generatedQuestions: ChatQuizQuestion[] = (data.questions || []).map((q: any, i: number) => ({
        id: q.id || 'q-' + i,
        question: q.question,
        type: q.type || (q.options?.length === 2 && q.options.includes('True') ? 'true_false' : q.options?.length > 0 ? 'mcq' : 'short_answer'),
        options: q.options || [],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
        explanation: q.explanation || 'Step-by-step concept verified.',
        conceptTested: q.conceptTested || topic,
        difficulty: q.difficulty || (i === 0 ? 'Easy' : i < 3 ? 'Medium' : 'Hard'),
        pageReference: q.pageReference,
      }));

      if (generatedQuestions.length === 0) {
        throw new Error('No questions returned');
      }

      const newSession: ChatQuizSession = {
        id: 'quiz-' + Date.now(),
        title: weakTopicsToTest && weakTopicsToTest.length > 0
          ? `Adaptive Weak Topics Quiz: ${weakTopicsToTest.slice(0, 2).join(', ')}`
          : attachmentToUse
          ? `Adaptive Quiz: ${attachmentToUse.name}`
          : `Adaptive Quiz: ${topic}`,
        sourceType: sourceType || (attachmentToUse ? attachmentToUse.type : 'topic'),
        sourceName: attachmentToUse?.name,
        currentQuestionIndex: 0,
        totalQuestions: generatedQuestions.length,
        questions: generatedQuestions,
        userAnswers: [],
        score: 0,
        isComplete: false,
        strongTopics: [],
        weakTopics: weakTopicsToTest || [],
        currentDifficulty: 'Medium',
      };

      setQuizSession(newSession);

      const quizStartMsg: ChatMessage = {
        id: 'msg-quiz-' + Date.now(),
        role: 'assistant',
        text: `🧠 **Adaptive Quiz Started!**\n\nI have generated **${generatedQuestions.length} questions** based on ${attachmentToUse ? `uploaded ${attachmentToUse.type.toUpperCase()}: **${attachmentToUse.name}**` : `**${topic}**`}.\n\n- **Rule**: Answer one question at a time. I won't reveal the answer until you attempt it!\n- **Adaptive Scaling**: Questions get harder as you answer correctly, and if you struggle, I'll explain the concept simply.\n\n👇 **Question 1 of ${generatedQuestions.length} is live below!**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isQuizMessage: true,
      };

      setChatMessages((prev) => [...prev, quizStartMsg]);
    } catch (e: any) {
      console.error('Quiz start error:', e);
      const errorMsg: ChatMessage = {
        id: 'msg-quiz-err-' + Date.now(),
        role: 'assistant',
        text: `I couldn't generate the quiz questions right now (${e.message || 'network timeout'}). Please make sure your study document is uploaded or ask me directly to test you!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const submitQuizAnswer = async (questionId: string, answer: string | number) => {
    if (!quizSession || quizSession.isComplete) return;

    const currentQ = quizSession.questions[quizSession.currentQuestionIndex];
    if (!currentQ || currentQ.id !== questionId) return;

    // Check correctness
    let isCorrect = false;
    const studentAnsStr = String(answer).trim();

    if (currentQ.type === 'mcq') {
      if (typeof currentQ.correctAnswer === 'number') {
        isCorrect = Number(answer) === currentQ.correctAnswer;
      } else {
        const correctStr = String(currentQ.correctAnswer).trim().toLowerCase();
        isCorrect =
          studentAnsStr.toLowerCase() === correctStr ||
          Boolean(currentQ.options && currentQ.options[Number(answer)]?.toLowerCase() === correctStr);
      }
    } else if (currentQ.type === 'true_false') {
      const correctStr = String(currentQ.correctAnswer).trim().toLowerCase();
      isCorrect = studentAnsStr.toLowerCase() === correctStr;
    } else {
      // Short answer
      const correctStr = String(currentQ.correctAnswer).trim().toLowerCase();
      const studentLower = studentAnsStr.toLowerCase();
      isCorrect = studentLower.includes(correctStr) || correctStr.includes(studentLower) || studentLower === correctStr;
    }

    const newScore = isCorrect ? quizSession.score + 1 : quizSession.score;
    const concept = currentQ.conceptTested || 'Topic Concept';

    const updatedStrong = isCorrect
      ? Array.from(new Set([...quizSession.strongTopics, concept]))
      : quizSession.strongTopics;

    const updatedWeak = !isCorrect
      ? Array.from(new Set([...quizSession.weakTopics, concept]))
      : quizSession.weakTopics.filter((t) => t !== concept);

    // Adaptive difficulty update
    let nextDifficulty: 'Easy' | 'Medium' | 'Hard' = quizSession.currentDifficulty;
    if (isCorrect) {
      if (nextDifficulty === 'Easy') nextDifficulty = 'Medium';
      else if (nextDifficulty === 'Medium') nextDifficulty = 'Hard';
    } else {
      if (nextDifficulty === 'Hard') nextDifficulty = 'Medium';
      else if (nextDifficulty === 'Medium') nextDifficulty = 'Easy';
    }

    const record = {
      questionId: currentQ.id,
      studentAnswer: studentAnsStr,
      isCorrect,
      explanation: currentQ.explanation,
      conceptTested: concept,
    };

    const nextAnswers = [...quizSession.userAnswers, record];
    const isNowComplete = quizSession.currentQuestionIndex + 1 >= quizSession.totalQuestions;

    const updatedSession: ChatQuizSession = {
      ...quizSession,
      userAnswers: nextAnswers,
      score: newScore,
      strongTopics: updatedStrong,
      weakTopics: updatedWeak,
      currentDifficulty: nextDifficulty,
      isComplete: isNowComplete,
      currentQuestionIndex: isNowComplete
        ? quizSession.currentQuestionIndex
        : quizSession.currentQuestionIndex + 1,
    };

    setQuizSession(updatedSession);

    // Generate feedback message in chat
    const feedbackTitle = isCorrect ? '✅ **Correct! Great job!**' : '❌ **Incorrect**';
    const explanationText = isCorrect
      ? `${feedbackTitle}\n\n${currentQ.explanation}\n\n*Adaptive update: Difficulty scaled to **${nextDifficulty}**.*`
      : `${feedbackTitle}\n\n**Correct Answer**: ${
          currentQ.type === 'mcq' && typeof currentQ.correctAnswer === 'number' && currentQ.options
            ? currentQ.options[currentQ.correctAnswer] || currentQ.correctAnswer
            : currentQ.correctAnswer
        }\n\n**Explanation**: ${currentQ.explanation}\n\n*Concept to review: **${concept}**.*`;

    const feedbackMsg: ChatMessage = {
      id: 'msg-feedback-' + Date.now(),
      role: 'assistant',
      text: explanationText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuizMessage: true,
    };

    setChatMessages((prev) => [...prev, feedbackMsg]);

    if (isNowComplete) {
      const percentage = Math.round((newScore / quizSession.totalQuestions) * 100);
      if (percentage >= 80) {
        triggerConfetti();
      }

      const summaryMsg: ChatMessage = {
        id: 'msg-quiz-end-' + (Date.now() + 1),
        role: 'assistant',
        text: `🏁 **Quiz Session Complete!**\n\n📊 **Score**: ${newScore}/${quizSession.totalQuestions} (${percentage}% Accuracy)\n\n🌟 **Strong Topics**: ${updatedStrong.join(', ') || 'All attempted topics reviewed'}\n⚠️ **Needs Practice**: ${updatedWeak.join(', ') || 'None! Flawless conceptual mastery!'}\n\n${
          updatedWeak.length > 0
            ? '💡 *Click "Re-test Weak Topics" to practice questions specifically on the concepts you missed.*'
            : '🎉 *Outstanding accuracy! You are well-prepared for your SIT examinations!*'
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isQuizMessage: true,
      };

      setChatMessages((prev) => [...prev, summaryMsg]);
    }
  };

  const resetChatQuiz = () => {
    setQuizSession(null);
  };

  const sendChatMessage = async (
    text: string,
    isQuestionAnalysis: boolean = false,
    attachmentOverride?: ChatAttachment | null,
    levelOverride?: AnswerDepthLevel
  ) => {
    if (!text.trim() || isChatLoading) return;

    const attachmentToUse = attachmentOverride !== undefined ? attachmentOverride : activeAttachment;
    const currentDepth = levelOverride || answerLevel;

    // Safety pre-filter on client side: Reject 18+ / adult queries immediately
    const adultRegex = /\b(porn|pornography|xxx|nsfw|erotic|hentai|sex|nude|nudity|orgasm|penis|vagina|intercourse|hardcore|incest|dildo|horny|slut|whore)\b/i;
    if (adultRegex.test(text.trim())) {
      const userMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answerLevel: currentDepth,
      };
      const safetyMsg: ChatMessage = {
        id: 'msg-safety-' + (Date.now() + 1),
        role: 'assistant',
        text: `🛡️ **Academic Safety Policy Notice**\n\nI am **ChatBOT**, an academic study assistant dedicated exclusively to engineering, science, and educational coursework for students at Srinivas Institute of Technology (SIT), Mangalore.\n\nI strictly prohibit and do not generate **18+, adult, sexually explicit, or inappropriate content**.\n\nPlease ask an academic, engineering, mathematics, physics, chemistry, programming, or exam-preparation question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, userMsg, safetyMsg]);
      return;
    }

    const lower = text.trim().toLowerCase();
    // Intercept quiz command intent
    if (
      lower === 'quiz me' ||
      lower === 'quiz me on this' ||
      lower === 'quiz me!' ||
      lower.startsWith('quiz me') ||
      lower.includes('ask me questions from this pdf') ||
      lower.includes('test me on this chapter') ||
      lower === 'test me'
    ) {
      const userMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isQuestionAnalysis,
        attachment: attachmentToUse || undefined,
        answerLevel: currentDepth,
      };
      setChatMessages((prev) => [...prev, userMsg]);
      await startChatQuiz(attachmentToUse?.type || 'topic', attachmentToUse?.name);
      return;
    }

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuestionAnalysis,
      attachment: attachmentToUse || undefined,
      answerLevel: currentDepth,
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setIsChatLoading(true);

    try {
      const studentContext = {
        name: user?.name,
        usn: user?.usn,
        department: user?.department,
        semester: user?.semester,
        targetCgpa: user?.targetCgpa,
        subjects: subjects.map((s) => `${s.code} - ${s.name}`),
        upcoming: exams.slice(0, 3).map((e) => `${e.title} (${e.date})`),
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
          studentContext,
          isQuestionAnalysis,
          answerLevel: currentDepth,
          activeAttachment: attachmentToUse ? {
            type: attachmentToUse.type,
            name: attachmentToUse.name,
            mimeType: attachmentToUse.mimeType,
            data: attachmentToUse.data,
          } : undefined,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "I couldn't process that question right now. Please try again.";

      const aiMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isQuestionAnalysis,
        answerLevel: currentDepth,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        text: "I encountered a network issue, but here is a quick tip: Always break academic questions into core assumptions and known formulas. Feel free to re-submit your query!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => {
    const welcome: ChatMessage = {
      id: 'msg-welcome-' + Date.now(),
      role: 'assistant',
      text: `Chat cleared! How can **ChatBOT** assist your studies at Srinivas Institute of Technology today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages([welcome]);
    setQuizSession(null);
    localStorage.removeItem('sit_chat_messages');
  };

  const openAeronixWithPrompt = (promptText: string, isQuestionAnalysis: boolean = false) => {
    setIsChatOpen(true);
    sendChatMessage(promptText, isQuestionAnalysis);
  };

  const openChatBotWithPrompt = (promptText: string, isQuestionAnalysis: boolean = false) => {
    setIsChatOpen(true);
    sendChatMessage(promptText, isQuestionAnalysis);
  };

  return (
    <StudyContext.Provider
      value={{
        user,
        registeredUsers,
        demoUsers: DEMO_USERS,
        login,
        register,
        logout,
        switchUser,
        updateUserProfile,
        pdfDocuments,
        addPdfDocument,
        deletePdfDocument,
        generateProjectPdfUrl,
        generateNotesPdfUrl,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        updateTopic,
        toggleTopicCompletion,
        deleteTopic,
        exams,
        addExam,
        updateExam,
        deleteExam,
        assignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        toggleAssignmentStatus,
        availability,
        updateAvailability,
        sessions,
        addSession,
        updateSession,
        deleteSession,
        markSessionCompleted,
        markSessionMissed,
        rescheduleSession,
        regenerateSchedule,
        triggerAutoRevise,
        classTimetable,
        setClassTimetable,
        updateClassPeriod,
        loadTimetablePreset,
        studyLogs,
        logStudyHours,
        predictions,
        advisories,
        aiPlan,
        isAiGenerating,
        aiError,
        generateAiStudyPlan,
        generateAiTopicGuide,
        generateAiProgressInsights,
        // Module Quizzes
        quizModules,
        quizResults,
        recordQuizAttempt,
        generateCustomAiQuiz,
        // ChatBOT AI Assistant
        chatMessages,
        isChatLoading,
        isChatOpen,
        setIsChatOpen,
        activeAttachment,
        setActiveAttachment,
        answerLevel,
        setAnswerLevel,
        sendChatMessage,
        clearChat,
        openAeronixWithPrompt,
        openChatBotWithPrompt,
        // Adaptive Chat Quiz
        quizSession,
        isQuizLoading,
        startChatQuiz,
        submitQuizAnswer,
        resetChatQuiz,
        overallStats: {
          totalTopics,
          completedTopics,
          overallProgressPct,
          totalPlannedHours,
          totalCompletedHours,
          upcomingExamsCount,
          pendingAssignmentsCount,
        },
        triggerConfetti,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
