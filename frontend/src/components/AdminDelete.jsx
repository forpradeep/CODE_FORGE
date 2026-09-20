import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { ChevronLeft, Trash2, Search, AlertCircle } from 'lucide-react';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data || []);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this problem?')) return;
    
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.toLowerCase().includes(search.toLowerCase())
    );
  }, [problems, search]);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600">Easy</span>;
      case 'medium':
        return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600">Medium</span>;
      case 'hard':
        return <span className="badge badge-sm font-semibold bg-rose-500/15 text-rose-600">Hard</span>;
      default:
        return <span className="badge badge-sm badge-neutral">{difficulty || 'General'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <NavLink to="/admin" className="btn btn-sm btn-ghost btn-square rounded-lg">
              <ChevronLeft className="w-5 h-5 text-base-content/70" />
            </NavLink>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                Delete Problems
              </h1>
              <p className="text-xs text-base-content/60">
                Safely remove problems and test cases from the platform library.
              </p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm input-bordered rounded-xl pl-8 w-60"
            />
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-base-content/40" />
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
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-base-100 rounded-2xl border border-base-content/10 space-y-2">
            <p className="text-sm text-base-content/50">No problems found.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-base-100 border border-base-content/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="bg-base-200/50 text-xs font-bold text-base-content/60 uppercase border-b border-base-content/10">
                    <th className="w-12 text-center">#</th>
                    <th>Title</th>
                    <th className="w-32">Difficulty</th>
                    <th className="w-36">Topic Tag</th>
                    <th className="w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-content/5 text-xs">
                  {filteredProblems.map((problem, index) => (
                    <tr key={problem._id} className="hover:bg-base-200/30">
                      <td className="text-center font-mono font-bold text-base-content/50">{index + 1}</td>
                      <td className="font-semibold text-base-content">{problem.title}</td>
                      <td>{getDifficultyBadge(problem.difficulty)}</td>
                      <td>
                        <span className="badge badge-sm badge-ghost capitalize">{problem.tags}</span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(problem._id)}
                          className="btn btn-xs btn-error rounded-lg font-bold gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDelete;