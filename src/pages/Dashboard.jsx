import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/authcontext';
import { projectsAPI, issuesAPI } from '../services/api';

// ─── New Project Modal ────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onCreated }) {
  const [name, setName]   = useState('');
  const [url, setUrl]     = useState('');
  const [desc, setDesc]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await projectsAPI.create({ name, url, description: desc });
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
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ background: '#fff', border: '1px solid #e5e1e7' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold text-[#323236]">New Project</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f0edf1] transition-colors">
            <span className="material-symbols-outlined text-[#605e63]">close</span>
          </button>
        </div>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#605e63] mb-2">Project Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] focus:bg-white outline-none transition-all text-sm"
              placeholder="e.g. FinTech Dashboard" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#605e63] mb-2">Website URL *</label>
            <input value={url} onChange={e => setUrl(e.target.value)} required type="url"
              className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] focus:bg-white outline-none transition-all text-sm"
              placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#605e63] mb-2">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] focus:bg-white outline-none transition-all text-sm resize-none"
              placeholder="Brief description of the project..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#e8def8] text-[#554f63] font-semibold text-sm">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white font-semibold text-sm disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Status badge color ───────────────────────────────────────────────────────
const statusStyle = (s) => {
  if (s === 'in-review')  return 'bg-[#bba2fd]/20 text-[#381e72]';
  if (s === 'active')     return 'bg-green-100 text-green-800';
  if (s === 'completed')  return 'bg-[#f4bfe3] text-[#5f3956]';
  if (s === 'archived')   return 'bg-[#e5e1e7] text-[#605e63]';
  return 'bg-[#e8def8] text-[#554f63]';
};
const statusLabel = (s) => ({ 'in-review': 'In Review', active: 'Active', completed: 'Completed', archived: 'Archived' }[s] || s);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects]   = useState([]);
  const [issues, setIssues]       = useState([]);
  const [stats, setStats]         = useState({ totalProjects: 0, openIssues: 0, highPriorityIssues: 0, totalFeedback: 0 });
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projRes, issueRes, statsRes] = await Promise.all([
          projectsAPI.getAll(),
          issuesAPI.getAll(),
          projectsAPI.getStats(),
        ]);
        setProjects(projRes.data || []);
        setIssues(issueRes.data || []);
        setStats(statsRes.data || {});
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleProjectCreated = (project) => {
    setProjects(prev => [project, ...prev]);
    setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
  };

  const recentFeedbackIssues = issues.slice(0, 3);

  return (
    <div className="flex bg-[#fcf8fb] min-h-screen">
      <Sidebar />
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleProjectCreated} />}

      <main className="ml-64 min-h-screen pb-12 w-full">
        {/* Top Nav */}
        <header className="flex justify-between items-center w-full px-8 h-16 fixed top-0 z-40 bg-[#fcf8fb]/70 backdrop-blur-xl shadow-[0_12px_32px_rgba(50,50,54,0.04)] font-['Plus_Jakarta_Sans']">
          <div className="flex items-center gap-2 bg-[#f0edf1] rounded-full px-4 py-2 w-80">
            <span className="material-symbols-outlined text-[#6750a5] opacity-60" style={{ fontSize: '20px' }}>search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#323236]/40 outline-none"
              placeholder="Search projects..." type="text" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[#f0edf1] transition-all text-[#6750a5]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-[#605e63] hover:bg-[#f0edf1] transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              Sign out
            </button>
          </div>
        </header>

        <div className="pt-24 px-8 max-w-[1440px] mx-auto">
          {/* Welcome */}
          <section className="mb-10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-4xl font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight mb-2 text-[#323236]">
                  Welcome back, {user?.name?.split(' ')[0] || 'there'}.
                </h2>
                <p className="text-[#605e63] text-lg">
                  {loading ? 'Loading your workspace...' : `You have ${stats.openIssues} open issues across ${stats.totalProjects} projects.`}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="rounded-full px-6 py-3 bg-[#e8def8] text-[#554f63] font-semibold text-sm">Export Report</button>
                <button onClick={() => setShowModal(true)}
                  className="rounded-full px-6 py-3 bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white font-semibold text-sm shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Project
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Projects', value: loading ? '—' : stats.totalProjects, color: '#6750a5', sub: 'In your workspace' },
                { label: 'Open Issues', value: loading ? '—' : stats.openIssues, color: '#a8364b', sub: `${stats.highPriorityIssues} high priority` },
                { label: 'AI Recommendations', value: '08', color: '#7b5270', sub: 'Pending review', icon: 'auto_awesome' },
                { label: 'Team Activity', value: '92%', color: '#625c71', sub: 'Daily average' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-[0_12px_32px_rgba(50,50,54,0.04)]" style={{ borderLeft: `4px solid ${s.color}` }}>
                  <span className="text-[#605e63] text-sm font-medium block mb-2 uppercase tracking-wider">{s.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-['Plus_Jakarta_Sans'] font-bold" style={{ color: i === 1 ? s.color : undefined }}>{s.value}</span>
                    {s.icon && <span className="material-symbols-outlined" style={{ color: s.color, fontSize: '20px' }}>{s.icon}</span>}
                    <span className="text-xs text-[#605e63] font-medium">{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-12 gap-8">
            {/* Left: Projects */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-['Plus_Jakarta_Sans'] font-bold">Active Projects</h3>
                <button onClick={() => setShowModal(true)} className="text-[#6750a5] font-semibold text-sm hover:underline">+ New Project</button>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
                      <div className="h-40 rounded-lg bg-[#f0edf1] mb-4"></div>
                      <div className="h-4 bg-[#f0edf1] rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-[#f0edf1] rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <span className="material-symbols-outlined text-[#b3b1b7] block mb-4" style={{ fontSize: '56px' }}>folder_open</span>
                  <h4 className="font-bold text-lg mb-2 text-[#323236]">No projects yet</h4>
                  <p className="text-[#605e63] text-sm mb-6">Create your first project to start reviewing websites.</p>
                  <button onClick={() => setShowModal(true)}
                    className="px-6 py-3 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white font-semibold text-sm">
                    Create First Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.slice(0, 4).map((project) => (
                    <div key={project._id}
                      className="group bg-white rounded-xl p-5 shadow-[0_12px_32px_rgba(50,50,54,0.04)] hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => navigate('/review', { state: { project } })}>
                      <div className="h-40 rounded-lg overflow-hidden mb-4 bg-[#f0edf1] flex items-center justify-center relative">
                        <span className="material-symbols-outlined text-[#b3b1b7]" style={{ fontSize: '56px' }}>web</span>
                        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-[#6750a5] font-medium truncate block">{project.url}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white text-xs font-bold px-2 py-1 bg-[#6750a5]/80 rounded-full">Open Review</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg text-[#323236]">{project.name}</h4>
                          <p className="text-sm text-[#605e63]">
                            {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {project.openIssues || 0} open issues
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${statusStyle(project.status)}`}>
                          {statusLabel(project.status)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Progress</span><span>{project.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#eae7ec] rounded-full overflow-hidden">
                          <div className="h-full bg-[#6750a5] rounded-full transition-all" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Issues Feed */}
              <div className="bg-[#f0edf1] p-8 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold">Recent Issues</h3>
                  <button onClick={() => navigate('/issues')} className="text-[#6750a5] text-sm font-semibold hover:underline">View All</button>
                </div>
                {recentFeedbackIssues.length === 0 ? (
                  <p className="text-[#605e63] text-sm text-center py-4">No issues yet. Create a project and start reviewing!</p>
                ) : (
                  <div className="space-y-4">
                    {recentFeedbackIssues.map((issue) => (
                      <div key={issue._id} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#6750a5] flex items-center justify-center text-white font-bold text-xs">
                          {issue.reporter?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm">{issue.reporter?.name || 'Unknown'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              issue.severity === 'High' ? 'bg-red-100 text-red-700' :
                              issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#323236]">{issue.title}</p>
                          <p className="text-xs text-[#605e63] mt-1">{issue.page} · {issue.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Quick Actions */}
              <div className="bg-[#e5e1e7] p-8 rounded-xl">
                <h3 className="text-lg font-['Plus_Jakarta_Sans'] font-bold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: 'add_circle',     label: 'New Project',   iconBg: 'bg-[#bba2fd]/30', iconColor: 'text-[#6750a5]', action: () => setShowModal(true) },
                    { icon: 'rate_review',    label: 'Review',        iconBg: 'bg-[#e8def8]',    iconColor: 'text-[#625c71]', action: () => navigate('/review') },
                    { icon: 'report_problem', label: 'Issues',        iconBg: 'bg-[#f4bfe3]',    iconColor: 'text-[#7b5270]', action: () => navigate('/issues') },
                    { icon: 'auto_awesome',   label: 'AI Insights',   iconBg: 'bg-[#dcd9df]',    iconColor: 'text-[#323236]', action: () => navigate('/insights') },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl hover:bg-[#6750a5] hover:text-white transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-full ${a.iconBg} group-hover:bg-white/20 flex items-center justify-center ${a.iconColor} group-hover:text-white`}>
                        <span className="material-symbols-outlined">{a.icon}</span>
                      </div>
                      <span className="text-sm font-bold">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#6750a5] to-[#bba2fd] rounded-xl p-8 text-white">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="text-xs font-black uppercase tracking-widest">AI Suggestion</span>
                  </div>
                  <h4 className="text-xl font-['Plus_Jakarta_Sans'] font-bold mb-3 leading-tight">
                    Analyze your projects with AI
                  </h4>
                  <p className="text-sm opacity-90 mb-6 leading-relaxed">
                    Go to AI Insights to run a full Gemini analysis on your feedback and issues.
                  </p>
                  <button onClick={() => navigate('/insights')}
                    className="w-full bg-white text-[#6750a5] py-3 rounded-full font-bold text-sm shadow-xl">
                    Run AI Analysis
                  </button>
                </div>
              </div>

              {/* Stats summary */}
              <div className="bg-[#f6f2f6] p-6 rounded-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#605e63] mb-4">Issue Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'High Priority', count: stats.highPriorityIssues, color: '#a8364b', bg: 'bg-red-50' },
                    { label: 'In Progress', count: issues.filter(i => i.status === 'In Progress').length, color: '#6750a5', bg: 'bg-purple-50' },
                    { label: 'Resolved', count: issues.filter(i => i.status === 'Resolved').length, color: '#16a34a', bg: 'bg-green-50' },
                  ].map(s => (
                    <div key={s.label} className={`flex items-center justify-between p-3 rounded-xl ${s.bg}`}>
                      <span className="text-sm font-medium text-[#323236]">{s.label}</span>
                      <span className="text-sm font-bold" style={{ color: s.color }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-3xl bg-[#6750a5] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group">
        <span className="material-symbols-outlined text-3xl">add</span>
        <div className="absolute right-full mr-4 bg-[#e5e1e7] text-[#323236] px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          New Project
        </div>
      </button>
    </div>
  );
}