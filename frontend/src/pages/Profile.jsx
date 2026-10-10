import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import {
  User, Mail, Shield, BookOpen, CheckCircle2, XCircle,
  Code2, Zap, Trophy, Layers, Calendar, GraduationCap, Flame,
  Key, X, AlertCircle
} from 'lucide-react';

const statusBadge = (status) => {
  switch (status) {
    case 'accepted':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 font-bold text-[10px]">
          <CheckCircle2 className="w-3 h-3" /> Accepted
        </span>
      );
    case 'wrong':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 font-bold text-[10px]">
          <XCircle className="w-3 h-3" /> Wrong
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-base-200 text-base-content/50 font-bold text-[10px]">
          {status}
        </span>
      );
  }
};

const roleBadge = (role) => {
  switch (role) {
    case 'admin':
      return <span className="badge badge-sm font-bold bg-purple-500/15 text-purple-600 border border-purple-500/20">Admin</span>;
    case 'faculty':
      return <span className="badge badge-sm font-bold bg-amber-500/15 text-amber-600 border border-amber-500/20">Faculty</span>;
    default:
      return <span className="badge badge-sm font-bold bg-sky-500/15 text-sky-600 border border-sky-500/20">Student</span>;
  }
};

function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Join Section Modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sectionCodeInput, setSectionCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/user/profile');
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleJoinSection = async (e) => {
    e.preventDefault();
    if (!sectionCodeInput.trim()) return;
    setJoinError(null);
    setJoinSuccess(null);

    try {
      setJoining(true);
      const { data: res } = await axiosClient.post('/section/join', {
        code: sectionCodeInput.trim()
      });
      setJoinSuccess(res.message || 'Successfully joined section!');
      setSectionCodeInput('');
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinSuccess(null);
      }, 1500);
      fetchProfile();
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join section');
    } finally {
      setJoining(false);
    }
  };

  const stats = data?.stats;
  const totalProblems = stats?.total || 0;

  // Percentage bars for donut-like display
  const easyPct = stats?.easy && totalProblems ? Math.round((stats.easy / totalProblems) * 100) : 0;
  const medPct = stats?.medium && totalProblems ? Math.round((stats.medium / totalProblems) * 100) : 0;
  const hardPct = stats?.hard && totalProblems ? Math.round((stats.hard / totalProblems) * 100) : 0;

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl space-y-6">

        <div className="pb-4 border-b border-base-content/10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">My Profile</h1>
          <p className="text-xs text-base-content/60 mt-1">Your account, progress, and activity at a glance.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error text-sm rounded-2xl">
            <span>{error}</span>
          </div>
        ) : !data ? null : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Identity Card */}
            <div className="space-y-4">

              {/* Avatar + Info */}
              <div className="relative overflow-hidden p-6 rounded-3xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-4">

                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30 text-4xl font-black text-primary-content">
                      {data.user.firstName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-extrabold text-base-content">
                        {data.user.firstName} {data.user.lastName || ''}
                      </h2>
                      {roleBadge(data.user.role)}
                    </div>
                  </div>

                  <div className="divider my-1"></div>

                  {/* Meta */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-base-content/70">
                      <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-mono text-xs truncate">{data.user.emailId}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base-content/70">
                      <Shield className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="capitalize text-xs font-semibold">{data.user.role}</span>
                    </div>
                    {data.user.section && (
                      <div className="flex items-center justify-between gap-2 text-base-content/70">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-4 h-4 text-warning flex-shrink-0" />
                          <span className="text-xs font-semibold">
                            {data.user.section.name}
                            <span className="font-mono text-base-content/40 ml-1">({data.user.section.code})</span>
                          </span>
                        </div>
                        {data.user.role === 'user' && (
                          <button
                            onClick={() => {
                              setShowJoinModal(true);
                              setJoinError(null);
                              setJoinSuccess(null);
                            }}
                            className="btn btn-ghost btn-xs text-primary font-bold hover:underline"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    )}
                    {!data.user.section && data.user.role === 'user' && (
                      <div className="flex items-center justify-between gap-2 text-base-content/50">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs italic">No section enrolled</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowJoinModal(true);
                            setJoinError(null);
                            setJoinSuccess(null);
                          }}
                          className="btn btn-xs btn-primary rounded-lg font-bold"
                        >
                          Join
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-base-content/70">
                      <Calendar className="w-4 h-4 text-info flex-shrink-0" />
                      <span className="text-xs font-semibold">
                        Joined {new Date(data.user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solved Stats */}
              {data.user.role === 'user' && (
                <div className="p-6 rounded-3xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warning" />
                    <h3 className="font-bold text-sm text-base-content">Problems Solved</h3>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-base-200" />
                        {totalProblems > 0 && (
                          <circle
                            cx="18" cy="18" r="15.9155" fill="none"
                            stroke="currentColor" strokeWidth="2.5"
                            strokeDasharray={`${Math.round((totalProblems / Math.max(totalProblems, 100)) * 100)} 100`}
                            className="text-primary transition-all duration-700"
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-base-content">{totalProblems}</span>
                        <span className="text-[9px] text-base-content/40 font-bold uppercase tracking-wider">Solved</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { label: 'Easy', count: stats?.easy || 0, color: 'bg-emerald-500', textColor: 'text-emerald-600', pct: easyPct },
                      { label: 'Medium', count: stats?.medium || 0, color: 'bg-amber-500', textColor: 'text-amber-600', pct: medPct },
                      { label: 'Hard', count: stats?.hard || 0, color: 'bg-rose-500', textColor: 'text-rose-600', pct: hardPct },
                    ].map(({ label, count, color, textColor, pct }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={`font-bold ${textColor}`}>{label}</span>
                          <span className="font-mono text-base-content/50">{count}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-base-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Activity */}
            <div className="lg:col-span-2 space-y-4">

              {/* Recent Submissions */}
              <div className="p-6 rounded-3xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-sm text-base-content">Recent Submissions</h3>
                </div>

                {data.recentSubmissions.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <Code2 className="w-10 h-10 mx-auto text-base-content/20" />
                    <p className="text-xs text-base-content/50">No submissions yet. Start solving problems!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.recentSubmissions.map((sub) => (
                      <div
                        key={sub._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.status === 'accepted' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <div>
                            <span className="text-xs font-bold text-base-content">
                              {sub.problemId?.title || 'Unknown Problem'}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-base-content/40 capitalize font-mono">{sub.language}</span>
                              <span className="text-[10px] text-base-content/30">
                                {new Date(sub.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-base-content/40 font-mono">
                            {sub.testCasesPassed}/{sub.testCasesTotal}
                          </span>
                          {statusBadge(sub.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-1">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-black text-base-content block">{data.stats.total}</span>
                  <span className="text-xs text-base-content/50 font-semibold">Problems Solved</span>
                </div>
                <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-1">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-2xl font-black text-base-content block">{data.recentSubmissions.length}</span>
                  <span className="text-xs text-base-content/50 font-semibold">Recent Activity</span>
                </div>
                <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-1">
                  <Layers className="w-5 h-5 text-secondary" />
                  <span className="text-2xl font-black text-base-content block capitalize">{data.user.role}</span>
                  <span className="text-xs text-base-content/50 font-semibold">Account Role</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Join Section Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-base-100 rounded-3xl border border-base-content/10 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-base-content">
                  {data?.user?.section ? 'Switch Academic Section' : 'Join Academic Section'}
                </h3>
              </div>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="btn btn-sm btn-ghost btn-square rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-base-content/70">
              Enter your instructor's Section Code (e.g. <span className="font-mono font-bold text-primary">CS301-A</span>) to enroll and access assigned tests.
            </p>

            {joinError && (
              <div className="alert alert-error text-xs rounded-xl py-2">
                <AlertCircle className="w-4 h-4" />
                <span>{joinError}</span>
              </div>
            )}

            {joinSuccess && (
              <div className="alert alert-success text-xs rounded-xl py-2 text-white">
                <CheckCircle2 className="w-4 h-4" />
                <span>{joinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleJoinSection} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">Section Code</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered h-12 text-sm bg-base-200/50 rounded-xl uppercase font-mono tracking-wider font-bold focus:border-primary text-center"
                  placeholder="e.g. CS301-A"
                  value={sectionCodeInput}
                  onChange={(e) => setSectionCodeInput(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn btn-sm btn-ghost rounded-xl"
                  disabled={joining}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-xl font-bold px-6 shadow-md shadow-primary/20"
                  disabled={joining || !sectionCodeInput.trim()}
                >
                  {joining ? 'Enrolling...' : 'Enroll in Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
