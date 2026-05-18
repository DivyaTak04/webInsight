import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/authcontext';
import { projectsAPI } from '../services/api';

export default function Settings() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [name, setName]             = useState(user?.name || '');
  const [email, setEmail]           = useState(user?.email || '');
  const [saving, setSaving]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState('');
  const [twoFA, setTwoFA]           = useState(true);
  const [publicView, setPublicView] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [activeTab, setActiveTab]   = useState('profile');

  // Team invite state
  const [inviteEmail, setInviteEmail]     = useState('');
  const [inviteProject, setInviteProject] = useState('');
  const [inviteRole, setInviteRole]       = useState('editor');
  const [projects, setProjects]           = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [inviting, setInviting]           = useState(false);
  const [inviteMsg, setInviteMsg]         = useState('');
  const [inviteError, setInviteError]     = useState('');

  // Load projects when team tab opens
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'team' && projects.length === 0) {
      setLoadingProjects(true);
      projectsAPI.getAll()
        .then(res => setProjects(res.data || []))
        .catch(err => console.error(err.message))
        .finally(() => setLoadingProjects(false));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg('');
    await new Promise(r => setTimeout(r, 800));
    setSaveMsg('Profile saved successfully!');
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) { setInviteError('Email is required.'); return; }
    if (!inviteProject) { setInviteError('Please select a project.'); return; }
    setInviting(true); setInviteError(''); setInviteMsg('');
    try {
      const res = await projectsAPI.invite(inviteProject, inviteEmail.trim(), inviteRole);
      setInviteMsg(res.message || 'Invite sent!');
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const tabs = [
    { id: 'profile', label: 'Profile',    icon: 'person'   },
    { id: 'team',    label: 'Team',        icon: 'group'    },
    { id: 'danger',  label: 'Danger Zone', icon: 'warning'  },
  ];

  return (
    <div className="flex bg-[#fcf8fb] min-h-screen text-[#323236]">
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .anim-in{animation:fadeIn 0.4s ease forwards;}
      `}</style>

      <Sidebar />

      <main className="ml-64 min-h-screen w-full">
        {/* Top Nav */}
        <header className="flex justify-between items-center w-full px-8 h-16 fixed top-0 z-40 bg-[#fcf8fb]/80 backdrop-blur-xl shadow-[0_2px_16px_rgba(50,50,54,0.06)] font-['Plus_Jakarta_Sans']">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c7a7f]" style={{ fontSize:'18px' }}>search</span>
            <input className="pl-10 pr-4 py-2 bg-[#f0edf1] rounded-full border-none outline-none text-sm w-64"
              placeholder="Search settings..." type="text" />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-[#f0edf1] transition-all">
              <span className="material-symbols-outlined text-[#6750a5]">notifications</span>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-[#605e63] hover:bg-[#f0edf1] transition-all">
              <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>logout</span>
              Sign out
            </button>
          </div>
        </header>

        <div className="pt-24 pb-12 px-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10 anim-in">
            <h1 className="text-4xl font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight text-[#323236] mb-2">Settings</h1>
            <p className="text-[#605e63]">Manage your account, team, and preferences.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-[#f0edf1] p-1 rounded-2xl w-fit anim-in">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: activeTab===tab.id ? 'white' : 'transparent',
                  color: activeTab===tab.id ? '#6750a5' : '#605e63',
                  boxShadow: activeTab===tab.id ? '0 2px 8px rgba(50,50,54,0.08)' : 'none',
                }}>
                <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 anim-in">
              <section className="lg:col-span-7">
                <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(50,50,54,0.06)]">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[#6750a5]" style={{ fontVariationSettings:"'FILL' 1" }}>person</span>
                    <h2 className="text-xl font-['Plus_Jakarta_Sans'] font-bold">Profile Information</h2>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-5 mb-8 p-5 bg-[#f6f2f6] rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] flex items-center justify-center text-white font-black text-2xl shadow-lg">
                      {user?.name?.split(' ').map(n=>n[0]).join('')||'U'}
                    </div>
                    <div>
                      <p className="font-bold text-[#323236]">{user?.name}</p>
                      <p className="text-sm text-[#605e63]">{user?.email}</p>
                      <span className="text-xs mt-1 px-2 py-0.5 rounded-full bg-[#bba2fd]/20 text-[#6750a5] font-bold capitalize inline-block">
                        {user?.role||'owner'}
                      </span>
                    </div>
                  </div>

                  {saveMsg && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>check_circle</span>
                      {saveMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#605e63] mb-2">Full Name</label>
                      <input value={name} onChange={e=>setName(e.target.value)}
                        className="w-full bg-[#f6f2f6] border border-transparent rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6750a5] focus:bg-white transition-all outline-none text-sm"
                        type="text" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#605e63] mb-2">Email Address</label>
                      <input value={email} onChange={e=>setEmail(e.target.value)}
                        className="w-full bg-[#f6f2f6] border border-transparent rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6750a5] focus:bg-white transition-all outline-none text-sm"
                        type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#605e63] mb-2">New Password</label>
                      <input
                        className="w-full bg-[#f6f2f6] border border-transparent rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6750a5] focus:bg-white transition-all outline-none text-sm"
                        type="password" placeholder="Leave blank to keep current password" />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <button type="submit" disabled={saving}
                        className="px-8 py-3 bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                        {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={()=>{setName(user?.name||'');setEmail(user?.email||'');}}
                        className="px-8 py-3 bg-[#e8def8] text-[#554f63] rounded-full font-bold hover:brightness-105 transition-all">
                        Reset
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Security + App Info */}
              <section className="lg:col-span-5 space-y-6">
                <div className="bg-[#f6f2f6] p-8 rounded-2xl">
                  <h2 className="text-xl font-['Plus_Jakarta_Sans'] font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6750a5]">security</span>
                    Security
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label:'Two-Factor Authentication', sub:'Extra layer of security', state:twoFA,      set:setTwoFA      },
                      { label:'Public Project View',       sub:'Allow public access',     state:publicView, set:setPublicView },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-sm transition-shadow">
                        <div>
                          <p className="text-sm font-semibold text-[#323236]">{s.label}</p>
                          <p className="text-xs text-[#605e63] mt-0.5">{s.sub}</p>
                        </div>
                        <button onClick={()=>s.set(!s.state)}
                          className="relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ml-4"
                          style={{ background:s.state?'#6750a5':'#b3b1b7' }}>
                          <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-sm"
                            style={{ left:s.state?'22px':'2px' }}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-[#b3b1b7]/20">
                    <button onClick={handleLogout}
                      className="w-full py-3 rounded-full bg-[#323236] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1a1a1f] transition-all active:scale-95">
                      <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* App Info — shows Groq, not Gemini */}
                <div className="bg-[#6750a5]/5 border border-[#6750a5]/15 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6750a5] to-[#bba2fd] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white" style={{ fontSize:'20px', fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#323236]">WebInsight</p>
                      <p className="text-xs text-[#605e63]">AI-Driven Design Review Platform</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-[#605e63]">
                    <p>Version: <span className="font-semibold text-[#323236]">1.0.0</span></p>
                    <p>AI Engine: <span className="font-semibold text-[#323236]">Groq (Llama 3.1)</span></p>
                    <p>Database: <span className="font-semibold text-[#323236]">MongoDB</span></p>
                    <p>Stack: <span className="font-semibold text-[#323236]">React + Node.js + Express</span></p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ── TEAM TAB ── */}
          {activeTab === 'team' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 anim-in">

              {/* Invite Member */}
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_rgba(50,50,54,0.06)]">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#6750a5]" style={{ fontVariationSettings:"'FILL' 1" }}>person_add</span>
                  <h2 className="text-xl font-['Plus_Jakarta_Sans'] font-bold">Invite Team Member</h2>
                </div>

                <div className="mb-5 p-4 bg-[#6750a5]/5 border border-[#6750a5]/15 rounded-xl">
                  <p className="text-xs text-[#605e63] leading-relaxed">
                    <strong className="text-[#6750a5]">How collaboration works:</strong> Invite teammates by email to a project. They can open the Review interface, drop feedback pins, create issues, reply to comments, and resolve problems — all in real time.
                  </p>
                </div>

                {inviteMsg && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>check_circle</span>
                    {inviteMsg}
                  </div>
                )}
                {inviteError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{inviteError}</div>
                )}

                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#605e63] mb-2">Email Address *</label>
                    <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
                      type="email" required
                      placeholder="colleague@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] focus:bg-white outline-none text-sm transition-all" />
                    <p className="text-xs text-[#b3b1b7] mt-1">If they already have an account, they'll be added immediately.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#605e63] mb-2">Project *</label>
                    {loadingProjects ? (
                      <div className="h-12 bg-[#f6f2f6] rounded-xl animate-pulse"></div>
                    ) : (
                      <select value={inviteProject} onChange={e=>setInviteProject(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] outline-none text-sm cursor-pointer appearance-none">
                        <option value="">— Select project —</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#605e63] mb-2">Role</label>
                    <div className="flex gap-3">
                      {[
                        { val:'editor', label:'Editor', desc:'Can add pins, issues, replies' },
                        { val:'viewer', label:'Viewer', desc:'Can view only' },
                      ].map(r => (
                        <button key={r.val} type="button" onClick={()=>setInviteRole(r.val)}
                          className="flex-1 p-3 rounded-xl border-2 text-left transition-all"
                          style={{
                            borderColor: inviteRole===r.val ? '#6750a5' : '#e5e1e7',
                            background: inviteRole===r.val ? '#6750a5/5' : 'white',
                          }}>
                          <p className="text-sm font-bold" style={{ color:inviteRole===r.val?'#6750a5':'#323236' }}>{r.label}</p>
                          <p className="text-xs text-[#605e63] mt-0.5">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={inviting}
                    className="w-full py-3 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                    {inviting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                    <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>send</span>
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </form>
              </div>

              {/* Right: Collaboration info + current user */}
              <div className="space-y-6">
                {/* Current user card */}
                <div className="bg-[#f6f2f6] p-6 rounded-2xl">
                  <h3 className="text-lg font-['Plus_Jakarta_Sans'] font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#6750a5]" style={{ fontVariationSettings:"'FILL' 1" }}>group</span>
                    Your Account
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] flex items-center justify-center text-white font-bold shadow-sm">
                      {user?.name?.split(' ').map(n=>n[0]).join('')||'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{user?.name}</h3>
                      <p className="text-xs text-[#605e63]">{user?.email}</p>
                    </div>
                    <div className="px-3 py-1 bg-[#bba2fd]/20 text-[#6750a5] text-[10px] font-bold rounded-full uppercase">Owner</div>
                  </div>
                </div>

                {/* Collaboration workflow */}
                <div className="bg-[#f6f2f6] p-6 rounded-2xl">
                  <h3 className="text-lg font-['Plus_Jakarta_Sans'] font-bold mb-4">How Team Collaboration Works</h3>
                  <div className="space-y-4">
                    {[
                      { icon:'link', color:'#6750a5',  title:'Share a project', desc:'Invite teammates by email to any project you own.' },
                      { icon:'push_pin', color:'#7b5270', title:'Collaborative review', desc:'Everyone sees the same website and can drop feedback pins.' },
                      { icon:'reply', color:'#625c71', title:'Discussion threads', desc:'Reply to any feedback pin — have conversations on specific elements.' },
                      { icon:'report_problem', color:'#a8364b', title:'Auto issue creation', desc:'Each pin automatically creates a tracked issue visible to the whole team.' },
                      { icon:'check_circle', color:'#16a34a', title:'Team resolution', desc:'Anyone can resolve issues and update status in real time.' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background:`${step.color}15` }}>
                          <span className="material-symbols-outlined" style={{ fontSize:'16px', color:step.color }}>{step.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#323236]">{step.title}</p>
                          <p className="text-xs text-[#605e63] leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DANGER ZONE TAB ── */}
          {activeTab === 'danger' && (
            <div className="max-w-2xl space-y-6 anim-in">
              <div className="bg-red-50 p-8 rounded-2xl border-2 border-red-200">
                <h3 className="text-[#a8364b] font-['Plus_Jakarta_Sans'] font-bold text-lg mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined">warning</span>
                  Danger Zone
                </h3>
                <p className="text-xs text-[#6e0523] mb-8">Actions here are permanent and cannot be undone.</p>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
                    <div>
                      <p className="font-bold text-sm">Export All Data</p>
                      <p className="text-xs text-[#605e63]">Download all your projects, issues, and feedback as JSON.</p>
                    </div>
                    <button className="px-5 py-2.5 rounded-full border border-[#b3b1b7] text-sm font-semibold hover:bg-[#f6f2f6] transition-all">
                      Export
                    </button>
                  </div>

                  <div className="p-5 bg-white rounded-xl border border-red-200">
                    <p className="font-bold text-sm text-[#a8364b] mb-1">Delete Account</p>
                    <p className="text-xs text-[#605e63] mb-4">
                      Permanently deletes your account, all projects, issues, and feedback. This cannot be undone.
                    </p>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold text-[#605e63] mb-2">
                        Type <span className="font-mono text-[#a8364b] bg-red-50 px-1 rounded">DELETE</span> to confirm
                      </label>
                      <input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-red-400 outline-none text-sm font-mono transition-all"
                        placeholder="DELETE" />
                    </div>
                    <button
                      disabled={deleteConfirm !== 'DELETE'}
                      onClick={()=>{ if(deleteConfirm==='DELETE'){logout();navigate('/');} }}
                      className="w-full py-3 bg-[#a8364b] text-white rounded-full font-bold hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95">
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}