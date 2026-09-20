import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import {
  Trophy, CheckCircle2, XCircle, Minus, Clock, ChevronLeft,
  AlertCircle, Calendar, Zap, Award, Target
} from 'lucide-react';

const difficultyBadge = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Easy</span>;
    case 'medium':
      return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">Medium</span>;
    case 'hard':
      return <span className="badge badge-sm font-semibold bg-rose-500/15 text-rose-600 border border-rose-500/20">Hard</span>;
    default:
      return <span className="badge badge-sm badge-ghost">{difficulty || 'General'}</span>;
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'submitted':
      return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Submitted</span>;
    case 'auto-submitted':
      return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">Auto-Submitted (Time Up)</span>;
    case 'in-progress':
      return <span className="badge badge-sm font-semibold bg-sky-500/15 text-sky-600 border border-sky-500/20">In Progress</span>;
    default:
      return <span className="badge badge-sm badge-ghost">{status}</span>;
  }
};

function MyTestResult() {
  const { testId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/test/${testId}/my-result`);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [testId]);

  const scorePercent = data ? Math.round((data.score / data.total) * 100) : 0;

  const scoreColor =
    scorePercent >= 75 ? 'text-emerald-500' :
    scorePercent >= 40 ? 'text-amber-500' :
    'text-rose-500';

  const scoreBg =
    scorePercent >= 75 ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20' :
    scorePercent >= 40 ? 'from-amber-500/20 to-amber-500/5 border-amber-500/20' :
    'from-rose-500/20 to-rose-500/5 border-rose-500/20';

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-base-content/10">
          <NavLink to="/tests" className="btn btn-sm btn-ghost btn-square rounded-lg">
            <ChevronLeft className="w-5 h-5 text-base-content/70" />
          </NavLink>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              {data?.test?.title || 'Test Result'}
            </h1>
            <p className="text-xs text-base-content/60">Your personal performance report</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-sm rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : !data ? null : (
          <div className="space-y-6">

            {/* Score Hero Card */}
            <div className={`relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br ${scoreBg} border shadow-xl`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">

                {/* Score Ring */}
                <div className="flex flex-col items-center justify-center w-36 h-36 rounded-3xl bg-base-100/80 shadow-inner border border-base-content/10 mx-auto sm:mx-0 flex-shrink-0">
                  <Trophy className={`w-8 h-8 mb-1 ${scoreColor}`} />
                  <span className={`text-4xl font-black font-mono ${scoreColor}`}>
                    {data.score}/{data.total}
                  </span>
                  <span className="text-xs text-base-content/50 font-bold mt-0.5">SCORE</span>
                </div>

                {/* Meta */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-5xl font-black font-mono ${scoreColor}`}>{scorePercent}%</span>
                    {statusLabel(data.attempt?.status)}
                  </div>
                  {data.test.instructions && (
                    <p className="text-xs text-base-content/60 italic">"{data.test.instructions}"</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-base-content/60">
                    {data.attempt.startedAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Started: {new Date(data.attempt.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                    {data.attempt.submittedAt && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        Submitted: {new Date(data.attempt.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm text-center space-y-1">
                <Target className="w-5 h-5 text-primary mx-auto" />
                <span className="text-2xl font-black text-base-content">{data.total}</span>
                <span className="text-xs text-base-content/50 font-semibold block">Questions</span>
              </div>
              <div className="p-5 rounded-2xl bg-base-100 border border-emerald-500/20 shadow-sm text-center space-y-1 bg-emerald-500/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                <span className="text-2xl font-black text-emerald-600">{data.score}</span>
                <span className="text-xs text-base-content/50 font-semibold block">Solved</span>
              </div>
              <div className="p-5 rounded-2xl bg-base-100 border border-rose-500/20 shadow-sm text-center space-y-1 bg-rose-500/5">
                <XCircle className="w-5 h-5 text-rose-500 mx-auto" />
                <span className="text-2xl font-black text-rose-500">{data.total - data.score}</span>
                <span className="text-xs text-base-content/50 font-semibold block">Missed</span>
              </div>
            </div>

            {/* Per-problem Breakdown */}
            <div className="rounded-2xl bg-base-100 border border-base-content/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-base-content/10 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-sm text-base-content">Problem Breakdown</h2>
              </div>
              <div className="divide-y divide-base-content/5">
                {data.problemResults.map((p, i) => (
                  <div key={String(p.problemId)} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between hover:bg-base-200/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        p.accepted
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : p.attempted
                          ? 'bg-rose-500/15 text-rose-600'
                          : 'bg-base-200 text-base-content/30'
                      }`}>
                        {p.accepted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : p.attempted ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/40 font-bold font-mono">Q{i + 1}</span>
                          <span className="font-bold text-sm text-base-content">{p.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {difficultyBadge(p.difficulty)}
                          {p.tags && <span className="text-[10px] text-base-content/40 capitalize">{p.tags}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      {/* Test cases */}
                      {p.attempted ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs ${
                          p.accepted
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {p.accepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {p.testCasesPassed}/{p.testCasesTotal} cases
                        </div>
                      ) : (
                        <span className="text-xs text-base-content/30 italic px-3 py-1.5">Not attempted</span>
                      )}

                      {/* Language + runtime */}
                      {p.language && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-base-content/40">
                          <Zap className="w-3 h-3" />
                          <span className="capitalize">{p.language}</span>
                          {p.runtime !== null && p.runtime > 0 && (
                            <span className="font-mono">{p.runtime.toFixed(2)}s</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center pt-2">
              <NavLink to="/tests" className="btn btn-primary rounded-xl font-bold shadow-md shadow-primary/20 gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to My Assessments
              </NavLink>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default MyTestResult;
