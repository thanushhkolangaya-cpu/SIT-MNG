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
} from '../types';
import {
  INITIAL_USER,
  INITIAL_SUBJECTS,
  INITIAL_EXAMS,
  INITIAL_ASSIGNMENTS,
  INITIAL_AVAILABILITY,
  INITIAL_SESSIONS,
  INITIAL_STUDY_LOGS,
} from '../data/mockData';
import {
  generateStudySchedule,
  autoReviseSchedule,
  calculatePredictions,
  generateWeakSubjectAdvisories,
  SubjectPrediction,
  WeakSubjectAdvisory,
} from '../utils/scheduler';

interface StudyContextType {
  user: UserProfile | null;
  allUsers: Array<{ email: string; usn: string; name: string; password?: string }>;
  login: (credential: string, password?: string) => boolean;
  register: (profile: Omit<UserProfile, 'id' | 'streakDays' | 'joinedAt'>, password?: string) => void;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

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
  markSessionCompleted: (sessionId: string, actualHours?: number) => void;
  markSessionMissed: (sessionId: string) => void;
  rescheduleSession: (sessionId: string, newDate: string, newTimeSlot?: string) => void;
  regenerateSchedule: () => void;
  triggerAutoRevise: () => void;

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

  triggerConfetti: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with SIT Mangalore mock data
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sit_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [allUsers, setAllUsers] = useState<Array<{ email: string; usn: string; name: string; password?: string }>>(() => {
    const saved = localStorage.getItem('sit_registered_users');
    if (saved) return JSON.parse(saved);
    return [
      { email: INITIAL_USER.email, usn: INITIAL_USER.usn, name: INITIAL_USER.name, password: 'password123' },
    ];
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

  // Sync state changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('sit_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sit_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sit_registered_users', JSON.stringify(allUsers));
  }, [allUsers]);

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
    localStorage.setItem('sit_study_logs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    if (aiPlan) {
      localStorage.setItem('sit_ai_plan', JSON.stringify(aiPlan));
    }
  }, [aiPlan]);

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
  const login = (credential: string, _password?: string) => {
    const cleanCred = credential.trim().toLowerCase();
    const matched = allUsers.find(
      (u) => u.email.toLowerCase() === cleanCred || u.usn.toLowerCase() === cleanCred
    );

    if (matched) {
      setUser({
        id: 'user-' + Date.now(),
        name: matched.name,
        usn: matched.usn,
        email: matched.email,
        department: 'Computer Science & Engineering',
        semester: 5,
        collegeName: 'Srinivas Institute of Technology, Mangalore',
        targetCgpa: '8.85',
        dailyAvailableHours: 3.5,
        preferredStudySlots: ['Evening (6:00 PM - 8:30 PM)', 'Night (9:30 PM - 11:30 PM)'],
        streakDays: 6,
        joinedAt: new Date().toISOString().split('T')[0],
      });
      return true;
    }

    // Allow instant login with custom credential for smooth testing
    setUser({
      id: 'user-' + Date.now(),
      name: credential.includes('@') ? credential.split('@')[0] : credential.toUpperCase(),
      usn: credential.toUpperCase().startsWith('4SN') ? credential.toUpperCase() : '4SN22CS045',
      email: credential.includes('@') ? credential : `${credential.toLowerCase()}@srinivasgroup.com`,
      department: 'Computer Science & Engineering',
      semester: 5,
      collegeName: 'Srinivas Institute of Technology, Mangalore',
      targetCgpa: '8.5',
      dailyAvailableHours: 3.5,
      preferredStudySlots: ['Evening (6:00 PM - 8:30 PM)'],
      streakDays: 1,
      joinedAt: new Date().toISOString().split('T')[0],
    });
    return true;
  };

  const register = (
    profileData: Omit<UserProfile, 'id' | 'streakDays' | 'joinedAt'>,
    password?: string
  ) => {
    const newUser: UserProfile = {
      ...profileData,
      id: 'user-' + Date.now(),
      streakDays: 1,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setUser(newUser);
    setAllUsers((prev) => [
      ...prev,
      {
        email: newUser.email,
        usn: newUser.usn,
        name: newUser.name,
        password: password || 'pass123',
      },
    ]);
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

  return (
    <StudyContext.Provider
      value={{
        user,
        allUsers,
        login,
        register,
        logout,
        updateUserProfile,
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
        markSessionCompleted,
        markSessionMissed,
        rescheduleSession,
        regenerateSchedule,
        triggerAutoRevise,
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
