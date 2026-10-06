import { Subject, Exam, Assignment, WeeklyStudyAvailability, StudySession, Topic } from '../types';

/**
 * Calculates priority score for a topic based on exam proximity, difficulty, and progress.
 * Higher score = higher priority.
 */
export function calculateTopicUrgency(
  topic: Topic,
  subject: Subject,
  exams: Exam[],
  assignments: Assignment[]
): { score: number; reason: string; nearestExamDays: number | null } {
  if (topic.status === 'completed') {
    return { score: 0, reason: 'Already completed', nearestExamDays: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find nearest exam for this subject
  const subjectExams = exams
    .filter((e) => e.subjectId === subject.id)
    .map((e) => {
      const examDate = new Date(e.date);
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { exam: e, diffDays };
    })
    .filter((item) => item.diffDays >= 0)
    .sort((a, b) => a.diffDays - b.diffDays);

  const nearestExam = subjectExams[0];
  const daysToExam = nearestExam ? nearestExam.diffDays : 30;

  // Find nearest assignment for this subject
  const subjectAssignments = assignments
    .filter((a) => a.subjectId === subject.id && a.status === 'pending')
    .map((a) => {
      const asgDate = new Date(a.deadline);
      const diffDays = Math.ceil((asgDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { asg: a, diffDays };
    })
    .filter((item) => item.diffDays >= 0)
    .sort((a, b) => a.diffDays - b.diffDays);

  const nearestAssignment = subjectAssignments[0];

  // Base difficulty factor
  const diffMultiplier = topic.difficulty === 'Hard' ? 1.5 : topic.difficulty === 'Medium' ? 1.2 : 1.0;
  const statusMultiplier = topic.status === 'in_progress' ? 1.3 : 1.1; // finish what's started

  // Proximity factor: Closer exams boost urgency dramatically
  let proximityScore = 10;
  let reason = 'Regular study';

  if (daysToExam <= 3) {
    proximityScore = 50;
    reason = `Critical: ${nearestExam.exam.title} is in ${daysToExam} days!`;
  } else if (daysToExam <= 7) {
    proximityScore = 35;
    reason = `Upcoming ${nearestExam.exam.title} in ${daysToExam} days`;
  } else if (daysToExam <= 14) {
    proximityScore = 20;
    reason = `${nearestExam.exam.title} within two weeks`;
  }

  if (nearestAssignment && nearestAssignment.diffDays <= 4) {
    proximityScore += 15;
    reason += ` & Assignment due in ${nearestAssignment.diffDays}d`;
  }

  const finalScore = Math.round(proximityScore * diffMultiplier * statusMultiplier);
  return {
    score: finalScore,
    reason,
    nearestExamDays: nearestExam ? nearestExam.diffDays : null,
  };
}

/**
 * Generates an intelligent, balanced personalized study schedule
 * across a planning horizon (default 7 days).
 */
export function generateStudySchedule(
  subjects: Subject[],
  exams: Exam[],
  assignments: Assignment[],
  availability: WeeklyStudyAvailability,
  horizonDays: number = 7
): StudySession[] {
  const sessions: StudySession[] = [];
  const today = new Date();

  const dayKeys: (keyof WeeklyStudyAvailability)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  // Collect all pending topics with calculated urgency scores
  interface TopicWithScore {
    topic: Topic;
    subject: Subject;
    score: number;
    reason: string;
  }

  const pendingTopics: TopicWithScore[] = [];

  subjects.forEach((subject) => {
    subject.topics.forEach((topic) => {
      if (topic.status !== 'completed') {
        const { score, reason } = calculateTopicUrgency(topic, subject, exams, assignments);
        pendingTopics.push({ topic, subject, score, reason });
      }
    });
  });

  // Sort by urgency descending
  pendingTopics.sort((a, b) => b.score - a.score);

  // Time slot templates
  const eveningSlots = ['06:00 PM - 07:30 PM', '08:00 PM - 09:30 PM', '09:45 PM - 11:00 PM'];
  const weekendSlots = ['10:00 AM - 12:00 PM', '02:30 PM - 04:30 PM', '06:00 PM - 08:00 PM', '08:30 PM - 10:00 PM'];

  let topicIndex = 0;

  for (let d = 0; d < horizonDays; d++) {
    const curDate = new Date(today);
    curDate.setDate(curDate.getDate() + d);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayName = dayKeys[curDate.getDay()];
    const dailyHours = availability[dayName] || 3.0;

    // Check if there are assignments due in 1-2 days that need dedicated time
    const urgentAssignments = assignments.filter((a) => {
      if (a.status === 'submitted') return false;
      const asgDate = new Date(a.deadline);
      const diff = Math.ceil((asgDate.getTime() - curDate.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 2;
    });

    let remainingHoursForDay = dailyHours;
    let slotIdx = 0;
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;
    const slots = isWeekend ? weekendSlots : eveningSlots;

    // Allocate urgent assignment if any
    if (urgentAssignments.length > 0 && remainingHoursForDay >= 1.5) {
      const asg = urgentAssignments[0];
      const asgSubject = subjects.find((s) => s.id === asg.subjectId);
      const asgDuration = Math.min(2.0, remainingHoursForDay);
      sessions.push({
        id: `gen-asg-${d}-${asg.id}`,
        date: dateStr,
        timeSlot: slots[slotIdx % slots.length],
        subjectId: asg.subjectId,
        topicName: `${asg.title} (Assignment Prep)`,
        durationHours: asgDuration,
        status: 'scheduled',
        priority: 'Urgent',
        type: 'Assignment Work',
        notes: `Due in near term! Subject: ${asgSubject?.name || 'Course'}`,
      });
      remainingHoursForDay -= asgDuration;
      slotIdx++;
    }

    // Allocate topics until day capacity is reached
    while (remainingHoursForDay >= 1.0 && pendingTopics.length > 0) {
      const item = pendingTopics[topicIndex % pendingTopics.length];
      topicIndex++;

      const sessionDuration = Math.min(item.topic.estimatedHours || 1.5, Math.min(2.0, remainingHoursForDay));
      const isUrgent = item.score > 35;

      sessions.push({
        id: `gen-sess-${d}-${item.topic.id}-${slotIdx}`,
        date: dateStr,
        timeSlot: slots[slotIdx % slots.length],
        subjectId: item.subject.id,
        topicId: item.topic.id,
        topicName: item.topic.name,
        durationHours: Number(sessionDuration.toFixed(1)),
        status: 'scheduled',
        priority: isUrgent ? 'Urgent' : item.score > 20 ? 'High' : 'Medium',
        type: item.reason.includes('Critical') ? 'Exam Revision' : 'Topic Study',
        notes: item.reason,
      });

      remainingHoursForDay -= sessionDuration;
      slotIdx++;

      // Prevent looping infinitely if all topics visited
      if (topicIndex >= pendingTopics.length * 2) {
        break;
      }
    }
  }

  return sessions;
}

/**
 * Automatically revise schedule when student missed sessions or falls behind.
 * Reallocates unfinished tasks into upcoming days and prioritizes near exams.
 */
export function autoReviseSchedule(
  currentSessions: StudySession[],
  subjects: Subject[],
  exams: Exam[],
  assignments: Assignment[],
  availability: WeeklyStudyAvailability
): StudySession[] {
  const todayStr = new Date().toISOString().split('T')[0];

  // Keep completed sessions from past/present intact
  const completedSessions = currentSessions.filter((s) => s.status === 'completed');

  // Identify missed or incomplete sessions that need rescheduling
  const missedSessions = currentSessions.filter(
    (s) => (s.status === 'missed' || (s.date < todayStr && s.status === 'scheduled'))
  );

  // Generate a fresh proactive schedule for the next 7 days
  const freshSchedule = generateStudySchedule(subjects, exams, assignments, availability, 7);

  // Merge: Keep historical completed, add fresh revised schedule
  return [...completedSessions, ...freshSchedule];
}

/**
 * Predictive Analytics: Projects expected syllabus completion date and safe/risk status
 */
export interface SubjectPrediction {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  completedTopics: number;
  remainingHours: number;
  currentVelocityHoursPerDay: number; // e.g. 1.2 hrs/day
  projectedCompletionDays: number;
  projectedCompletionDate: string;
  nearestExamTitle?: string;
  nearestExamDate?: string;
  daysUntilExam?: number;
  status: 'safe' | 'tight' | 'critical';
  recommendation: string;
}

export function calculatePredictions(
  subjects: Subject[],
  exams: Exam[],
  historicalDailyVelocity: number = 2.5
): SubjectPrediction[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return subjects.map((subject) => {
    const totalTopics = subject.topics.length;
    const completedTopics = subject.topics.filter((t) => t.status === 'completed').length;
    const remainingHours = subject.topics
      .filter((t) => t.status !== 'completed')
      .reduce((sum, t) => sum + (t.estimatedHours || 2), 0);

    // Subject share of overall velocity (proportional to credits / difficulty)
    const weight = subject.difficulty === 'Hard' ? 1.3 : subject.difficulty === 'Medium' ? 1.0 : 0.8;
    const allocatedVelocity = Math.max(0.4, Number(((historicalDailyVelocity * weight) / subjects.length).toFixed(2)));

    const projectedDays = Math.ceil(remainingHours / allocatedVelocity);
    const projDate = new Date(today);
    projDate.setDate(projDate.getDate() + projectedDays);
    const projDateStr = projDate.toISOString().split('T')[0];

    // Find nearest exam
    const subjectExams = exams
      .filter((e) => e.subjectId === subject.id)
      .map((e) => {
        const d = new Date(e.date);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { exam: e, diff };
      })
      .filter((x) => x.diff >= 0)
      .sort((a, b) => a.diff - b.diff);

    const nearestExam = subjectExams[0];
    const daysUntilExam = nearestExam ? nearestExam.diff : undefined;

    let status: 'safe' | 'tight' | 'critical' = 'safe';
    let recommendation = 'Current pace is steady. Continue following daily schedule.';

    if (daysUntilExam !== undefined) {
      const margin = daysUntilExam - projectedDays;
      if (margin < 0) {
        status = 'critical';
        const requiredVelocity = Number((remainingHours / Math.max(1, daysUntilExam)).toFixed(1));
        recommendation = `CRITICAL LAG: At current velocity you will complete syllabus ${Math.abs(margin)} days AFTER ${nearestExam.exam.title}. Increase study time to ${requiredVelocity} hrs/day!`;
      } else if (margin <= 2) {
        status = 'tight';
        recommendation = `TIGHT BUFFER: You will finish only ${margin} days before ${nearestExam.exam.title}. Suggest adding 45 mins extra on weekends.`;
      } else {
        status = 'safe';
        recommendation = `ON TRACK: Projected syllabus completion is ${margin} days ahead of ${nearestExam.exam.title}. Ample buffer for mock tests!`;
      }
    }

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalTopics,
      completedTopics,
      remainingHours,
      currentVelocityHoursPerDay: allocatedVelocity,
      projectedCompletionDays: projectedDays,
      projectedCompletionDate: projDateStr,
      nearestExamTitle: nearestExam?.exam.title,
      nearestExamDate: nearestExam?.exam.date,
      daysUntilExam,
      status,
      recommendation,
    };
  });
}

/**
 * Weak Subjects & Advisory Engine:
 * Discovers subjects with low completion + high difficulty + near exams,
 * and proposes concrete time reallocation adjustments.
 */
export interface WeakSubjectAdvisory {
  subjectId: string;
  subjectName: string;
  reason: string;
  suggestedExtraHours: number;
  actionablePlan: string;
  recommendedDays: string[];
}

export function generateWeakSubjectAdvisories(
  subjects: Subject[],
  exams: Exam[]
): WeakSubjectAdvisory[] {
  const advisories: WeakSubjectAdvisory[] = [];

  subjects.forEach((subject) => {
    const total = subject.topics.length;
    const completed = subject.topics.filter((t) => t.status === 'completed').length;
    const completionPct = total > 0 ? (completed / total) * 100 : 0;

    const subjectExams = exams.filter((e) => e.subjectId === subject.id);
    const hasNearExam = subjectExams.some((e) => {
      const diff = Math.ceil((new Date(e.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 10;
    });

    if (completionPct < 50 && (subject.difficulty === 'Hard' || hasNearExam)) {
      advisories.push({
        subjectId: subject.id,
        subjectName: subject.name,
        reason: `${subject.name} is at ${Math.round(completionPct)}% completion with ${subject.difficulty} difficulty${hasNearExam ? ' and upcoming exam within 10 days' : ''}.`,
        suggestedExtraHours: subject.difficulty === 'Hard' ? 1.5 : 1.0,
        actionablePlan: `Dedicate 90-minute focused blocks on active recall and previous SIT question papers. Eliminate passive note-copying.`,
        recommendedDays: ['Wednesday', 'Saturday', 'Sunday'],
      });
    }
  });

  return advisories;
}
