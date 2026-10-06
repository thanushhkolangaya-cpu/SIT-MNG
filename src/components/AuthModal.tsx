import React, { useState } from 'react';
import { X, GraduationCap, Building2, User, KeyRound, Mail, CheckCircle, Sparkles, Hash } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { parseSITUSN } from '../utils/usnHelper';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, demoUsers } = useStudy();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginCred, setLoginCred] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsn, setRegUsn] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regSemester, setRegSemester] = useState(5);
  const [regCgpa, setRegCgpa] = useState('8.50');
  const [regDailyHours, setRegDailyHours] = useState(3.5);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCred.trim()) {
      setLoginError('Please enter your SIT USN or College Email');
      return;
    }
    const res = login(loginCred, loginPassword);
    if (res.success) {
      setLoginError('');
      onClose();
    } else {
      setLoginError(res.error || 'Invalid credentials');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUsn.trim() || !regEmail.trim()) {
      setLoginError('Please fill in all required fields');
      return;
    }

    const res = register(
      {
        name: regName.trim(),
        usn: regUsn.trim().toUpperCase(),
        email: regEmail.trim(),
        department: regDept,
        semester: Number(regSemester),
        collegeName: 'Srinivas Institute of Technology, Mangalore',
        targetCgpa: regCgpa,
        dailyAvailableHours: Number(regDailyHours),
        preferredStudySlots: ['Evening (6:00 PM - 8:30 PM)', 'Night (9:30 PM - 11:30 PM)'],
      },
      regPassword || 'password123'
    );

    if (res.success) {
      setLoginError('');
      onClose();
    } else {
      setLoginError(res.error || 'Registration failed');
    }
  };

  const handleQuickDemoLogin = (emailOrUsn: string) => {
    login(emailOrUsn, 'password123');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header with SIT Mangalore Branding */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase font-bold tracking-widest text-blue-200">
              Srinivas Group of Colleges
            </span>
          </div>

          <h2 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <span>Srinivas Institute of Technology</span>
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Valachil, Mangalore • Student Study & Exam Planner Portal
          </p>

          {/* Mode Switcher */}
          <div className="flex gap-2 mt-4 bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-blue-950 shadow-xs' : 'text-blue-100 hover:text-white'
              }`}
            >
              Student Login
            </button>
            <button
              onClick={() => {
                setMode('register');
                setLoginError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-blue-950 shadow-xs' : 'text-blue-100 hover:text-white'
              }`}
            >
              New Registration
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {loginError}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SIT USN (University Seat Number) *
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={loginCred}
                    onChange={(e) => setLoginCred(e.target.value.toUpperCase())}
                    placeholder="e.g. 4SN22CS045"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-bold tracking-wider uppercase text-slate-900"
                    required
                    autoFocus
                  />
                </div>

                {/* Real-time USN Parser Feedback */}
                {(() => {
                  const parsed = parseSITUSN(loginCred);
                  if (parsed.branchName) {
                    return (
                      <div className="mt-1.5 p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          <strong>{parsed.branchName}</strong>
                          {parsed.estimatedSemester ? ` • Sem ${parsed.estimatedSemester}` : ''}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Tip: Enter your SIT USN (e.g. <strong className="font-mono text-slate-700">4SN22CS045</strong>)
                    </span>
                  );
                })()}

                {/* Quick USN buttons */}
                <div className="mt-2 flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-400">Quick:</span>
                  {['4SN22CS045', '4SN23AI018', '4SN21EC062'].map((sampleUsn) => (
                    <button
                      key={sampleUsn}
                      type="button"
                      onClick={() => {
                        setLoginCred(sampleUsn);
                        setLoginPassword('password123');
                      }}
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 border border-slate-200 cursor-pointer"
                    >
                      {sampleUsn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (Optional for Demo)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password (default: password123)"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                <Hash className="w-4 h-4" />
                <span>Login with USN: {loginCred || '4SN...'}</span>
              </button>

              {/* Demo Quick Logins */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant Quick Login Demos:</span>
                </p>
                <div className="space-y-1.5">
                  {demoUsers.map((dUser) => (
                    <button
                      key={dUser.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(dUser.usn)}
                      className="w-full text-left p-2.5 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-blue-950 group-hover:text-blue-700">
                          {dUser.name}
                        </div>
                        <div className="text-[11px] text-blue-700 font-mono">
                          USN: {dUser.usn} • Sem {dUser.semester} • {dUser.department.split(' ')[0]}
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-2xs">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rahul Shetty"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SIT USN *
                  </label>
                  <input
                    type="text"
                    value={regUsn}
                    onChange={(e) => setRegUsn(e.target.value)}
                    placeholder="4SN23CS012"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Branch
                </label>
                <select
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target CGPA
                  </label>
                  <input
                    type="text"
                    value={regCgpa}
                    onChange={(e) => setRegCgpa(e.target.value)}
                    placeholder="8.75"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Daily Study Time (hrs)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="12"
                    value={regDailyHours}
                    onChange={(e) => setRegDailyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="student@srinivasgroup.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Set Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all"
                >
                  Register & Create SIT Study Plan
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
