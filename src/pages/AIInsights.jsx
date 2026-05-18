import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { projectsAPI, aiAPI, issuesAPI } from '../services/api';

export default function AllInsights() {
  const navigate = useNavigate();

  const [projects, setProjects]               = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [aiData, setAiData]                   = useState(null);
  const [issues, setIssues]                   = useState([]);
  const [analyzing, setAnalyzing]             = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError]                     = useState('');
  const [suggestingFix, setSuggestingFix]     = useState(null);
  const [fixResult, setFixResult]             = useState(null);

  useEffect(() => {
    projectsAPI.getAll()
      .then(res => {
        const data = res.data || [];
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]._id);
      })
      .catch(err => console.error(err.message))
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    issuesAPI.getAll({ project: selectedProject })
      .then(res => setIssues(res.data || []))
      .catch(err => console.error(err.message));
  }, [selectedProject]);

  const handleAnalyze = async () => {
    if (!selectedProject) { setError('Please select a project first.'); return; }
    setAnalyzing(true); setError(''); setAiData(null); setFixResult(null);
    try {
      const res = await aiAPI.analyze(selectedProject);
      setAiData(res.data);
    } catch (err) {
      setError(err.message || 'AI analysis failed. Make sure GROQ_API_KEY is set in backend/.env');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSuggestFix = async (issue) => {
    setSuggestingFix(issue._id); setFixResult(null);
    try {
      const res = await aiAPI.suggestFix(issue.title, issue.description, issue.severity);
      setFixResult({ issueId: issue._id, ...res.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setSuggestingFix(null);
    }
  };

  const scoreColor = (s) => s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#a8364b';

  const sevBadge = {
    High:   'border-[#a8364b] bg-red-50',
    Medium: 'border-[#d97706] bg-amber-50',
    Low:    'border-[#6750a5] bg-purple-50',
  };

  return (
    <div className="flex bg-[#fcf8fb] min-h-screen text-[#323236]">
      <style>{`
        @keyframes barGrow { from { width:0% } }
        .bar-grow { animation: barGrow 1s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      <Sidebar />

      <main className="ml-64 min-h-screen w-full">
        {/* Top Nav */}
        <header className="flex justify-between items-center w-full px-8 h-16 fixed top-0 z-40 bg-[#fcf8fb]/80 backdrop-blur-xl shadow-[0_2px_16px_rgba(50,50,54,0.06)] font-['Plus_Jakarta_Sans']">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c7a7f]" style={{ fontSize:'18px' }}>search</span>
            <input className="pl-10 pr-4 py-2 bg-[#f0edf1] rounded-full border-none outline-none text-sm w-64 focus:w-80 transition-all"
              placeholder="Search project insights..." type="text" />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-[#f0edf1] transition-all">
              <span className="material-symbols-outlined text-[#6750a5]">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#bba2fd] flex items-center justify-center text-white font-bold text-xs">AR</div>
          </div>
        </header>

        <div className="pt-24 px-8 pb-12 max-w-7xl mx-auto space-y-8">

          {/* ── Hero: AI Panel ── */}
          <section className="relative overflow-hidden rounded-2xl bg-[#f0edf1] p-8 lg:p-12 fade-up">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ad95ef] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* ✅ Says "Groq AI" not Gemini */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6750a5]/10 rounded-full mb-6">
                  <span className="material-symbols-outlined text-[#6750a5]" style={{ fontSize:'16px', fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
                  <span className="text-[#6750a5] font-bold text-xs uppercase tracking-widest">Groq AI Analysis</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-['Plus_Jakarta_Sans'] font-black text-[#323236] leading-tight mb-4">
                  {aiData
                    ? <>Your project health is{' '}<span className="text-[#6750a5]">{aiData.healthScore>=80?'Great':aiData.healthScore>=60?'Good':'Needs Work'}</span>.</>
                    : <>Run AI analysis on<br /><span className="text-[#6750a5]">your project.</span></>
                  }
                </h2>

                <p className="text-[#605e63] leading-relaxed mb-6 text-base">
                  {aiData
                    ? aiData.summary
                    : 'Select a project and click Analyze. Groq AI scans all your issues and feedback, then generates instant insights and recommendations.'}
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  {loadingProjects ? (
                    <div className="h-12 w-48 bg-[#e5e1e7] rounded-full animate-pulse"></div>
                  ) : (
                    <select value={selectedProject}
                      onChange={e => { setSelectedProject(e.target.value); setAiData(null); setError(''); }}
                      className="px-5 py-3 rounded-full bg-white border border-[#b3b1b7]/30 text-sm text-[#323236] outline-none cursor-pointer font-medium shadow-sm hover:border-[#6750a5]/40 transition-colors">
                      <option value="">— Select a project —</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  )}

                  <button onClick={handleAnalyze} disabled={analyzing || !selectedProject}
                    className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
                    style={{ background:'linear-gradient(135deg, #6750a5, #bba2fd)', boxShadow:'0 4px 20px rgba(103,80,165,0.3)' }}>
                    {analyzing ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Analyzing...</>
                    ) : (
                      <><span className="material-symbols-outlined" style={{ fontSize:'18px', fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>Analyze with AI</>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <span className="material-symbols-outlined text-red-500 mt-0.5 shrink-0" style={{ fontSize:'16px' }}>error</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Score Card */}
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
                {aiData ? (
                  <div className="space-y-4 fade-up">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#323236]">Health Score</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">AI Analyzed ✓</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-['Plus_Jakarta_Sans'] font-black" style={{ color:scoreColor(aiData.healthScore) }}>{aiData.healthScore}</span>
                      <span className="text-2xl font-bold text-[#b3b1b7] mb-2">/100</span>
                    </div>
                    <div className="space-y-3">
                      {aiData.accessibilityScore !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[#605e63]">Accessibility</span>
                            <span className="font-bold">{aiData.accessibilityScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-[#e5e1e7] rounded-full overflow-hidden">
                            <div className="h-full bg-[#6750a5] rounded-full bar-grow" style={{ width:`${aiData.accessibilityScore}%` }}></div>
                          </div>
                        </div>
                      )}
                      {aiData.consistencyScore !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-[#605e63]">Visual Consistency</span>
                            <span className="font-bold">{aiData.consistencyScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-[#e5e1e7] rounded-full overflow-hidden">
                            <div className="h-full bg-[#7b5270] rounded-full bar-grow" style={{ width:`${aiData.consistencyScore}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#6750a5]/10 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[#6750a5]" style={{ fontSize:'32px', fontVariationSettings:"'FILL' 1" }}>
                        {analyzing ? 'hourglass_top' : 'auto_awesome'}
                      </span>
                    </div>
                    <p className="font-bold text-[#323236] mb-1">{analyzing ? 'Groq AI is analyzing...' : 'No analysis yet'}</p>
                    <p className="text-sm text-[#605e63]">{analyzing ? 'This takes just a few seconds.' : 'Select a project and click Analyze.'}</p>
                    {analyzing && <div className="mt-4 w-8 h-8 border-[3px] border-[#6750a5]/30 border-t-[#6750a5] rounded-full animate-spin" style={{ borderWidth:'3px' }}></div>}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Patterns ── */}
          {aiData?.patterns?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-up">
              <div className="md:col-span-2 bg-[#f6f2f6] rounded-2xl p-6">
                <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7b5270]">grid_view</span>
                  Detected Patterns
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiData.patterns.map((p, i) => (
                    <div key={i} className={`p-4 bg-white rounded-xl border-l-4 hover:shadow-sm transition-shadow ${sevBadge[p.severity]||'border-[#6750a5] bg-purple-50'}`}>
                      <p className="text-xs text-[#605e63] font-bold mb-1 uppercase tracking-wide">{p.category}</p>
                      <p className="font-bold text-[#323236] text-sm">{p.title}</p>
                      <p className="text-xs text-[#605e63] mt-1.5 leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#7b5270] to-[#5f3956] rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined" style={{ fontSize:'36px' }}>diversity_1</span>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>trending_up</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-80 mb-1">Accessibility Score</p>
                  <p className="text-5xl font-['Plus_Jakarta_Sans'] font-black mb-4">{aiData.accessibilityScore ?? '—'}</p>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <p className="text-xs leading-relaxed italic opacity-90">
                      {(aiData.accessibilityScore??0)>=80
                        ? '"Accessibility is strong — maintain ARIA labels and contrast ratios."'
                        : (aiData.accessibilityScore??0)>=60
                        ? '"Some improvements needed — focus on contrast and keyboard navigation."'
                        : '"Significant gaps detected — prioritize WCAG compliance now."'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Recommendations ── */}
          {aiData?.recommendations?.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up">
              <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-[#eae7ec]">
                <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold mb-6">AI Recommendations</h3>
                <div className="space-y-4">
                  {aiData.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#f6f2f6] hover:bg-[#f0edf1] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#6750a5]/10 flex-shrink-0 flex items-center justify-center">
                        <span className="text-sm font-black text-[#6750a5]">{i+1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold">{rec.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.impact==='High'?'bg-red-100 text-red-700':rec.impact==='Medium'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>
                            {rec.impact} impact
                          </span>
                        </div>
                        <p className="text-xs text-[#605e63] leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f0edf1] rounded-2xl p-6">
                <h3 className="text-lg font-['Plus_Jakarta_Sans'] font-bold mb-5">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { icon:'report_problem', label:'View All Issues',   sub:`${issues.length} total issues`,  bg:'bg-[#bba2fd]/30', color:'text-[#6750a5]', action:()=>navigate('/issues')  },
                    { icon:'rate_review',    label:'Add More Feedback', sub:'Pin issues on website',           bg:'bg-[#f4bfe3]',    color:'text-[#7b5270]', action:()=>navigate('/review')  },
                    { icon:'refresh',        label:'Re-analyze',        sub:'Run fresh AI scan',               bg:'bg-[#6750a5]/10', color:'text-[#6750a5]', action:handleAnalyze            },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      disabled={item.label==='Re-analyze' && analyzing}
                      className="w-full flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all text-left disabled:opacity-50 hover:translate-x-1">
                      <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined ${item.color}`} style={{ fontVariationSettings:"'FILL' 1" }}>{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-xs text-[#605e63]">{item.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Issues with AI Fix Suggestions ── */}
          {issues.length > 0 && (
            <div className="bg-white rounded-2xl p-8 border border-[#eae7ec] fade-up">
              <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold mb-2">Issues — Get AI Fix Suggestions</h3>
              {/* ✅ No Gemini mention */}
              <p className="text-sm text-[#605e63] mb-6">
                Click <strong>"Suggest Fix"</strong> on any issue to get an instant AI-powered solution.
              </p>
              <div className="space-y-3">
                {issues.filter(i => i.status !== 'Resolved').slice(0, 6).map(issue => (
                  <div key={issue._id}>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f6f2f6] hover:bg-[#f0edf1] transition-colors">
                      <span className="text-xs font-mono font-bold text-[#6750a5] w-16 shrink-0">{issue.issueId}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#323236] truncate">{issue.title}</p>
                        <p className="text-xs text-[#605e63]">{issue.page||'General'} · {issue.severity}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${issue.severity==='High'?'bg-red-100 text-red-700':issue.severity==='Medium'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>
                        {issue.severity}
                      </span>
                      <button onClick={()=>handleSuggestFix(issue)} disabled={suggestingFix===issue._id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-all disabled:opacity-50 shrink-0 hover:brightness-110 active:scale-95"
                        style={{ background:'linear-gradient(135deg, #6750a5, #bba2fd)' }}>
                        {suggestingFix===issue._id
                          ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          : <span className="material-symbols-outlined" style={{ fontSize:'14px', fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
                        }
                        {suggestingFix===issue._id ? 'Thinking...' : 'Suggest Fix'}
                      </button>
                    </div>

                    {fixResult?.issueId===issue._id && (
                      <div className="mt-2 ml-4 p-4 rounded-xl bg-[#6750a5]/5 border border-[#6750a5]/20 fade-up">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[#6750a5]" style={{ fontSize:'16px', fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
                          <span className="text-xs font-bold text-[#6750a5] uppercase tracking-wide">AI Suggestion</span>
                          {fixResult.estimatedTime && <span className="text-[10px] text-[#605e63] ml-auto">~{fixResult.estimatedTime}</span>}
                        </div>
                        <p className="text-sm text-[#323236] leading-relaxed mb-2">{fixResult.suggestion}</p>
                        {fixResult.codeSnippet && (
                          <pre className="text-xs bg-[#323236] text-[#bba2fd] p-3 rounded-lg overflow-x-auto mt-2 font-mono">{fixResult.codeSnippet}</pre>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Chart + Stats ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-up">
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-[#eae7ec]">
              <div className="mb-8">
                <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold">Issue Breakdown</h3>
                <p className="text-sm text-[#605e63]">Status and severity distribution for selected project</p>
              </div>
              <div className="h-48 flex items-end justify-around gap-3 px-2">
                {[
                  { label:'Open',        count:issues.filter(i=>i.status==='Open').length,        color:'#b3b1b7' },
                  { label:'In Progress', count:issues.filter(i=>i.status==='In Progress').length, color:'#6750a5' },
                  { label:'Resolved',    count:issues.filter(i=>i.status==='Resolved').length,    color:'#16a34a' },
                  { label:'High',        count:issues.filter(i=>i.severity==='High').length,      color:'#a8364b' },
                  { label:'Medium',      count:issues.filter(i=>i.severity==='Medium').length,    color:'#d97706' },
                  { label:'Low',         count:issues.filter(i=>i.severity==='Low').length,       color:'#7b5270' },
                ].map(bar => {
                  const max = Math.max(
                    issues.filter(i=>i.status==='Open').length,
                    issues.filter(i=>i.status==='In Progress').length,
                    issues.filter(i=>i.status==='Resolved').length,
                    issues.filter(i=>i.severity==='High').length,
                    issues.filter(i=>i.severity==='Medium').length,
                    issues.filter(i=>i.severity==='Low').length,
                    1
                  );
                  const pct = Math.max((bar.count/max)*100, bar.count>0?8:3);
                  return (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-xs font-bold text-[#323236] opacity-0 group-hover:opacity-100 transition-opacity">{bar.count}</span>
                      <div className="w-full rounded-t-lg transition-all hover:opacity-80"
                        style={{ height:`${pct}%`, background:bar.color, minHeight:'8px' }}></div>
                      <span className="text-[10px] font-bold text-[#605e63] text-center leading-tight">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#f6f2f6] rounded-2xl p-6 space-y-3">
              <h3 className="text-lg font-['Plus_Jakarta_Sans'] font-bold mb-2">Project Stats</h3>
              {[
                { label:'Total Issues',  value:issues.length,                                          icon:'report_problem',         color:'#6750a5' },
                { label:'Open',          value:issues.filter(i=>i.status==='Open').length,             icon:'radio_button_unchecked', color:'#b3b1b7' },
                { label:'In Progress',   value:issues.filter(i=>i.status==='In Progress').length,     icon:'pending',                color:'#6750a5' },
                { label:'Resolved',      value:issues.filter(i=>i.status==='Resolved').length,        icon:'check_circle',           color:'#16a34a' },
                { label:'High Priority', value:issues.filter(i=>i.severity==='High').length,          icon:'priority_high',          color:'#a8364b' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize:'18px', color:s.color }}>{s.icon}</span>
                    <span className="text-sm text-[#323236]">{s.label}</span>
                  </div>
                  <span className="font-bold text-sm" style={{ color:s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer — ✅ says Groq not Gemini */}
          <footer className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#b3b1b7]/10 text-[10px] uppercase tracking-widest font-bold text-[#605e63] opacity-60">
            <p>© 2024 WebInsight — Powered by Groq AI (Llama 3.1)</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a className="hover:text-[#6750a5] transition-colors" href="#">System Logs</a>
              <a className="hover:text-[#6750a5] transition-colors" href="#">API Status</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}