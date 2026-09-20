import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Navbar from '../components/Navbar';
import { 
  Users, 
  Plus, 
  BookOpen, 
  ArrowRight, 
  AlertCircle, 
  ChevronLeft, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Search, 
  ClipboardList, 
  GraduationCap,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

function FacultySections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create Section State
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Edit Section State
  const [editingSection, setEditingSection] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState(null);

  // Search & Copy feedback
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/section/mine');
      setSections(data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Delete this section? All enrolled students will be un-enrolled from this cohort.')) return;
    try {
      await axiosClient.delete(`/section/${sectionId}`);
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete section');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    try {
      setCreating(true);
      await axiosClient.post('/section/create', { name, code });
      setName('');
      setCode('');
      setShowCreate(false);
      fetchSections();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create section');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (section) => {
    setEditingSection(section);
    setEditName(section.name);
    setEditCode(section.code);
    setEditError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingSection) return;
    setEditError(null);
    try {
      setUpdating(true);
      await axiosClient.put(`/section/${editingSection._id}`, {
        name: editName,
        code: editCode
      });
      setEditingSection(null);
      fetchSections();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update section');
    } finally {
      setUpdating(false);
    }
  };

  // Filtered Sections
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const q = searchTerm.toLowerCase();
    return sections.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)
    );
  }, [sections, searchTerm]);

  // Aggregate stats
  const totalStudents = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.students?.length || s.studentCount || 0), 0);
  }, [sections]);

  const totalTests = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.testCount || 0), 0);
  }, [sections]);

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-content/10">
          <div className="flex items-center gap-3">
            <NavLink to="/faculty" className="btn btn-sm btn-ghost btn-square rounded-xl">
              <ChevronLeft className="w-5 h-5 text-base-content/70" />
            </NavLink>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                  Academic Sections
                </h1>
                <span className="badge badge-primary badge-sm font-bold">Faculty Portal</span>
              </div>
              <p className="text-xs text-base-content/60 mt-0.5">
                Organize class sections, issue enrollment codes, and manage student cohorts.
              </p>
            </div>
          </div>

          <button 
            className={`btn btn-sm rounded-xl font-bold gap-1.5 shadow-md transition-all ${
              showCreate ? 'btn-ghost border border-base-content/10' : 'btn-primary shadow-primary/20'
            }`}
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showCreate ? 'Close Form' : 'New Section'}</span>
          </button>
        </div>

        {/* Stats Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-base-content">{sections.length}</div>
              <div className="text-xs text-base-content/60 font-semibold uppercase tracking-wider">Total Cohorts</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-base-content">{totalStudents}</div>
              <div className="text-xs text-base-content/60 font-semibold uppercase tracking-wider">Enrolled Students</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-base-content">{totalTests}</div>
              <div className="text-xs text-base-content/60 font-semibold uppercase tracking-wider">Assigned Assessments</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-sm rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Create Section Form Drawer/Card */}
        {showCreate && (
          <form 
            onSubmit={handleCreate} 
            className="p-6 rounded-3xl bg-base-100 border border-primary/20 shadow-xl shadow-primary/5 space-y-4 relative overflow-hidden transition-all"
          >
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-base text-base-content">Create New Academic Section</h3>
              </div>
              <span className="text-xs text-base-content/50">Students can join using this section code</span>
            </div>

            {createError && (
              <div className="alert alert-error text-xs rounded-xl py-2">
                <AlertCircle className="w-4 h-4" />
                <span>{createError}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">
                    Section Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  className="input input-bordered h-11 text-sm bg-base-200/50 rounded-xl focus:border-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CS 301 - Data Structures, Section A"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">
                    Section Code <span className="text-error">*</span> (Share with students)
                  </span>
                </label>
                <input
                  className="input input-bordered h-11 text-sm bg-base-200/50 rounded-xl uppercase font-mono tracking-wider focus:border-primary"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS301-A"
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
                className="btn btn-sm btn-primary rounded-xl font-bold px-6 shadow-md shadow-primary/20" 
                disabled={creating}
              >
                {creating ? 'Saving...' : 'Create Section'}
              </button>
            </div>
          </form>
        )}

        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-100 p-3 rounded-2xl border border-base-content/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              className="input input-sm input-bordered w-full pl-9 bg-base-200/40 rounded-xl text-xs"
              placeholder="Search sections by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                onClick={() => setSearchTerm('')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-base-content/60 font-semibold px-2">
            Showing {filteredSections.length} of {sections.length} Section{sections.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Sections Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-16 px-4 bg-base-100 rounded-3xl border border-base-content/10 space-y-3">
            <Users className="w-12 h-12 mx-auto text-base-content/30" />
            <h3 className="font-bold text-lg text-base-content">
              {searchTerm ? 'No matching sections found' : 'No sections created yet'}
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              {searchTerm 
                ? 'Try refining your search query to locate your section.' 
                : 'Create your first student cohort above to assign timed tests and manage student enrollments.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="btn btn-xs btn-outline rounded-lg font-semibold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSections.map((section) => {
              const studentCount = section.students?.length || section.studentCount || 0;
              const testCount = section.testCount || 0;
              const isCopied = copiedCode === section.code;

              return (
                <div 
                  key={section._id} 
                  className="group relative p-6 rounded-3xl bg-base-100 border border-base-content/10 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header line: code badge with copy button & student badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="badge badge-md font-mono font-black bg-primary/10 text-primary border border-primary/20">
                          {section.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(section.code)}
                          className={`btn btn-xs btn-ghost btn-square rounded-lg transition-colors ${
                            isCopied ? 'text-emerald-500 bg-emerald-500/10' : 'text-base-content/50 hover:text-base-content'
                          }`}
                          title="Copy Section Code to share with students"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {isCopied && (
                          <span className="text-[10px] font-bold text-emerald-500 tracking-wide">
                            Code Copied!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-base-200 text-base-content/70">
                          <Users className="w-3.5 h-3.5" />
                          <span>{studentCount} Student{studentCount === 1 ? '' : 's'}</span>
                        </span>
                        {testCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>{testCount} Test{testCount === 1 ? '' : 's'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Section Name */}
                    <div>
                      <h2 className="text-lg font-bold text-base-content group-hover:text-primary transition-colors">
                        {section.name}
                      </h2>
                      <p className="text-[11px] text-base-content/50 font-mono mt-0.5">
                        Created {new Date(section.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-base-content/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <NavLink
                        to={`/faculty/sections/${section._id}`}
                        className="btn btn-xs btn-primary rounded-xl font-bold gap-1 shadow-sm shadow-primary/20"
                      >
                        <Users className="w-3 h-3" />
                        <span>Roster</span>
                        <ArrowRight className="w-3 h-3" />
                      </NavLink>

                      <NavLink
                        to="/faculty/tests"
                        className="btn btn-xs btn-outline rounded-xl font-semibold gap-1 text-base-content/70 hover:text-base-content"
                      >
                        <ClipboardList className="w-3 h-3" />
                        <span>Tests</span>
                      </NavLink>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-xs btn-ghost btn-square rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200"
                        onClick={() => openEditModal(section)}
                        title="Edit Section Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="btn btn-xs btn-ghost btn-square rounded-lg text-error hover:bg-error/10"
                        onClick={() => handleDeleteSection(section._id)}
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-base-100 rounded-3xl border border-base-content/10 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-base-content">Edit Section Details</h3>
              </div>
              <button 
                onClick={() => setEditingSection(null)}
                className="btn btn-sm btn-ghost btn-square rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="alert alert-error text-xs rounded-xl py-2">
                <AlertCircle className="w-4 h-4" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">Section Name</span>
                </label>
                <input
                  className="input input-bordered h-11 text-sm bg-base-200/50 rounded-xl focus:border-primary"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. CS 301 - Data Structures, Section A"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/80">Section Code</span>
                </label>
                <input
                  className="input input-bordered h-11 text-sm bg-base-200/50 rounded-xl uppercase font-mono tracking-wider focus:border-primary"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS301-A"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="btn btn-sm btn-ghost rounded-xl"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-xl font-bold px-5"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultySections;
