import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Trophy, 
  ArrowUpRight, 
  SlidersHorizontal,
  Code2,
  Sparkles,
  Zap
} from 'lucide-react';

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const problemsRes = await axiosClient.get('/problem/getAllProblem');
        setProblems(problemsRes.data || []);

        if (user) {
          try {
            const solvedRes = await axiosClient.get('/problem/problemSolvedByUser');
            setSolvedProblems(solvedRes.data || []);
          } catch {
            // ignore if solved cannot be fetched
          }
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Solved Stats calculation
  const stats = useMemo(() => {
    const total = problems.length;
    const solvedSet = new Set(solvedProblems.map(p => p._id));
    const solvedCount = solvedProblems.length;
    
    const easyTotal = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
    const easySolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;

    const medTotal = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
    const medSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;

    const hardTotal = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;
    const hardSolved = solvedProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

    const rate = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

    return { total, solvedCount, easyTotal, easySolved, medTotal, medSolved, hardTotal, hardSolved, rate };
  }, [problems, solvedProblems]);

  // Unique tags list
  const availableTags = useMemo(() => {
    const tags = new Set();
    problems.forEach(p => {
      if (p.tags) tags.add(p.tags);
    });
    return Array.from(tags);
  }, [problems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    const solvedIds = new Set(solvedProblems.map(sp => sp._id));

    return problems.filter(problem => {
      const matchesSearch = searchQuery.trim() === '' || 
        problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.tags?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = filters.difficulty === 'all' || 
        problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

      const matchesTag = filters.tag === 'all' || 
        problem.tags?.toLowerCase() === filters.tag.toLowerCase();

      const isSolved = solvedIds.has(problem._id);
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'solved' && isSolved) || 
        (filters.status === 'unsolved' && !isSolved);

      return matchesSearch && matchesDifficulty && matchesTag && matchesStatus;
    });
  }, [problems, solvedProblems, searchQuery, filters]);

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Easy</span>;
      case 'medium':
        return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">Medium</span>;
      case 'hard':
        return <span className="badge badge-sm font-semibold bg-rose-500/15 text-rose-600 border border-rose-500/20">Hard</span>;
      default:
        return <span className="badge badge-sm badge-neutral">{difficulty || 'Unknown'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-base-200/40 selection:bg-primary/30 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8 max-w-7xl">
        {/* Hero & Solved Progress Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome & Motivational Card */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 border border-base-content/10 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-primary text-xs font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Coding Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                Welcome back, {user?.firstName || 'Developer'}! 👋
              </h1>
              <p className="text-sm text-base-content/70 max-w-xl leading-relaxed">
                Sharpen your problem-solving skills with data structure challenges, track your algorithmic runtime, and conquer upcoming tests.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 relative z-10">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-base-100/70 border border-base-content/10 text-xs font-semibold">
                <Trophy className="w-4 h-4 text-warning" />
                <span>{stats.solvedCount} Solved</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-base-100/70 border border-base-content/10 text-xs font-semibold">
                <Flame className="w-4 h-4 text-error" />
                <span>{stats.rate}% Completion Rate</span>
              </div>
              <NavLink to="/tests" className="btn btn-sm btn-primary rounded-xl font-bold gap-1 ml-auto">
                <span>View My Tests</span>
                <ArrowUpRight className="w-4 h-4" />
              </NavLink>
            </div>
          </div>

          {/* Progress Breakdown Card */}
          <div className="rounded-2xl bg-base-100 border border-base-content/10 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-base-content">Solved Statistics</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-base-200 text-base-content/70">
                  {stats.solvedCount} / {stats.total}
                </span>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-3">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-600">Easy</span>
                    <span className="text-base-content/60">{stats.easySolved} / {stats.easyTotal}</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.easyTotal > 0 ? (stats.easySolved / stats.easyTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-600">Medium</span>
                    <span className="text-base-content/60">{stats.medSolved} / {stats.medTotal}</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.medTotal > 0 ? (stats.medSolved / stats.medTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-600">Hard</span>
                    <span className="text-base-content/60">{stats.hardSolved} / {stats.hardTotal}</span>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.hardTotal > 0 ? (stats.hardSolved / stats.hardTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-base-content/10 flex items-center justify-between text-xs text-base-content/60">
              <span>Overall Progress</span>
              <span className="font-bold text-primary">{stats.rate}%</span>
            </div>
          </div>
        </div>

        {/* Filter Suite & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search problems by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10 h-10 text-sm bg-base-100 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-base-content/40 hover:text-base-content"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Status Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-base-100 rounded-xl border border-base-content/10 overflow-x-auto">
              {['all', 'solved', 'unsolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilters(f => ({ ...f, status }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    filters.status === status
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-base-100 rounded-xl border border-base-content/10 overflow-x-auto">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilters(f => ({ ...f, difficulty: diff }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    filters.difficulty === diff
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Chips */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-base-content/50 font-semibold flex items-center gap-1 flex-shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Topics:
              </span>
              <button
                onClick={() => setFilters(f => ({ ...f, tag: 'all' }))}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex-shrink-0 ${
                  filters.tag === 'all'
                    ? 'bg-secondary/20 text-secondary border border-secondary/30 font-semibold'
                    : 'bg-base-100 hover:bg-base-200 text-base-content/70 border border-base-content/5'
                }`}
              >
                All Topics
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilters(f => ({ ...f, tag }))}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex-shrink-0 capitalize ${
                    filters.tag === tag
                      ? 'bg-secondary/20 text-secondary border border-secondary/30 font-semibold'
                      : 'bg-base-100 hover:bg-base-200 text-base-content/70 border border-base-content/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-base-100 rounded-2xl border border-base-content/10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-base-content">No problems found</h3>
            <p className="text-sm text-base-content/60 max-w-sm mx-auto">
              Try adjusting your search query or reset your difficulty/tag filters to explore more problems.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
              }}
              className="btn btn-sm btn-outline rounded-xl mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="bg-base-100 rounded-2xl border border-base-content/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-base-content/10 text-xs font-bold uppercase tracking-wider text-base-content/50 bg-base-200/30">
                    <th className="w-14 text-center">Status</th>
                    <th>Problem Title</th>
                    <th className="w-32">Difficulty</th>
                    <th className="w-36">Topic Tag</th>
                    <th className="w-28 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-content/5">
                  {filteredProblems.map((problem, index) => {
                    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                    return (
                      <tr 
                        key={problem._id} 
                        className="hover:bg-base-200/40 transition-colors group"
                      >
                        <td className="text-center">
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 inline-block" />
                          ) : (
                            <Circle className="w-4 h-4 text-base-content/20 inline-block" />
                          )}
                        </td>
                        <td>
                          <NavLink
                            to={`/problem/${problem._id}`}
                            className="font-semibold text-sm text-base-content hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <span>{problem.title}</span>
                          </NavLink>
                        </td>
                        <td>{getDifficultyBadge(problem.difficulty)}</td>
                        <td>
                          <span className="badge badge-sm badge-ghost text-xs capitalize">
                            {problem.tags || 'General'}
                          </span>
                        </td>
                        <td className="text-right">
                          <NavLink
                            to={`/problem/${problem._id}`}
                            className="btn btn-xs btn-primary rounded-lg font-semibold shadow-sm group-hover:scale-105 transition-transform"
                          >
                            {isSolved ? 'Review' : 'Solve'}
                          </NavLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Homepage;