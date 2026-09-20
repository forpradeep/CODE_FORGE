import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { CheckCircle2, XCircle, Clock, Cpu, Code2, Eye, X } from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) fetchSubmissions();
  }, [problemId]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Accepted</span>;
      case 'wrong':
      case 'wrong answer':
        return <span className="badge badge-sm font-semibold bg-rose-500/15 text-rose-600 border border-rose-500/20">Wrong Answer</span>;
      case 'error':
        return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">Runtime Error</span>;
      default:
        return <span className="badge badge-sm badge-neutral capitalize">{status}</span>;
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return '0 kB';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error text-xs rounded-xl py-2 my-2">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/60">
          Your Past Submissions ({submissions.length})
        </h3>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-xs text-base-content/50 border border-dashed border-base-content/20 rounded-xl">
          <Clock className="w-6 h-6 mx-auto mb-2 text-base-content/30" />
          No submissions recorded yet for this problem.
        </div>
      ) : (
        <div className="rounded-xl border border-base-content/10 overflow-hidden bg-base-100">
          <div className="overflow-x-auto">
            <table className="table table-xs w-full">
              <thead>
                <tr className="bg-base-200/50 text-[11px] font-bold text-base-content/60 uppercase">
                  <th>Status</th>
                  <th>Language</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Date</th>
                  <th className="text-right">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-content/5">
                {submissions.map((sub, idx) => (
                  <tr key={sub._id || idx} className="hover:bg-base-200/30">
                    <td>{getStatusBadge(sub.status)}</td>
                    <td className="font-mono uppercase text-[11px]">{sub.language}</td>
                    <td className="font-mono text-[11px]">{sub.runtime || 0}s</td>
                    <td className="font-mono text-[11px]">{formatMemory(sub.memory)}</td>
                    <td className="text-[11px] text-base-content/60">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="btn btn-ghost btn-xs rounded-lg text-primary gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Inspection Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-base-100 rounded-2xl border border-base-content/10 shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b border-base-content/10 flex items-center justify-between bg-base-200/50">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Submission Code ({selectedSubmission.language})</span>
                {getStatusBadge(selectedSubmission.status)}
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="btn btn-ghost btn-xs btn-square rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-base-300">
              <pre className="font-mono text-xs text-base-content leading-relaxed">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            <div className="p-3 border-t border-base-content/10 flex justify-between items-center bg-base-200/30 text-xs text-base-content/60">
              <span>Submitted: {new Date(selectedSubmission.createdAt).toLocaleString()}</span>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="btn btn-sm btn-outline rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;