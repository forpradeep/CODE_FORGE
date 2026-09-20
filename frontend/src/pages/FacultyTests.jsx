import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { Plus, Calendar, Clock, BookOpen, ChevronLeft, AlertCircle, CheckCircle2, ArrowRight, Search, Trash2 } from 'lucide-react';

function FacultyTests() {
  const [tests, setTests] = useState([]);
  const [sections, setSections] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [problemSearch, setProblemSearch] = useState('');

  const [form, setForm] = useState({
    title: '',
    instructions: '',
    section: '',
    problems: [],
    startTime: '',
    endTime: '',
    durationMinutes: 60
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [testsRes, sectionsRes, problemsRes] = await Promise.all([
        axiosClient.get('/test/mine'),
        axiosClient.get('/section/mine'),
        axiosClient.get('/problem/getAllProblem')
      ]);
      setTests(testsRes.data || []);
      setSections(sectionsRes.data || []);
      setProblems(problemsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDeleteTest = async (testId) => {
    if (!confirm('Delete this test? All student attempts will also be deleted.')) return;
    try {
      await axiosClient.delete(`/test/${testId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete test');
    }
  };

  const toggleProblem = (problemId) => {
    setForm((f) => ({
      ...f,
      problems: f.problems.includes(problemId)
        ? f.problems.filter((p) => p !== problemId)
        : [...f.problems, problemId]
    }));
  };

  const filteredProblems = useMemo(() => {
    return problems.filter(p => 
      p.title?.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.tags?.toLowerCase().includes(problemSearch.toLowerCase())
    );
  }, [problems, problemSearch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (form.problems.length === 0) {
      setCreateError('Please select at least one coding problem for this test.');
      return;
    }

    try {
      setCreating(true);
      await axiosClient.post('/test/create', {
        title: form.title,
        instructions: form.instructions,
        section: form.section,
        problems: form.problems,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        durationMinutes: Number(form.durationMinutes)
      });
      setShowCreate(false);
      setForm({ title: '', instructions: '', section: '', problems: [], startTime: '', endTime: '', durationMinutes: 60 });
      fetchAll();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create test');
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return <span className="badge badge-xs font-semibold bg-emerald-500/15 text-emerald-600">Easy</span>;
      case 'medium':
        return <span className="badge badge-xs font-semibold bg-amber-500/15 text-amber-600">Medium</span>;
      case 'hard':
        return <span className="badge badge-xs font-semibold bg-rose-500/15 text-rose-600">Hard</span>;
      default:
        return <span className="badge badge-xs badge-ghost">{difficulty || 'General'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <NavLink to="/faculty" className="btn btn-sm btn-ghost btn-square rounded-lg">
              <ChevronLeft className="w-5 h-5 text-base-content/70" />
            </NavLink>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                Faculty Tests & Exams
              </h1>
              <p className="text-xs text-base-content/60">
                Schedule timed coding tests and grade student submissions.
              </p>
            </div>
          </div>

          <button 
            className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 shadow-md shadow-primary/20"
            onClick={() => setShowCreate(!showCreate)}
          >
            <Plus className="w-4 h-4" />
            <span>{showCreate ? 'Cancel' : 'New Assessment'}</span>
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Create Test Modal Card */}
        {showCreate && (
          <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-base-content">Configure Assessment</h3>
            {createError && (
              <div className="alert alert-error text-xs rounded-xl py-2">
                <span>{createError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-semibold">Test Title</span></label>
                <input
                  className="input input-bordered h-10 text-sm bg-base-200/50 rounded-xl"
                  placeholder="e.g. Midterm Lab Exam - Binary Trees"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-semibold">Target Section</span></label>
                <select
                  className="select select-bordered h-10 min-h-0 text-sm bg-base-200/50 rounded-xl"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  required
                >
                  <option value="" disabled>Select cohort / section</option>
                  {sections.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs font-semibold">Instructions for Candidates</span></label>
              <textarea
                className="textarea textarea-bordered text-xs rounded-xl bg-base-200/50"
                rows={2}
                placeholder="Important rules, forbidden libraries, or scoring guidelines..."
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>

            {/* Problem Multi-Selector */}
            <div className="form-control space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="label py-0">
                  <span className="label-text text-xs font-semibold">
                    Select Problems ({form.problems.length} Selected)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Search problem library..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className="input input-xs input-bordered rounded-lg w-48"
                />
              </div>

              <div className="border border-base-content/10 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1 bg-base-200/40">
                {filteredProblems.map((p) => {
                  const selected = form.problems.includes(p._id);
                  return (
                    <label 
                      key={p._id} 
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        selected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-base-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs checkbox-primary rounded"
                          checked={selected}
                          onChange={() => toggleProblem(p._id)}
                        />
                        <span className="text-xs font-semibold text-base-content">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDifficultyBadge(p.difficulty)}
                        <span className="text-[10px] text-base-content/50 capitalize">{p.tags}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-semibold">Start Window</span></label>
                <input
                  type="datetime-local"
                  className="input input-bordered h-10 text-xs bg-base-200/50 rounded-xl"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-semibold">End Window</span></label>
                <input
                  type="datetime-local"
                  className="input input-bordered h-10 text-xs bg-base-200/50 rounded-xl"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-semibold">Student Duration (Mins)</span></label>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered h-10 text-xs bg-base-200/50 rounded-xl"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowCreate(false)}
                className="btn btn-sm btn-ghost rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-sm btn-primary rounded-xl font-bold" 
                disabled={creating}
              >
                {creating ? 'Scheduling...' : 'Schedule Test'}
              </button>
            </div>
          </form>
        )}

        {/* Tests List */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 px-4 bg-base-100 rounded-2xl border border-base-content/10 space-y-3">
            <Calendar className="w-12 h-12 mx-auto text-base-content/30" />
            <h3 className="font-bold text-lg">No tests scheduled yet</h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              Click "New Assessment" above to schedule a timed test for your students.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <div 
                key={test._id} 
                className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg text-base-content">{test.title}</h2>
                    <span className="badge badge-sm badge-outline font-semibold">
                      {test.section?.name || 'Assigned Section'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {new Date(test.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} – {new Date(test.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      {test.durationMinutes} Mins Duration
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-warning" />
                      {test.problems?.length || 0} Questions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <NavLink 
                    to={`/faculty/tests/${test._id}/results`} 
                    className="btn btn-sm btn-primary rounded-xl font-bold gap-1 shadow-md shadow-primary/20"
                  >
                    <span>View Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NavLink>
                  <button
                    className="btn btn-sm btn-ghost btn-square rounded-xl text-error hover:bg-error/10"
                    onClick={() => handleDeleteTest(test._id)}
                    title="Delete test"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FacultyTests;
