import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// 18+ / Adult Content Safety Pre-Filter
const ADULT_NSFW_PATTERNS = [
  /\b(porn|pornography|xxx|nsfw|erotic|erotica|hentai|sex|nude|nudity|orgasm|boobs|penis|vagina|intercourse|hardcore|incest|fetish|striptease|webcam\s*girl|blowjob|masturbat|milf|dildo|horny|slut|whore)\b/i,
  /\b18\+\s*(content|video|pic|image|story|roleplay|chat|stuff|material)\b/i,
  /\b(adult\s*(content|video|film|movie|story|material|chat|erotica|pleasure))\b/i,
  /\b(onlyfans|playboy|redtube|xvideos|pornhub|camgirl)\b/i,
];

function containsAdultContent(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return ADULT_NSFW_PATTERNS.some((pattern) => pattern.test(text));
}

// ChatBOT Study Assistant Chatbot Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, studentContext, isQuestionAnalysis, activeAttachment, subjectFocus, answerLevel = 'graduated' } = req.body;

    // Safety Pre-Filter: Check for 18+ / Adult Content
    const lastUserMsg = (messages || []).slice(-1)[0]?.text || '';
    if (containsAdultContent(lastUserMsg)) {
      return res.json({
        success: true,
        reply: `🛡️ **Academic Safety Policy Notice**\n\nI am **ChatBOT**, an academic study assistant dedicated exclusively to engineering, science, and educational coursework for students at Srinivas Institute of Technology (SIT), Mangalore.\n\nI strictly prohibit and do not generate **18+, adult, sexually explicit, or inappropriate content**.\n\nPlease ask an academic, engineering, mathematics, physics, chemistry, programming, or exam-preparation question!`,
      });
    }

    const studentInfo = studentContext
      ? `Student Context:
- Name: ${studentContext.name || 'Student'}
- USN: ${studentContext.usn || '4SN22CS045'}
- College: Srinivas Institute of Technology (SIT), Mangalore
- Department/Semester: ${studentContext.department || 'Computer Science & Engineering'}, Semester ${studentContext.semester || 5}
- Target CGPA: ${studentContext.targetCgpa || '8.5'}
- Registered Subjects: ${(studentContext.subjects || []).join(', ') || 'Database Management Systems, Operating Systems, Computer Networks'}
- Upcoming Deadlines / Exams: ${(studentContext.upcoming || []).join(', ') || 'IA-1 in 4 days'}`
      : 'College: Srinivas Institute of Technology (SIT), Mangalore';

    let attachmentContextInstruction = '';
    if (activeAttachment) {
      if (activeAttachment.type === 'pdf') {
        attachmentContextInstruction = `
[ACTIVE PDF ATTACHMENT: "${activeAttachment.name}"]
- The student has uploaded an academic PDF study document.
- Read and deeply analyze the attached PDF thoroughly: extract key text, formulas, equations, definitions, theorem statements, and module concepts.
- Base your answers STRICTLY on the uploaded PDF when the student asks about it.
- Give accurate PAGE REFERENCES (e.g., "[Page 3]", "[Page 7, Module 2]") whenever citing concepts or quotes.
- Respond with precision to commands like:
  * "Summarize this PDF": Provide a structured executive summary, core formulas, key terms, definitions, and chapter outline.
  * "Explain this chapter": Explain concepts logically, breaking down tough parts with intuitive analogies.
  * "Find the important questions": Extract high-probability VTU / Internal Assessment exam questions directly from this PDF.
  * "Explain this topic simply": Demystify the requested concept in simple language with real-world examples.
  * "Make notes from this PDF": Provide crisp bulleted revision notes, formula tables, and high-yield exam takeaways.
`;
      } else if (activeAttachment.type === 'image') {
        attachmentContextInstruction = `
[ACTIVE IMAGE/PHOTO ATTACHMENT: "${activeAttachment.name}"]
- The student has uploaded an image (photo of textbook page, handwritten notes, question paper, diagram, mathematical/science problem, or screenshot).
- Use Vision AI and OCR to read and interpret all handwriting, printed text, numbers, equations, symbols, labels, and schematic diagrams.
- For handwritten notes: transcribe clearly and clarify any ambiguous steps.
- For math/science numerical problems: state knowns and unknowns, identify relevant formulas/theorems, and provide step-by-step derivations with final answers highlighted.
- For diagrams/circuits/flowcharts: analyze architecture, data flow, components, and practical functioning.
`;
      }
    }

    const depthDirective = answerLevel === 'basic'
      ? `DEPTH SETTING: The student requested BASIC LEVEL. Emphasize Level 1 (Intuitive Foundation, real-world analogies, and plain language explanations) while keeping technical accuracy.`
      : answerLevel === 'intermediate'
      ? `DEPTH SETTING: The student requested INTERMEDIATE LEVEL. Emphasize Level 2 (Standard engineering formulas, derivations, step-by-step algorithms, and worked numerical examples).`
      : answerLevel === 'advanced'
      ? `DEPTH SETTING: The student requested ADVANCED LEVEL. Emphasize Level 3 (Deep theoretical proofs, edge cases, asymptotic analysis, common examiner traps, and real-world system architecture).`
      : `GRADUATED ANSWER STRUCTURE (BASIC TO ADVANCED):
Structure every conceptual, engineering, or academic explanation into three progressive, clearly demarcated sections:

🟢 **Level 1: Basic / Intuitive Foundation**
- Clear conceptual summary in plain language without unnecessary jargon.
- A vivid real-world analogy (e.g., comparing Operating System scheduling to a hospital triage, or capacitance to water reservoirs).
- Core definition and practical "why it matters".

🟡 **Level 2: Intermediate Engineering & Mathematical Rigor**
- Formal definitions, standardized syllabus notations, and mathematical formulas/equations.
- Step-by-step derivation, proof, or algorithmic implementation with explanatory comments.
- A worked numerical or practical example with specified inputs, calculated steps, and verified units.

🔴 **Level 3: Advanced Depth, Edge Cases & Exam Traps**
- Advanced theoretical nuances, asymptotic time/space complexities, or boundary conditions.
- Tricky examiner traps & common student pitfalls in university/VTU/Internal Assessment examinations.
- Practical industrial or research applications.`;

    const systemPrompt = `
You are ChatBOT, an elite personal AI study assistant, problem solver, vision document analyst, and academic mentor dedicated to students at Srinivas Institute of Technology (SIT), Mangalore.

Multi-Subject Mastery:
You provide world-class, mathematically verified academic support across:
- Engineering Subjects (Computer Science, Electronics & Comm, Mechanical, Civil, AI & Data Science, IoT, Cybersecurity)
- Mathematics (Engineering Calculus, Linear Algebra, Differential Equations, Probability & Statistics, Discrete Math)
- Physics (Mechanics, Electromagnetism, Quantum & Semiconductor Physics, Optics, Thermodynamics)
- Chemistry (Engineering Chemistry, Electrochemistry, Polymers, Material Science, Organic & Inorganic)
- Programming (Python, C/C++, Java, Data Structures, DBMS, Operating Systems, Web Technologies)

STRICT ACCURACY & ANTI-HALLUCINATION RULES:
1. Every mathematical calculation, equation derivation, and technical statement MUST be 100% verified and mathematically sound.
2. Double-check all intermediate arithmetic, algebraic steps, signs, and physical units before outputting.
3. When referencing uploaded documents or photos, cite exact page numbers and quotes (e.g., "[Page 4]"). Never invent facts or hallucinate citations.
4. When writing code, ensure valid syntax, correct variable scoping, and explain time/space complexity accurately.

STRICT 18+ / ADULT CONTENT PROHIBITION (ZERO TOLERANCE):
1. You are strictly a university academic and educational study tool.
2. NEVER generate, discuss, describe, or facilitate sexually explicit, adult, 18+, NSFW, pornographic, erotic, vulgar, or violent content under any circumstance.
3. If any user asks or hints at 18+ or adult content, immediately refuse politely:
   "I am ChatBOT, an academic study assistant for Srinivas Institute of Technology. I strictly do not discuss or generate 18+ or adult content. Please ask a study-related, engineering, mathematics, or science question."
4. Ensure all examples, analogies, and quizzes remain strictly respectful, family-safe, and academic.

${depthDirective}

Your Core Missions:
1. Solving Academic & Exam Questions with absolute accuracy.
2. Question Analysis Mode:
   - Identify syllabus module & core concept.
   - Step-by-step derivation & strategy.
   - Common traps & examiner expectations for VTU / SIT Internal Assessments.
3. Explaining difficult topics simply with real-world analogies.
4. Personalized study habits, active recall, and Pomodoro cycles.
5. Summarizing notes & syllabus modules into high-yield formula cheat-sheets.
6. Assisting with assignments, code debugging, and project architecture.
7. Motivation, discipline, and study streaks.
${attachmentContextInstruction}

Tone & Style:
- Name: ChatBOT.
- Warm, sharp, supportive, and academically rigorous.
- Format responses beautifully using Markdown with clear headings, bold terms, numbered steps, bullet points, and syntax-highlighted code blocks.
- Reference Srinivas Institute of Technology (SIT), Valachil campus culture, VTU engineering schemes, and academic excellence.

${studentInfo}
${subjectFocus ? `Current Focus Subject: ${subjectFocus}` : ''}
`;

    // Process attachment inline data if present
    let cleanBase64 = '';
    let attachmentPart: any = null;
    if (activeAttachment && activeAttachment.data) {
      cleanBase64 = activeAttachment.data.replace(/^data:[^;]+;base64,/, '');
      attachmentPart = {
        inlineData: {
          mimeType: activeAttachment.mimeType || (activeAttachment.type === 'pdf' ? 'application/pdf' : 'image/jpeg'),
          data: cleanBase64,
        },
      };
    }

    const formattedHistory: any[] = (messages || []).map((m: any, index: number) => {
      const isLastUserTurn = (m.role === 'user' || !m.role) && index === messages.length - 1;
      const parts: any[] = [];
      if (isLastUserTurn && attachmentPart) {
        parts.push(attachmentPart);
      }
      parts.push({ text: m.text || m.content || '' });
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    if (formattedHistory.length === 0) {
      formattedHistory.push({
        role: 'user',
        parts: attachmentPart
          ? [attachmentPart, { text: `Please review this uploaded ${activeAttachment.type === 'pdf' ? 'PDF' : 'image'} ("${activeAttachment.name}").` }]
          : [{ text: 'Hello ChatBOT' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.25, // Lower temperature for high accuracy and factual precision
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      },
    });

    const reply = response.text || 'I am ready to help you with your studies at Srinivas Institute of Technology. What topic or question would you like to explore?';

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error in ChatBOT chat:', error);
    const lastUserMsg = req.body?.messages?.slice(-1)[0]?.text || '';
    let fallbackReply = `Hello! I'm **ChatBOT**, your personal study assistant for Srinivas Institute of Technology (SIT), Mangalore.\n\n### 🟢 Level 1: Basic / Intuitive Concept\nBreak complex problems down into first principles, identifying the physical intuition before touching equations.\n\n### 🟡 Level 2: Intermediate Engineering Method\n1. State given variables, target unknowns, and governing boundary equations.\n2. Work through the derivations step-by-step with verified units.\n3. Verify against standard VTU / SIT examination patterns.\n\n### 🔴 Level 3: Advanced Traps & Nuances\nBeware of subtle edge cases (e.g., zero-division, overflow, race conditions, or ungrounded nodes) where step marks are lost.\n\n*Feel free to ask a technical question or upload your study material!*`;

    if (lastUserMsg.toLowerCase().includes('plan')) {
      fallbackReply = `### ChatBOT Personalized Study Plan Strategy\n- **Target**: Balance daily lectures with 3-3.5 hours of focused self-study.\n- **Block 1 (6:00 PM - 7:30 PM)**: High-difficulty subject (e.g., DBMS Normalization or OS CPU Scheduling).\n- **Block 2 (8:30 PM - 9:30 PM)**: Problem solving / Assignment code.\n- **Block 3 (10:00 PM - 10:45 PM)**: Quick formula review and flashcards.\n\n*Maintain your study streak to ensure consistent IA performance!*`;
    }

    res.json({
      success: true,
      reply: fallbackReply,
      warning: error.message,
    });
  }
});

// AI ChatBOT Interactive Adaptive Quiz Generator Endpoint
app.post('/api/ai/chat-quiz/generate', async (req, res) => {
  try {
    const {
      activeAttachment,
      subjectName = 'Engineering & Science',
      topicName = 'Core Topics',
      questionCount = 5,
      currentDifficulty = 'Medium',
      weakTopics = [],
      collegeInfo,
    } = req.body;

    const parts: any[] = [];
    if (activeAttachment && activeAttachment.data) {
      const cleanBase64 = activeAttachment.data.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: activeAttachment.mimeType || (activeAttachment.type === 'pdf' ? 'application/pdf' : 'image/jpeg'),
          data: cleanBase64,
        },
      });
    }

    const weakTopicsText = weakTopics && weakTopics.length > 0
      ? `CRITICAL ADAPTIVE REQUIREMENT: The student previously struggled with these concepts: [${weakTopics.join(', ')}]. You MUST include questions specifically testing and reinforcing these weak areas with clear conceptual steps.`
      : '';

    const sourceDirective = activeAttachment
      ? `Generate questions strictly based on the attached ${activeAttachment.type === 'pdf' ? 'PDF document' : 'image'} ("${activeAttachment.name}"). Extract concepts, definitions, formulas, and problems directly from this uploaded study material. Give page references where possible.`
      : `Generate questions based on the subject "${subjectName}" and topic "${topicName}" suitable for engineering students at ${collegeInfo?.collegeName || 'Srinivas Institute of Technology (SIT), Mangalore'}.`;

    const promptText = `
You are the Quiz Master for ChatBOT at Srinivas Institute of Technology (SIT), Mangalore.
Generate an adaptive, high-yield academic quiz with exactly ${questionCount} questions.

${sourceDirective}
Starting Difficulty: ${currentDifficulty} (Questions should gradually scale or adapt from Easy to Medium to Hard).
${weakTopicsText}

Question Requirements:
- Mix of question types: Include MCQs ("mcq"), True/False ("true_false"), and Short Answer questions ("short_answer").
- DO NOT reveal answers in the question prompt.
- For MCQs: provide exactly 4 clear options (A, B, C, D) and correct index (0, 1, 2, or 3).
- For True/False: options should be ["True", "False"], and correctAnswer must be "True" or "False".
- For Short Answer: options can be empty [], and correctAnswer should be a concise, direct answer keyword or short sentence (e.g. "O(log n)", "Newton's Second Law", "Semaphore").
- Provide a clear, step-by-step explanation for every question explaining why the correct answer is right and why other choices are wrong.
- Explicitly name the "conceptTested" for tracking strong/weak topics.

Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "mcq", // "mcq" | "true_false" | "short_answer"
      "options": ["Option A", "Option B", "Option C", "Option D"], // or ["True", "False"] or []
      "correctAnswer": 0, // 0-3 for mcq, "True"/"False" for true_false, or string answer for short_answer
      "explanation": "Clear explanation of why this answer is correct...",
      "conceptTested": "Specific Concept Name",
      "difficulty": "Easy", // "Easy" | "Medium" | "Hard"
      "pageReference": "Page 2" // Optional page or section reference if from PDF
    }
  ]
}
Return only JSON without markdown fences.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
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

    res.json({ success: true, questions: parsedData.questions || [] });
  } catch (error: any) {
    console.error('Error generating adaptive chat quiz:', error);
    // Return high quality fallback questions if needed
    const fallbackQuestions = [
      {
        id: 'fb-q1',
        question: 'What is the primary objective of Database Normalization?',
        type: 'mcq',
        options: [
          'To minimize redundancy and eliminate anomalies',
          'To maximize storage space usage',
          'To increase query latency',
          'To eliminate indexing'
        ],
        correctAnswer: 0,
        explanation: 'Normalization organizes data into tables to reduce redundant data and prevent insert, update, and delete anomalies.',
        conceptTested: 'Database Normalization',
        difficulty: 'Easy'
      },
      {
        id: 'fb-q2',
        question: 'A Semaphore initialized to 1 functions as a Mutex (Mutual Exclusion lock).',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'A binary semaphore with value 1 or 0 provides mutual exclusion just like a mutex lock.',
        conceptTested: 'Operating Systems Semaphores',
        difficulty: 'Medium'
      },
      {
        id: 'fb-q3',
        question: 'What is the worst-case time complexity of QuickSort when a poorly chosen pivot is used on a sorted array?',
        type: 'short_answer',
        options: [],
        correctAnswer: 'O(n^2)',
        explanation: 'When the partition is unbalanced (e.g. picking minimum or maximum as pivot repeatedly), recurrence becomes T(n) = T(n-1) + O(n), yielding O(n^2).',
        conceptTested: 'Algorithms Complexity',
        difficulty: 'Hard'
      }
    ];

    res.json({
      success: true,
      questions: fallbackQuestions,
      warning: error.message,
    });
  }
});

// Dynamic AI Module Quiz Generator Endpoint
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { subjectName, moduleName, topicName, questionCount = 5, difficulty = 'Medium' } = req.body;

    const prompt = `
Generate an engineering module quiz for students at Srinivas Institute of Technology (SIT) Mangalore.
Subject: "${subjectName || 'Computer Science'}"
Module / Topic: "${moduleName || topicName || 'Core Curriculum'}"
Difficulty: ${difficulty}
Number of Questions: ${questionCount}

Each question should test deep conceptual understanding, internal assessment readiness, or practical problem solving.
Return JSON format with the following schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear, technically rigorous question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed step-by-step explanation why the correct answer is right and why other options are incorrect.",
      "conceptTested": "Specific concept name"
    }
  ]
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

    res.json({ success: true, quiz: parsedData });
  } catch (error: any) {
    console.error('Error generating AI module quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate module quiz',
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
