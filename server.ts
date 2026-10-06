import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Study Plan Generator Endpoint
app.post('/api/ai/generate-plan', async (req, res) => {
  try {
    const { subjects, exams, dailyHours, targetGrade, weakAreas, collegeInfo } = req.body;

    const prompt = `
You are an expert academic advisor and study planner for engineering students at ${collegeInfo?.collegeName || 'Srinivas Institute of Technology (SIT), Mangalore'}.
Generate a comprehensive, actionable study plan for this student based on the following profile:

- Department/Branch: ${collegeInfo?.department || 'Computer Science & Engineering'} (Semester ${collegeInfo?.semester || 5})
- Target Goal / Target CGPA: ${targetGrade || '8.5+ CGPA'}
- Daily Available Study Hours: ${dailyHours || 3} hours/day
- Weaker / High-Priority Areas: ${weakAreas || 'None specified'}
- Registered Subjects & Topics:
${JSON.stringify(subjects, null, 2)}
- Upcoming Internal Assessments (IA-1, IA-2, Sem-End Exams) & Assignments:
${JSON.stringify(exams, null, 2)}

Please provide a structured study strategy in JSON format with the following fields:
{
  "summary": "High-level strategy overview (2-3 sentences)",
  "weeklyAllocation": [
    {
      "day": "Monday",
      "focusSubject": "Subject Name",
      "hours": 3,
      "recommendedTopics": ["Topic 1", "Topic 2"],
      "studyTechnique": "Active Recall / Problem Solving / Diagram practice"
    }
    ... for 7 days
  ],
  "examPreparationStrategy": [
    {
      "exam": "Exam name",
      "daysRemainingRecommendation": "Specific countdown advice",
      "highYieldTopics": ["Key topic A", "Key topic B"]
    }
  ],
  "weakSubjectActionPlan": "Specific tips to improve weaker subjects with extra hours and practice methods",
  "dailyRoutineTip": "Practical advice for balancing college lectures at SIT Mangalore with self-study"
}
Return only valid JSON without markdown code fences or backticks.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Fallback clean if there are wrappers
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({ success: true, plan: parsedData });
  } catch (error: any) {
    console.error('Error generating AI study plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate study plan with AI',
    });
  }
});

// AI Topic Revision Guide & Flash Summary
app.post('/api/ai/topic-guide', async (req, res) => {
  try {
    const { subjectName, topicName, difficulty } = req.body;

    const prompt = `
Create an engineering study cram-sheet for the topic: "${topicName}" in the subject "${subjectName}" (${difficulty || 'Medium'} difficulty) for an engineering student at Srinivas Institute of Technology Mangalore.
Include:
1. Core Concept (2-3 clear sentences)
2. Key Points & Must-Remember Concepts (4-5 bullet points)
3. Likely Exam Questions / VTU & Internal Assessment Pattern
4. Quick Problem-Solving / Practical Tip
5. Recommended Study Time (e.g. 45 mins active reading + 30 mins problem solving)

Return JSON with format:
{
  "coreConcept": "...",
  "keyPoints": ["...", "..."],
  "examQuestions": ["...", "..."],
  "proTip": "...",
  "timeBreakdown": "..."
}
Return only valid JSON without markdown code fences.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({ success: true, guide: parsedData });
  } catch (error: any) {
    console.error('Error generating topic guide:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate topic guide',
    });
  }
});

// AI Progress Insights & Weekly Retrospective
app.post('/api/ai/summarize-progress', async (req, res) => {
  try {
    const { studentName, stats, subjects, upcomingDeadlines } = req.body;

    const prompt = `
The student ${studentName || 'Student'} at Srinivas Institute of Technology Mangalore has the following study stats:
- Total Study Hours Logged: ${stats?.completedHours || 0} hrs out of planned ${stats?.totalPlannedHours || 0} hrs
- Topics Completed: ${stats?.completedTopics || 0} of ${stats?.totalTopics || 0}
- Current Pace Velocity: ${stats?.velocity || 'moderate'}
- Upcoming Deadlines / Exams: ${JSON.stringify(upcomingDeadlines)}
- Subject Statuses: ${JSON.stringify(subjects?.map((s: any) => ({ name: s.name, progress: s.progress, difficulty: s.difficulty })))}

Provide an encouraging, analytical progress summary and mentor feedback.
Return JSON:
{
  "statusVerdict": "Ahead of Schedule / On Track / Needs Attention / High Alert",
  "headline": "A punchy motivating headline",
  "summaryReview": "2-3 sentences evaluating the pace and consistency",
  "strengths": ["...", "..."],
  "criticalWarnings": ["..."],
  "recommendationsForTomorrow": ["...", "..."],
  "motivationalQuote": "An inspiring engineering / learning quote"
}
Return only valid JSON without markdown fences.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({ success: true, insights: parsedData });
  } catch (error: any) {
    console.error('Error generating progress insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate progress insights',
    });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`SIT Mangalore Study Planner server running on port ${port}`);
  });
}

startServer();
