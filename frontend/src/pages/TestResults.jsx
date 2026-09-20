import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { ChevronLeft, Download, Award, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

function TestResults() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/test/${id}/results`);
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const downloadCsv = () => {
    if (!data) return;
    const header = ['Name', 'Email', 'Status', ...data.test.problems.map((p) => p.title), 'Score'];
    const rows = data.results.map((r) => [
      `${r.student.firstName} ${r.student.lastName || ''}`.trim(),
      r.student.emailId,
      r.attemptStatus,
      ...r.problems.map((p) => (p.accepted ? 'Accepted' : p.attempted ? 'Attempted' : 'Not attempted')),
      r.score
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.test.title.replace(/\s+/g, '_')}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Submitted</span>;
      case 'auto-submitted':
        return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">Auto-Submitted</span>;
      case 'in-progress':
        return <span className="badge badge-sm font-semibold bg-sky-500/15 text-sky-600 border border-sky-500/20">In Progress</span>;
      default:
        return <span className="badge badge-sm badge-ghost">Not Started</span>;
    }
  };

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-6xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <NavLink to="/faculty/tests" className="btn btn-sm btn-ghost btn-square rounded-lg">
              <ChevronLeft className="w-5 h-5 text-base-content/70" />
            </NavLink>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                {data?.test?.title || 'Test Evaluation'} — Results
              </h1>
              <p className="text-xs text-base-content/60">
                Performance breakdown and automated grading analytics.
              </p>
            </div>
          </div>

          {data && (
            <button 
              className="btn btn-sm btn-outline rounded-xl font-bold gap-1.5" 
              onClick={downloadCsv}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
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
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm">
                <span className="text-xs text-base-content/60 font-semibold block">Total Students</span>
                <span className="text-2xl font-black text-base-content mt-1 block">{data.results?.length || 0}</span>
              </div>
              <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm">
                <span className="text-xs text-base-content/60 font-semibold block">Questions in Exam</span>
                <span className="text-2xl font-black text-primary mt-1 block">{data.test?.problems?.length || 0}</span>
              </div>
              <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm">
                <span className="text-xs text-base-content/60 font-semibold block">Completed Submissions</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {data.results?.filter(r => r.attemptStatus === 'submitted' || r.attemptStatus === 'auto-submitted').length || 0}
                </span>
              </div>
            </div>

            {/* Results Table */}
            <div className="rounded-2xl bg-base-100 border border-base-content/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="bg-base-200/50 text-xs font-bold text-base-content/60 uppercase border-b border-base-content/10">
                      <th>Candidate</th>
                      <th>Status</th>
                      {data.test?.problems?.map((p, idx) => (
                        <th key={p._id} className="text-center">Q{idx + 1}: {p.title}</th>
                      ))}
                      <th className="text-right font-black">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-content/5 text-xs">
                    {data.results.map((r) => (
                      <tr key={r.student._id} className="hover:bg-base-200/30">
                        <td>
                          <div className="font-bold text-base-content">{r.student.firstName} {r.student.lastName || ''}</div>
                          <div className="text-[11px] text-base-content/50 font-mono">{r.student.emailId}</div>
                        </td>
                        <td>{getStatusBadge(r.attemptStatus)}</td>
                        {r.problems.map((p) => (
                          <td key={p.problemId} className="text-center font-mono">
                            {p.accepted ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 font-bold">
                                ✓ {p.testCasesPassed}/{p.testCasesTotal}
                              </span>
                            ) : p.attempted ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 font-bold">
                                ✗ {p.testCasesPassed}/{p.testCasesTotal}
                              </span>
                            ) : (
                              <span className="text-base-content/30">—</span>
                            )}
                          </td>
                        ))}
                        <td className="text-right font-black font-mono text-sm text-primary">
                          {r.score} / {data.test.problems.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TestResults;
