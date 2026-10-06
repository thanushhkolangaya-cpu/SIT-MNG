import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  User,
  KeyRound,
  Mail,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  Calendar,
  TrendingUp,
  BrainCircuit,
  Lock,
  UserPlus,
  LogIn,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { parseSITUSN } from '../utils/usnHelper';

export const AuthPortalView: React.FC = () => {
  const { login, register, demoUsers } = useStudy();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginCred, setLoginCred] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsn, setRegUsn] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regSemester, setRegSemester] = useState(5);
  const [regCgpa, setRegCgpa] = useState('8.50');
  const [regDailyHours, setRegDailyHours] = useState(3.5);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginCred.trim()) {
      setLoginError('Please enter your SIT USN or College Email.');
      return;
    }

    const result = login(loginCred, loginPassword);
    if (!result.success) {
      setLoginError(result.error || 'Failed to login. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regUsn.trim() || !regEmail.trim()) {
      setRegError('Please fill out all mandatory fields (*).');
      return;
    }

    if (regPassword.length > 0 && regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    const result = register(
      {
        name: regName.trim(),
        usn: regUsn.trim().toUpperCase(),
        email: regEmail.trim().toLowerCase(),
        department: regDept,
        semester: Number(regSemester),
        collegeName: 'Srinivas Institute of Technology, Mangalore',
        targetCgpa: regCgpa,
        dailyAvailableHours: Number(regDailyHours),
        preferredStudySlots: ['Evening (6:00 PM - 8:30 PM)', 'Night (9:30 PM - 11:30 PM)'],
      },
      regPassword || 'password123'
    );

    if (!result.success) {
      setRegError(result.error || 'Registration failed.');
    }
  };

  const handleQuickDemoSelect = (user: (typeof demoUsers)[0]) => {
    setLoginCred(user.usn);
    setLoginPassword(user.password || 'password123');
    login(user.usn, user.password || 'password123');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-900 font-sans">
      {/* Top Header Bar */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-3 px-4 sm:px-8 border-b border-blue-800 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wide">
                  SRINIVAS INSTITUTE OF TECHNOLOGY
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-700/80 text-blue-200 rounded">
                  Mangalore
                </span>
              </div>
              <p className="text-xs text-blue-300 leading-tight">
                Valachil, Merlapadavu Campus • Academic Study Planner & Exam Portal
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-blue-200">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Srinivas Group of Colleges</span>
          </div>
        </div>
      </header>

      {/* Main Auth Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: Campus Branding & Feature Showcase */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>VTU & Autonomous Scheme Study Tracker</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Plan, Track, and Master Your Studies at <span className="text-blue-700">SIT Mangalore</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            The dedicated academic planner for Srinivas Institute of Technology engineering students. Automatically balances Internal Assessments (IA-1, IA-2), semester-end finals, lab assignments, and study hours with AI coaching.
          </p>

          {/* 4 Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto lg:mx-0 pt-2 text-left">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Dynamic Timetable</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Allocates daily study blocks around college lectures.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Curriculum Mastery</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Track topic checklists, credits, and target scores.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Predictive Grade Analytics</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Forecasts syllabus completion before exam dates.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Gemini AI Study Coach</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Exam strategy plans & instant topic cram-sheets.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Demo Student Picker Bar */}
          <div className="p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto lg:mx-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Test Login (Pre-Loaded SIT Student Profiles):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoUsers.map((dUser) => (
                <button
                  key={dUser.id}
                  onClick={() => handleQuickDemoSelect(dUser)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/70 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                    {dUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                    {dUser.usn}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.2 bg-white text-slate-700 rounded border border-slate-200">
                    Sem {dUser.semester} • {dUser.department.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Login & Registration Form Card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Tab Selector */}
            <div className="p-2 bg-slate-100 flex gap-1 border-b border-slate-200">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Student Sign In</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setRegError('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>New Registration</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* Login Form */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <span>Login with USN Number</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your Srinivas Institute of Technology University Seat Number to sign in.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SIT USN (University Seat Number) *
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={loginCred}
                        onChange={(e) => setLoginCred(e.target.value.toUpperCase())}
                        placeholder="e.g. 4SN22CS045"
                        className="w-full pl-10 pr-3 py-2.5 text-base bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-bold tracking-wider uppercase text-slate-900"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Real-time USN Parser Feedback */}
                    {(() => {
                      const parsed = parseSITUSN(loginCred);
                      if (parsed.branchName) {
                        return (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900 animate-in fade-in">
                            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <span className="font-bold text-blue-950">{parsed.branchName}</span>
                              {parsed.estimatedSemester && (
                                <span className="text-blue-700"> • Semester {parsed.estimatedSemester}</span>
                              )}
                              <span className="text-[10px] text-blue-600 block">Srinivas Institute of Technology, Mangalore</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                          <span>Format: <strong className="font-mono text-slate-700">4SN&lt;Year&gt;&lt;Branch&gt;&lt;Roll&gt;</strong></span>
                          <span className="text-slate-400">or college email</span>
                        </div>
                      );
                    })()}

                    {/* Quick USN Selector Chips */}
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Quick USN:</span>
                      {['4SN22CS045', '4SN23AI018', '4SN21EC062'].map((sampleUsn) => (
                        <button
                          key={sampleUsn}
                          type="button"
                          onClick={() => {
                            setLoginCred(sampleUsn);
                            setLoginPassword('password123');
                          }}
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            loginCred === sampleUsn
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {sampleUsn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Password (Optional for Demo)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Demo: password123
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password (default: password123)"
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Keep me logged in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login with USN: {loginCred || '4SN...'}</span>
                  </button>

                  <div className="text-center text-xs text-slate-500 pt-2">
                    Don't have an SIT student account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setLoginError('');
                      }}
                      className="font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Student Registration</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create your personalized SIT Mangalore academic profile.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Rahul Shetty"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SIT USN *
                      </label>
                      <input
                        type="text"
                        value={regUsn}
                        onChange={(e) => setRegUsn(e.target.value)}
                        placeholder="4SN22CS092"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Current Semester
                      </label>
                      <select
                        value={regSemester}
                        onChange={(e) => setRegSemester(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Branch
                    </label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                      <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                      <option value="Artificial Intelligence & Data Science">AI & Data Science (AI & DS)</option>
                      <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                      <option value="Civil Engineering">Civil Engineering (CV)</option>
                      <option value="Aeronautical Engineering">Aeronautical Engineering (AE)</option>
                      <option value="Master of Computer Applications">MCA / MBA</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Target CGPA
                      </label>
                      <input
                        type="text"
                        value={regCgpa}
                        onChange={(e) => setRegCgpa(e.target.value)}
                        placeholder="8.75"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Daily Study Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={regDailyHours}
                        onChange={(e) => setRegDailyHours(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College Email *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="student@srinivasgroup.com"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Set Password
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-type password"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Start Planning</span>
                  </button>

                  <div className="text-center text-xs text-slate-500 pt-1">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setRegError('');
                      }}
                      className="font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Sign in here
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          <strong>Srinivas Institute of Technology (SIT)</strong> • Valachil, Merlapadavu, Mangalore - 574143
        </p>
        <p className="text-slate-400 mt-0.5">
          Autonomous & VTU Affiliated Engineering College • Comprehensive Academic Study Planner
        </p>
      </footer>
    </div>
  );
};
