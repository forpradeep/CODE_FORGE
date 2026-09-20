import { useEffect, useRef, useState } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Code2, Send } from 'lucide-react';

const formatTime = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
};

function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const tickRef = useRef(null);

  const loadAttempt = async () => {
    try {
      const { data } = await axiosClient.get(`/test/${testId}/attempt`);
      setState(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attempt');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await axiosClient.post(`/test/${testId}/start`);
        await loadAttempt();
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to start this test');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [testId]);

  useEffect(() => {
    if (!state || state.attempt?.status !== 'in-progress') return;

    tickRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev || prev.remainingSeconds <= 0) return prev;
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    const resync = setInterval(loadAttempt, 20000);

    return () => {
      clearInterval(tickRef.current);
      clearInterval(resync);
    };
  }, [state?.attempt?.status]);

  useEffect(() => {
    if (state?.remainingSeconds === 0 && state.attempt?.status === 'in-progress') {
      loadAttempt();
    }
  }, [state?.remainingSeconds]);

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      await axiosClient.post(`/test/${testId}/submit`);
      navigate('/tests');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Easy</span>;
      case 'medium':
        return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">Medium</span>;
      case 'hard':
        return <span className="badge badge-sm font-semibold bg-rose-500/15 text-rose-600 border border-rose-500/20">Hard</span>;
      default:
        return <span className="badge badge-sm badge-neutral">{difficulty || 'General'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-base-100 gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="text-xs text-base-content/60 font-semibold tracking-wider uppercase">Loading Assessment Environment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200/40 flex flex-col">
        <Navbar />
        <div className="container mx-auto p-6 max-w-xl my-auto text-center space-y-4">
          <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-lg space-y-4">
            <AlertTriangle className="w-12 h-12 text-error mx-auto" />
            <h2 className="text-xl font-bold text-base-content">Assessment Error</h2>
            <p className="text-sm text-base-content/70">{error}</p>
            <NavLink to="/tests" className="btn btn-sm btn-primary rounded-xl">
              Back to My Tests
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  if (!state) return null;
  const isOver = state.attempt.status !== 'in-progress';
  const isUrgent = state.remainingSeconds < 300 && !isOver;

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl space-y-6">
        {/* Exam Header Banner */}
        <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <span>Assessment In Progress</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">{state.test.title}</h1>
            {state.test.instructions && (
              <p className="text-xs text-base-content/70 max-w-xl">{state.test.instructions}</p>
            )}
          </div>

          {/* Countdown Clock */}
          {!isOver && (
            <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center min-w-[150px] ${
              isUrgent 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 animate-pulse' 
                : 'bg-base-200/60 border-base-content/10 text-base-content'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time Left
              </span>
              <span className="font-mono text-2xl font-black tracking-tight mt-0.5">
                {formatTime(state.remainingSeconds)}
              </span>
            </div>
          )}
        </div>

        {isOver && (
          <div className="alert alert-info rounded-2xl">
            <CheckCircle2 className="w-5 h-5" />
            <span>This assessment has been {state.attempt.status}. All problem submissions are locked.</span>
          </div>
        )}

        {/* Problems List in this Test */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/60 px-1">
            Questions ({state.test.problems?.length || 0})
          </h2>

          <div className="grid gap-3">
            {state.test.problems.map((p, i) => (
              <NavLink
                key={p._id}
                to={isOver ? '#' : `/problem/${p._id}?testId=${testId}`}
                className={`p-4 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm flex items-center justify-between transition-all group ${
                  isOver ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/40 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-base-200 flex items-center justify-center text-xs font-bold text-base-content/70 font-mono">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <span className="text-xs text-base-content/50 capitalize">{p.tags || 'General'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getDifficultyBadge(p.difficulty)}
                  {!isOver && (
                    <span className="btn btn-xs btn-primary rounded-lg font-semibold gap-1">
                      <span>Solve</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {!isOver && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="btn btn-error rounded-xl font-bold shadow-lg shadow-error/20 gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Finalize & Submit Test</span>
            </button>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-base-100 rounded-2xl border border-base-content/10 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-error">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-lg text-base-content">Submit Entire Test?</h3>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Are you sure you want to finish and submit your test now? Once submitted, your test will be marked complete and you will not be able to edit any code.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-sm btn-ghost rounded-xl"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTest}
                className="btn btn-sm btn-error rounded-xl font-bold"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestAttempt;
