import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { Users, UserPlus, Trash2, ChevronLeft, AlertCircle, CheckCircle2, Search } from 'lucide-react';

function SectionRoster() {
  const { id } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailsText, setEmailsText] = useState('');
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [addError, setAddError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSection = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get(`/section/${id}`);
      setSection(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch section');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSection();
  }, [id]);

  const handleAddStudents = async (e) => {
    e.preventDefault();
    setAddError(null);
    setAddResult(null);
    const emails = emailsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (emails.length === 0) return;

    try {
      setAdding(true);
      const { data } = await axiosClient.post(`/section/${id}/students`, { emails });
      setAddResult(data);
      setEmailsText('');
      fetchSection();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add students');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (studentId) => {
    if (!confirm('Remove this student from the section?')) return;
    try {
      await axiosClient.delete(`/section/${id}/students/${studentId}`);
      fetchSection();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student');
    }
  };

  const filteredStudents = (section?.students || []).filter(s => 
    s.emailId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-base-content/10">
          <NavLink to="/faculty/sections" className="btn btn-sm btn-ghost btn-square rounded-lg">
            <ChevronLeft className="w-5 h-5 text-base-content/70" />
          </NavLink>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              {section?.name || 'Section Roster'}
            </h1>
            <p className="text-xs text-base-content/60">
              Section Code: <span className="font-mono font-bold">{section?.code}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-sm rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Students Form */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-base-content">Enroll Students</h3>
            </div>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Paste registered student emails (separated by commas or newlines).
            </p>

            <form onSubmit={handleAddStudents} className="space-y-3">
              {addError && <div className="alert alert-error text-xs rounded-xl py-2"><span>{addError}</span></div>}
              {addResult && (
                <div className="alert alert-info text-xs rounded-xl py-2">
                  <span>
                    Added {addResult.added}, already enrolled {addResult.alreadyInSection}
                    {addResult.notFound?.length > 0 && `, not found: ${addResult.notFound.join(', ')}`}
                  </span>
                </div>
              )}
              <textarea
                className="textarea textarea-bordered w-full text-xs font-mono rounded-xl bg-base-200/50"
                rows={4}
                placeholder={"student1@college.edu\nstudent2@college.edu"}
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn btn-sm btn-primary w-full rounded-xl font-bold" 
                disabled={adding}
              >
                {adding ? 'Adding Students...' : 'Add to Roster'}
              </button>
            </form>
          </div>

          {/* Roster List Table */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-base text-base-content">
                Enrolled Students ({section?.students?.length || 0})
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-xs input-bordered rounded-lg pl-7 pr-2"
                />
                <Search className="w-3.5 h-3.5 absolute left-2 top-1.5 text-base-content/40" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-base-content/10">
              <table className="table table-xs w-full">
                <thead>
                  <tr className="bg-base-200/50 text-[11px] font-bold text-base-content/60 uppercase">
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-content/5">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-base-200/30">
                      <td className="font-semibold text-xs text-base-content">
                        {student.firstName} {student.lastName || ''}
                      </td>
                      <td className="text-xs text-base-content/70 font-mono">{student.emailId}</td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost btn-xs text-error rounded-lg"
                          onClick={() => handleRemove(student._id)}
                          title="Remove from roster"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-xs text-base-content/50">
                        No students found in this section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SectionRoster;
