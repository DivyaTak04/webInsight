import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { issuesAPI, projectsAPI } from '../services/api';

// ─── Create Issue Modal ───────────────────────────────────────────────────────
function CreateIssueModal({ projects, onClose, onCreated }) {
  const [title, setTitle]       = useState('');
  const [project, setProject]   = useState(projects[0]?._id || '');
  const [page, setPage]         = useState('');
  const [element, setElement]   = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [desc, setDesc]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) { setError('Please select a project.'); return; }
    setLoading(true); setError('');
    try {
      const res = await issuesAPI.create({ title, project, page, element, severity, description: desc });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl p-8 shadow-2xl bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold text-[#323236]">Create Issue</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f0edf1]">
            <span className="material-symbols-outlined text-[#605e63]">close</span>
          </button>
        </div>
        {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#605e63] mb-2">Issue Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] focus:bg-white outline-none transition-all text-sm"
              placeholder="e.g. Misaligned Hero CTA" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#605e63] mb-2">Project *</label>
              <select value={project} onChange={e => setProject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] outline-none text-sm appearance-none cursor-pointer">
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#605e63] mb-2">Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] outline-none text-sm appearance-none cursor-pointer">
                {['High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#605e63] mb-2">Page</label>
              <input value={page} onChange={e => setPage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] outline-none text-sm"
                placeholder="e.g. Landing Page" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#605e63] mb-2">Element</label>
              <input value={element} onChange={e => setElement(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] outline-none text-sm"
                placeholder="e.g. Hero Button" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#605e63] mb-2">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] outline-none text-sm resize-none"
              placeholder="Describe the issue in detail..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#e8def8] text-[#554f63] font-semibold text-sm">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white font-semibold text-sm disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Severity styles ──────────────────────────────────────────────────────────
const sevStyle = (s) => ({
  High:   'bg-[#f97386]/20 text-[#6b0221]',
  Medium: 'bg-[#f4bfe3]/30 text-[#5f3956]',
  Low:    'bg-[#e5e1e7] text-[#605e63]',
}[s] || 'bg-[#e5e1e7] text-[#605e63]');

const statusInfo = (s) => ({
  'Open':        { text: 'text-[#605e63]', dot: 'bg-[#b3b1b7]' },
  'In Progress': { text: 'text-[#6750a5]', dot: 'bg-[#6750a5] animate-pulse' },
  'Resolved':    { text: 'text-emerald-600', dot: 'bg-emerald-500' },
}[s] || { text: 'text-[#605e63]', dot: 'bg-[#b3b1b7]' });

// ─── Issues Page ──────────────────────────────────────────────────────────────
export default function Issues() {
  const navigate = useNavigate();
  const [issues, setIssues]         = useState([]);
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterProject, setFilterProject]   = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issueRes, projRes] = await Promise.all([
          issuesAPI.getAll(),
          projectsAPI.getAll(),
        ]);
        setIssues(issueRes.data || []);
        setProjects(projRes.data || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Filtered issues ──
  const filtered = issues.filter(issue => {
    if (filterStatus   && issue.status   !== filterStatus)   return false;
    if (filterSeverity && issue.severity !== filterSeverity) return false;
    if (filterProject  && issue.project  !== filterProject && issue.project?._id !== filterProject) return false;
    return true;
  });

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdatingId(issueId);
    try {
      const res = await issuesAPI.update(issueId, { status: newStatus });
      setIssues(prev => prev.map(i => i._id === issueId ? res.data : i));
    } catch (err) {
      console.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await issuesAPI.delete(issueId);
      setIssues(prev => prev.filter(i => i._id !== issueId));
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleCreated = (issue) => setIssues(prev => [issue, ...prev]);

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const avatarColors = ['bg-[#6750a5]', 'bg-[#7b5270]', 'bg-[#625c71]', 'bg-[#4a2642]'];
  const avatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="flex bg-[#fcf8fb] min-h-screen text-[#323236]">
      <Sidebar />
      {showModal && projects.length > 0 && (
        <CreateIssueModal projects={projects} onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      <main className="ml-64 pt-24 px-8 pb-12 min-h-screen w-full">
        {/* Top Nav */}
        <header className="flex justify-between items-center w-[calc(100%-16rem)] ml-64 px-8 h-20 fixed top-0 z-40 bg-[#fcf8fb]/70 backdrop-blur-xl font-['Plus_Jakarta_Sans']">
          <div className="flex items-center bg-[#f0edf1] rounded-full px-4 py-2 w-96">
            <span className="material-symbols-outlined text-[#6750a5] mr-2">search</span>
            <input className="bg-transparent border-none focus:ring-0 w-full text-sm placeholder:opacity-50 outline-none"
              placeholder="Search issues, pages, or tags..." type="text" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 text-[#323236] opacity-70 hover:bg-[#f0edf1] transition-all rounded-full">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#b3b1b7]/20">
              <div className="w-10 h-10 rounded-full bg-[#bba2fd] flex items-center justify-center text-white font-bold text-sm">AR</div>
            </div>
          </div>
        </header>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight mb-2">Design Issues</h2>
            <p className="text-[#605e63]">
              {loading ? 'Loading...' : `${filtered.length} issue${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-[#e8def8] text-[#554f63] rounded-full font-semibold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span>Export CSV
            </button>
            <button onClick={() => projects.length > 0 ? setShowModal(true) : navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white rounded-full font-semibold shadow-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>Create Issue
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#f6f2f6] p-4 rounded-xl mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-[#605e63] text-sm font-medium pr-4 border-r border-[#b3b1b7]/30">
            <span className="material-symbols-outlined text-lg">filter_list</span>Filters
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-white border-none rounded-full px-4 py-2 text-sm text-[#605e63] outline-none cursor-pointer min-w-[140px]">
              <option value="">All Status</option>
              {['Open', 'In Progress', 'Resolved'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
              className="bg-white border-none rounded-full px-4 py-2 text-sm text-[#605e63] outline-none cursor-pointer min-w-[140px]">
              <option value="">All Severity</option>
              {['High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
              className="bg-white border-none rounded-full px-4 py-2 text-sm text-[#605e63] outline-none cursor-pointer min-w-[160px]">
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          {(filterStatus || filterSeverity || filterProject) && (
            <button onClick={() => { setFilterStatus(''); setFilterSeverity(''); setFilterProject(''); }}
              className="ml-auto text-xs text-[#6750a5] font-semibold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>Clear filters
            </button>
          )}
          {!filterStatus && !filterSeverity && !filterProject && (
            <span className="ml-auto text-xs text-[#605e63] font-medium">
              {loading ? '—' : `Showing ${filtered.length} of ${issues.length} issues`}
            </span>
          )}
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl shadow-[0_12px_32px_rgba(50,50,54,0.04)] overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#f6f2f6] text-[#605e63] text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Issue ID</th>
                <th className="px-6 py-4">Title &amp; Location</th>
                <th className="px-6 py-4 text-center">Severity</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0edf1]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-3 bg-[#f0edf1] rounded w-16"></div></td>
                    <td className="px-6 py-5"><div className="h-3 bg-[#f0edf1] rounded w-48 mb-1"></div><div className="h-2 bg-[#f6f2f6] rounded w-32"></div></td>
                    <td className="px-6 py-5 text-center"><div className="h-5 bg-[#f0edf1] rounded-full w-16 mx-auto"></div></td>
                    <td className="px-6 py-5"><div className="h-3 bg-[#f0edf1] rounded w-24"></div></td>
                    <td className="px-6 py-5"><div className="h-3 bg-[#f0edf1] rounded w-20"></div></td>
                    <td className="px-6 py-5"></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <span className="material-symbols-outlined text-[#b3b1b7] block mb-3" style={{ fontSize: '40px' }}>check_circle</span>
                    <p className="text-[#605e63] font-medium">No issues found</p>
                    <p className="text-[#b3b1b7] text-sm mt-1">
                      {projects.length === 0 ? 'Create a project first.' : 'Try adjusting your filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => {
                  const si = statusInfo(issue.status);
                  const assigneeName = issue.assignee?.name || issue.reporter?.name || 'Unassigned';
                  return (
                    <tr key={issue._id} className="hover:bg-[#f6f2f6]/50 transition-colors group">
                      <td className="px-6 py-5 align-middle">
                        <span className="text-xs font-mono font-bold text-[#6750a5]">{issue.issueId}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#323236] text-sm">{issue.title}</div>
                        <div className="text-xs text-[#605e63]">
                          {[issue.page, issue.element].filter(Boolean).join(' • ') || 'General'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${sevStyle(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${avatarColor(assigneeName)} flex items-center justify-center text-white text-[10px] font-bold`}>
                            {initials(assigneeName)}
                          </div>
                          <span className="text-sm font-medium">{assigneeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={issue.status}
                          disabled={updatingId === issue._id}
                          onChange={e => handleStatusChange(issue._id, e.target.value)}
                          className={`text-xs font-semibold ${si.text} bg-transparent border-none outline-none cursor-pointer`}>
                          {['Open', 'In Progress', 'Resolved'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleDelete(issue._id)}
                          className="p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 hover:text-red-500">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Featured Insights Banner */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-gradient-to-br from-[#6750a5] to-[#bba2fd] p-8 rounded-xl text-white relative overflow-hidden flex flex-col justify-between min-h-[260px]">
            <div className="relative z-10">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">AI Spotlight</span>
              <h3 className="text-2xl font-['Plus_Jakarta_Sans'] font-extrabold leading-tight mb-3 max-w-md">
                Let AI analyze all your issues and suggest fixes.
              </h3>
              <p className="opacity-80 text-sm mb-6">
                Run a full Gemini AI analysis across all your feedback and issues to get actionable insights.
              </p>
            </div>
            <button onClick={() => navigate('/insights')}
              className="self-start px-8 py-3 bg-white text-[#6750a5] rounded-full font-bold shadow-xl">
              Go to AI Insights
            </button>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="bg-[#eae7ec] p-8 rounded-xl flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-[#6750a5]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <h4 className="text-xl font-['Plus_Jakarta_Sans'] font-bold text-[#323236] mb-2">Bulk Actions</h4>
            <p className="text-sm text-[#605e63] mb-6">Mark multiple issues as resolved at once to keep your board clean.</p>
            <button
              onClick={() => {
                if (window.confirm('Mark all open issues as resolved?')) {
                  issues.filter(i => i.status === 'Open').forEach(i => handleStatusChange(i._id, 'Resolved'));
                }
              }}
              className="w-full py-3 bg-[#323236] text-white rounded-full font-semibold">
              Resolve All Open
            </button>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button onClick={() => projects.length > 0 ? setShowModal(true) : navigate('/dashboard')}
        className="fixed right-8 bottom-8 w-16 h-16 bg-[#6750a5] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}