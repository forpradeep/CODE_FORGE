import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Plus, 
  Key, 
  X,
  Sparkles
} from 'lucide-react';

const statusBadge = (windowStatus) => {
  switch (windowStatus) {
    case 'active':
      return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Active Now</span>;
    case 'upcoming':
      return <span className="badge badge-sm font-semibold bg-sky-500/15 text-sky-600 border border-sky-500/20">Upcoming</span>;
    case 'ended':
      return <span className="badge badge-sm font-semibold badge-ghost">Closed</span>;
    default:
      return <span className="badge badge-sm badge-neutral">{windowStatus}</span>;
  }
};

function StudentTests() {
  const [tests, setTests] = useState([]);
  const [enrolledSection, setEnrolledSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Join Section Modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sectionCodeInput, setSectionCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [testsRes, sectionRes] = await Promise.all([
        axiosClient.get('/test/student/mine'),
        axiosClient.get('/section/student/enrolled').catch(() => ({ data: null }))
      ]);
      setTests(testsRes.data || []);
      setEnrolledSection(sectionRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinSection = async (e) => {
    e.preventDefault();
    if (!sectionCodeInput.trim()) return;
    setJoinError(null);
    setJoinSuccess(null);

    try {
      setJoining(true);
      const { data } = await axiosClient.post('/section/join', {
        code: sectionCodeInput.trim()
      });
      setJoinSuccess(data.message || 'Successfully joined section!');
      setSectionCodeInput('');
      setTimeout(() => {
        setShowJoinModal(false);
        setJoinSuccess(null);
      }, 1500);
      loadData();
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join section. Please check your code.');
    } finally {
      setJoining(false);
    }
  };

  const actionFor = (test) => {
    if (test.windowStatus === 'upcoming') {
      return (
        <button disabled className="btn btn-sm btn-disabled rounded-xl text-xs">
          Not Open Yet
        </button>
      );
    }
    if (test.attemptStatus === 'submitted' || test.attemptStatus === 'auto-submitted') {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" /> Submitted
          </span>
          <button
            className="btn btn-sm btn-outline btn-primary rounded-xl font-bold gap-1 text-xs"
            onClick={() => navigate(`/tests/${test._id}/result`)}
          >
            View Result
          </button>
        </div>
      );
    }
    if (test.windowStatus === 'ended') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base-200 text-base-content/50 font-bold text-xs">
          Expired
        </span>
      );
    }
    return (
      <button 
        className="btn btn-sm btn-primary rounded-xl font-bold gap-1 shadow-md shadow-primary/20" 
        onClick={() => navigate(`/tests/${test._id}`)}
      >
        <span>{test.attemptStatus === 'in-progress' ? 'Continue Test' : 'Start Test'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-content/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Assigned Assessments
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              Participate in faculty-assigned coding tests and timed exams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowJoinModal(true);
                setJoinError(null);
                setJoinSuccess(null);
              }}
              className="btn btn-sm btn-outline btn-primary rounded-xl font-bold gap-1.5 shadow-sm"
            >
              <Key className="w-4 h-4" />
              <span>{enrolledSection ? 'Switch Section' : 'Join Section with Code'}</span>
            </button>
          </div>
        </div>

        {/* Enrolled Section Status Banner */}
        {enrolledSection ? (
          <div className="p-4 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Enrolled Cohort</span>
                  <span className="badge badge-sm font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                    {enrolledSection.code}
                  </span>
                </div>
                <div className="font-bold text-sm text-base-content mt-0.5">
                  {enrolledSection.name}
                </div>
              </div>
            </div>

            {enrolledSection.createdBy && (
              <div className="text-xs text-base-content/60 sm:text-right">
                Instructor: <span className="font-semibold text-base-content/80">
                  {enrolledSection.createdBy.firstName} {enrolledSection.createdBy.lastName || ''}
                </span>
              </div>
            )}
          </div>
        ) : !loading && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-primary/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Not enrolled in any academic section</span>
              </div>
              <p className="text-xs text-base-content/70">
                Enter your instructor's Section Code to access tests and assignments.
              </p>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn btn-sm btn-primary rounded-xl font-bold gap-1 shadow-md shadow-primary/20"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Enter Section Code</span>
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tests List */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 px-4 bg-base-100 rounded-3xl border border-base-content/10 space-y-3">
            <Layers className="w-12 h-12 mx-auto text-base-content/30" />
            <h3 className="font-bold text-lg text-base-content">
              {enrolledSection ? 'No assessments currently scheduled' : 'No assessments assigned yet'}
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              {enrolledSection
                ? `You are enrolled in ${enrolledSection.name}. New assessments assigned by your instructor will appear here.`
                : 'Join an academic section above to receive timed tests and coding exams.'}
            </p>
            {!enrolledSection && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn btn-sm btn-primary rounded-xl font-bold mt-2"
              >
                Join Section
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <div 
                key={test._id} 
                className="p-6 rounded-3xl bg-base-100 border border-base-content/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg text-base-content">{test.title}</h2>
                    {statusBadge(test.windowStatus)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {new Date(test.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} – {new Date(test.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      {test.durationMinutes} Minutes Duration
                    </span>
                  </div>

                  {test.instructions && (
                    <p className="text-xs text-base-content/70 italic line-clamp-1 pt-1">
                      "{test.instructions}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {actionFor(test)}
                </div>
              </div>
            ))}
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
                <h3 className="font-bold text-lg text-base-content">Join Academic Section</h3>
              </div>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="btn btn-sm btn-ghost btn-square rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-base-content/70">
              Ask your instructor for your course's Section Code (e.g., <span className="font-mono font-bold text-primary">CS301-A</span>) and enter it below.
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
                  {joining ? 'Enrolling...' : 'Join Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentTests;
