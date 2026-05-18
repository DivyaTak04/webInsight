import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { feedbackAPI, projectsAPI } from '../services/api';

// ─── Add Feedback Modal ───────────────────────────────────────────────────────
function AddFeedbackModal({ position, pinNumber, projectId, pageUrl, onClose, onAdded }) {
  const [text, setText]         = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { setError('Please enter feedback text.'); return; }
    setLoading(true); setError('');
    try {
      const res = await feedbackAPI.create({ text, project: projectId, type: 'pin', category, position, pageUrl });
      onAdded(res.data, res.issue);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl p-7 shadow-2xl bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6750a5] flex items-center justify-center text-white font-bold text-sm">{pinNumber}</div>
            <h3 className="text-lg font-['Plus_Jakarta_Sans'] font-bold text-[#323236]">Add Feedback Pin</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f0edf1]">
            <span className="material-symbols-outlined text-[#605e63]">close</span>
          </button>
        </div>
        <div className="mb-4 px-3 py-2 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-600" style={{ fontSize: '16px' }}>auto_awesome</span>
          <p className="text-xs text-green-700 font-medium">This pin will <strong>automatically create an issue</strong> on the Issues page.</p>
        </div>
        {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#605e63] mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {['General','UI Consistency','Accessibility','Performance','Bug'].map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{ background: category===c ? '#6750a5':'#f6f2f6', color: category===c ? 'white':'#605e63' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#605e63] mb-2">Feedback *</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} required
              className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] focus:bg-white outline-none transition-all text-sm resize-none"
              placeholder="Describe what you noticed on this element..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#e8def8] text-[#554f63] font-semibold text-sm">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white font-semibold text-sm disabled:opacity-50">
              {loading ? 'Adding...' : '📌 Add Pin + Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Text Annotation Modal ────────────────────────────────────────────────
function AddTextModal({ position, projectId, pageUrl, onClose, onAdded }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await feedbackAPI.create({ text, project: projectId, type: 'annotation', category: 'General', position, pageUrl });
      onAdded(res.data, null);
      onClose();
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-['Plus_Jakarta_Sans'] font-bold text-[#323236]">Add Text Note</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f0edf1]">
            <span className="material-symbols-outlined text-[#605e63]" style={{ fontSize:'18px' }}>close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea value={text} onChange={e => setText(e.target.value)} rows={3} required autoFocus
            className="w-full px-4 py-3 rounded-xl bg-[#f6f2f6] border border-transparent focus:border-[#6750a5] focus:bg-white outline-none transition-all text-sm resize-none"
            placeholder="Type your annotation note..." />
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-[#e8def8] text-[#554f63] font-semibold text-sm">Cancel</button>
            <button type="submit" disabled={loading || !text.trim()}
              className="flex-1 py-2.5 rounded-full bg-[#6750a5] text-white font-semibold text-sm disabled:opacity-50">
              {loading ? '...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Select Project Modal ─────────────────────────────────────────────────────
function SelectProjectModal({ projects, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl p-7 shadow-2xl bg-white">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-['Plus_Jakarta_Sans'] font-bold text-[#323236]">Select Project</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f0edf1]">
            <span className="material-symbols-outlined text-[#605e63]">close</span>
          </button>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-[#b3b1b7] block mb-3" style={{ fontSize:'40px' }}>folder_open</span>
            <p className="text-[#605e63] text-sm">No projects yet. Create one from the Dashboard first.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-auto">
            {projects.map(p => (
              <button key={p._id} onClick={() => onSelect(p)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#f6f2f6] hover:bg-[#e8def8] transition-all text-left group">
                <div className="w-10 h-10 rounded-lg bg-[#6750a5]/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#6750a5]">web</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#323236] truncate">{p.name}</p>
                  <p className="text-xs text-[#605e63] truncate">{p.url}</p>
                  {p.members?.length > 0 && (
                    <p className="text-xs text-[#6750a5] mt-0.5">{p.members.length + 1} team members</p>
                  )}
                </div>
                <span className="material-symbols-outlined text-[#b3b1b7] group-hover:text-[#6750a5] transition-colors">chevron_right</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feedback Card with Replies ───────────────────────────────────────────────
function FeedbackCard({ item, idx, categoryColor, onResolve, onReply }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying]   = useState(false);

  const initials  = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const colorFor  = (name) => ['#6750a5','#7b5270','#625c71','#4a2642'][(name?.charCodeAt(0)||0) % 4];

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    await onReply(item._id, replyText);
    setReplyText(''); setShowReply(false); setReplying(false);
  };

  return (
    <div className="rounded-xl bg-[#f6f2f6] hover:bg-[#f0edf1] transition-colors overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
              style={{ background: categoryColor[item.category] || '#6750a5' }}>
              {item.pinNumber || idx + 1}
            </div>
            <span className="text-xs font-semibold" style={{ color: categoryColor[item.category] || '#6750a5' }}>
              {item.category}
            </span>
          </div>
          <span className="text-[10px] text-[#7c7a7f]">
            {new Date(item.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
          </span>
        </div>
        <p className="text-xs text-[#323236]/90 leading-relaxed mb-2">{item.text}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
              style={{ background: colorFor(item.author?.name) }}>
              {initials(item.author?.name)}
            </div>
            <span className="text-[10px] text-[#605e63]">{item.author?.name || 'You'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowReply(!showReply)}
              className="text-[10px] font-bold text-[#6750a5] hover:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize:'11px' }}>reply</span>
              {item.replies?.length > 0 ? item.replies.length : 'Reply'}
            </button>
            <button onClick={() => onResolve(item._id)}
              className="text-[10px] font-bold text-green-600 hover:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined" style={{ fontSize:'11px' }}>check</span>
              Resolve
            </button>
          </div>
        </div>
      </div>

      {item.replies?.length > 0 && (
        <div className="border-t border-[#e5e1e7] px-3 py-2 space-y-2 bg-white/50">
          {item.replies.map((r, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5"
                style={{ background: colorFor(r.author?.name) }}>
                {initials(r.author?.name)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#323236]">{r.author?.name || 'User'} </span>
                <span className="text-[10px] text-[#605e63]">{r.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showReply && (
        <div className="border-t border-[#e5e1e7] px-3 py-2 bg-white/50">
          <div className="flex gap-2">
            <input value={replyText} onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#e5e1e7] text-xs outline-none focus:border-[#6750a5] transition-colors"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()} />
            <button onClick={handleReply} disabled={replying || !replyText.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#6750a5] text-white text-xs font-semibold disabled:opacity-50">
              {replying ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screenshot Preview Modal ─────────────────────────────────────────────────
function ScreenshotModal({ dataUrl, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e1e7]">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[#323236]">Screenshot Captured</h3>
          <div className="flex items-center gap-2">
            <a href={dataUrl} download="webinsight-screenshot.png"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6750a5] text-white text-xs font-semibold hover:brightness-110 transition-all">
              <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>download</span>
              Download
            </a>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#f0edf1]">
              <span className="material-symbols-outlined text-[#605e63]">close</span>
            </button>
          </div>
        </div>
        <div className="p-4 bg-[#f6f2f6] max-h-[70vh] overflow-auto">
          <img src={dataUrl} alt="Screenshot" className="w-full rounded-xl shadow-sm" />
        </div>
        <div className="px-5 py-3 text-xs text-[#605e63] text-center">
          Note: Screenshot captures the review panel area. For full website screenshots, use browser devtools (F12 → Screenshot).
        </div>
      </div>
    </div>
  );
}

// ─── Drawing Box Component ────────────────────────────────────────────────────
// Shows a dashed selection box that the user drags on the overlay
function DrawingBox({ box }) {
  if (!box) return null;
  const left   = Math.min(box.startX, box.endX);
  const top    = Math.min(box.startY, box.endY);
  const width  = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);
  return (
    <div className="absolute pointer-events-none z-30"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
        border: '2px dashed #6750a5', background: 'rgba(103,80,165,0.08)', borderRadius: '6px' }} />
  );
}

// ─── Main Review Page ─────────────────────────────────────────────────────────
export default function Review() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const iframeRef         = useRef(null);
  const viewportRef       = useRef(null); // wrapper div, not iframe
  const screenshotAreaRef = useRef(null);

  const [projects, setProjects]                   = useState([]);
  const [activeProject, setActiveProject]         = useState(location.state?.project || null);
  const [showProjectModal, setShowProjectModal]    = useState(!location.state?.project);
  const [feedback, setFeedback]                   = useState([]);
  const [loadingFeedback, setLoadingFeedback]     = useState(false);
  const [activeTool, setActiveTool]               = useState('navigate'); // navigate | pin | box | text
  const [pendingPin, setPendingPin]               = useState(null);
  const [pendingText, setPendingText]             = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTextModal, setShowTextModal]         = useState(false);
  const [newIssueAlert, setNewIssueAlert]         = useState(null);
  const [urlInput, setUrlInput]                   = useState('');
  const [iframeUrl, setIframeUrl]                 = useState('');
  const [iframeLoading, setIframeLoading]         = useState(false);
  const [iframeError, setIframeError]             = useState(false);
  const [panelTab, setPanelTab]                   = useState('feedback');
  // Box tool state
  const [isDrawing, setIsDrawing]                 = useState(false);
  const [drawBox, setDrawBox]                     = useState(null);   // {startX,startY,endX,endY} in %
  const [drawnBoxes, setDrawnBoxes]               = useState([]);
  // Screenshot state
  const [screenshotUrl, setScreenshotUrl]         = useState(null);
  const [capturing, setCapturing]                 = useState(false);

  useEffect(() => {
    projectsAPI.getAll().then(r => setProjects(r.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    loadUrl(activeProject.url);
    setLoadingFeedback(true);
    feedbackAPI.getAll({ project: activeProject._id, resolved: false })
      .then(r => setFeedback(r.data || []))
      .catch(console.error)
      .finally(() => setLoadingFeedback(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject]);

  const loadUrl = (raw) => {
    if (!raw?.trim()) return;
    let url = raw.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    setIframeError(false); setIframeLoading(true); setIframeUrl(url); setUrlInput(url);
    setDrawnBoxes([]); setDrawBox(null);
  };

  const handleUrlSubmit = (e) => { e.preventDefault(); loadUrl(urlInput); };

  // ── Convert client coords → percentage relative to viewport ──
  const toPercent = useCallback((clientX, clientY) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  // ── Overlay click / drag handlers (overlay sits on top of iframe in annotation modes) ──
  const handleOverlayMouseDown = (e) => {
    if (activeTool === 'box') {
      setIsDrawing(true);
      const pos = toPercent(e.clientX, e.clientY);
      setDrawBox({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y });
    }
  };

  const handleOverlayMouseMove = (e) => {
    if (!isDrawing || activeTool !== 'box') return;
    const pos = toPercent(e.clientX, e.clientY);
    setDrawBox(prev => ({ ...prev, endX: pos.x, endY: pos.y }));
  };

  const handleOverlayMouseUp = (e) => {
    if (activeTool === 'box' && isDrawing) {
      setIsDrawing(false);
      if (drawBox) {
        const w = Math.abs(drawBox.endX - drawBox.startX);
        const h = Math.abs(drawBox.endY - drawBox.startY);
        if (w > 1 && h > 1) {
          setDrawnBoxes(prev => [...prev, { ...drawBox, id: Date.now() }]);
        }
        setDrawBox(null);
      }
    }
  };

  const handleOverlayClick = (e) => {
    const pos = toPercent(e.clientX, e.clientY);
    if (activeTool === 'pin' && activeProject) {
      setPendingPin(pos);
      setShowFeedbackModal(true);
    } else if (activeTool === 'text' && activeProject) {
      setPendingText(pos);
      setShowTextModal(true);
    }
  };

  // ── Screenshot using html2canvas-like approach ──
  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      // Use the Print Screen approach via canvas drawing of the visible iframe area
      // We capture the entire review viewport div as a visual snapshot
      const el = screenshotAreaRef.current;
      if (!el) throw new Error('Nothing to capture');

      // Dynamic import of html2canvas (must be installed: npm install html2canvas)
      // If not installed, we show a download hint instead
      let html2canvas;
      try {
        const mod = await import('html2canvas');
        html2canvas = mod.default;
      } catch {
        // html2canvas not installed — show helpful message
        alert('To enable screenshots, run: npm install html2canvas in your WEBINSIGHT folder, then restart npm start.');
        setCapturing(false);
        return;
      }

      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        logging: false,
      });
      setScreenshotUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Screenshot error:', err);
      alert('Screenshot failed. Make sure html2canvas is installed: npm install html2canvas');
    } finally {
      setCapturing(false);
    }
  };

  const handleFeedbackAdded = (newFeedback, newIssue) => {
    setFeedback(prev => [newFeedback, ...prev]);
    setPendingPin(null); setPendingText(null);
    if (newIssue) {
      setNewIssueAlert(newIssue);
      setTimeout(() => setNewIssueAlert(null), 5000);
    }
  };

  const handleResolve = async (id) => {
    try { await feedbackAPI.resolve(id); setFeedback(prev => prev.filter(f => f._id !== id)); }
    catch (err) { console.error(err.message); }
  };

  const handleReply = async (id, text) => {
    try { const r = await feedbackAPI.reply(id, text); setFeedback(prev => prev.map(f => f._id === id ? r.data : f)); }
    catch (err) { console.error(err.message); }
  };

  const openPins  = feedback.filter(f => f.type === 'pin');
  const openCount = feedback.filter(f => !f.resolved).length;
  const initials  = user?.name?.split(' ').map(n => n[0]).join('') || 'U';

  const categoryColor = {
    'UI Consistency':'#6750a5', 'Performance':'#7b5270',
    'Accessibility':'#a8364b', 'General':'#625c71', 'Bug':'#a8364b',
  };

  const teamMembers = activeProject ? [
    { name: activeProject.owner?.name || user?.name, email: activeProject.owner?.email || user?.email, role: 'Owner' },
    ...(activeProject.members || []).map(m => ({ name: m.user?.name, email: m.user?.email, role: m.role })),
  ] : [];

  // Is an annotation tool active? (overlay shown, iframe pointer-events off)
  const isAnnotationMode = activeTool === 'pin' || activeTool === 'box' || activeTool === 'text';

  const toolLabel = {
    navigate: '🖱️ Navigate',
    pin:      '📌 Pin Mode',
    box:      '⬜ Box Mode',
    text:     '✏️ Text Mode',
  }[activeTool];

  return (
    <div className="bg-[#fcf8fb] text-[#323236] h-screen overflow-hidden flex flex-col">
      <style>{`
        @keyframes slideRight{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}
        .slide-right{animation:slideRight 0.4s ease forwards;}
      `}</style>

      {/* Modals */}
      {showProjectModal && (
        <SelectProjectModal projects={projects}
          onSelect={p => { setActiveProject(p); setShowProjectModal(false); }}
          onClose={() => { setShowProjectModal(false); if (!activeProject) navigate('/dashboard'); }} />
      )}
      {showFeedbackModal && pendingPin && activeProject && (
        <AddFeedbackModal position={pendingPin} pinNumber={openPins.length + 1}
          projectId={activeProject._id} pageUrl={iframeUrl}
          onClose={() => { setShowFeedbackModal(false); setPendingPin(null); }}
          onAdded={handleFeedbackAdded} />
      )}
      {showTextModal && pendingText && activeProject && (
        <AddTextModal position={pendingText}
          projectId={activeProject._id} pageUrl={iframeUrl}
          onClose={() => { setShowTextModal(false); setPendingText(null); }}
          onAdded={handleFeedbackAdded} />
      )}
      {screenshotUrl && (
        <ScreenshotModal dataUrl={screenshotUrl} onClose={() => setScreenshotUrl(null)} />
      )}

      {/* Toast */}
      {newIssueAlert && (
        <div className="fixed top-20 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl shadow-2xl border border-[#e5e1e7] max-w-xs slide-right">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-600" style={{ fontSize:'20px' }}>check_circle</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#323236]">Issue auto-created!</p>
            <p className="text-xs text-[#605e63] truncate">{newIssueAlert.issueId}: {newIssueAlert.title}</p>
          </div>
          <button onClick={() => { setNewIssueAlert(null); navigate('/issues'); }}
            className="text-xs font-bold text-[#6750a5] hover:underline shrink-0">View →</button>
        </div>
      )}

      {/* Top Nav */}
      <header className="flex items-center justify-between px-4 h-14 shrink-0 bg-white border-b border-[#e5e1e7] z-40 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[#6750a5] font-bold text-sm shrink-0 hover:opacity-80 px-2 py-1 rounded-lg hover:bg-[#f0edf1] transition-all">
            <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>arrow_back</span>
            <span className="hidden sm:inline">WebInsight</span>
          </button>
          <div className="h-5 w-[1px] bg-[#e5e1e7] shrink-0"></div>

          <form onSubmit={handleUrlSubmit}
            className="flex items-center flex-1 bg-[#f6f2f6] rounded-full px-3 py-1.5 gap-2 min-w-0 max-w-2xl border border-transparent focus-within:border-[#6750a5]/30 transition-colors">
            <span className="material-symbols-outlined text-[#7c7a7f] shrink-0" style={{ fontSize:'15px' }}>
              {iframeLoading ? 'sync' : iframeError ? 'error_outline' : 'lock'}
            </span>
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="Enter website URL and press Enter to load..."
              className="bg-transparent border-none outline-none text-sm text-[#323236] flex-1 min-w-0" />
            {urlInput && (
              <button type="submit" className="shrink-0 text-[#6750a5] hover:opacity-80">
                <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>arrow_forward</span>
              </button>
            )}
          </form>

          {activeProject && (
            <button onClick={() => setShowProjectModal(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8def8] text-[#6750a5] text-xs font-semibold hover:bg-[#d8cef0] transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>swap_horiz</span>
              <span className="hidden md:inline max-w-[100px] truncate">{activeProject.name}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-3 shrink-0">
          {/* Capture button — functional */}
          <button onClick={handleCapture} disabled={capturing || !iframeUrl}
            title="Capture screenshot of this area"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#f0edf1] text-[#323236] text-xs transition-all disabled:opacity-40">
            <span className="material-symbols-outlined" style={{ fontSize:'18px' }}>
              {capturing ? 'hourglass_top' : 'screenshot'}
            </span>
            <span className="hidden md:inline">{capturing ? 'Capturing...' : 'Capture'}</span>
          </button>

          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white text-xs font-semibold shadow-sm hover:brightness-110 transition-all">
            <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>share</span>
            <span className="hidden md:inline">Share</span>
          </button>

          {teamMembers.length > 0 && (
            <div className="flex -space-x-2 ml-1">
              {teamMembers.slice(0, 3).map((m, i) => (
                <div key={i} title={m.name}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-[9px]"
                  style={{ background: ['#6750a5','#7b5270','#625c71'][i % 3], zIndex: 3 - i }}>
                  {m.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </div>
              ))}
            </div>
          )}
          <div className="w-7 h-7 rounded-full bg-[#6750a5] flex items-center justify-center text-white font-bold text-xs">{initials}</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Side Nav */}
        <nav className="flex flex-col p-2 z-30 bg-[#f6f2f6] w-14 hover:w-52 group transition-all duration-300 border-r border-[#e5e1e7] overflow-hidden shrink-0">
          <div className="flex items-center gap-3 mb-5 px-1 pt-2">
            <div className="w-9 h-9 rounded-xl bg-[#6750a5] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize:'18px' }}>auto_awesome</span>
            </div>
            <p className="text-sm font-black text-[#6750a5] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">WebInsight</p>
          </div>
          <div className="flex flex-col gap-1">
            {[
              { icon:'rate_review',    label:'Review',    path:'/review',    active:true  },
              { icon:'dashboard',      label:'Dashboard', path:'/dashboard', active:false },
              { icon:'report_problem', label:'Issues',    path:'/issues',    active:false },
              { icon:'auto_awesome',   label:'AI',        path:'/insights',  active:false },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 p-2.5 w-full rounded-xl transition-all ${item.active ? 'bg-[#6750a5] text-white' : 'text-[#323236] hover:bg-[#f0edf1]'}`}>
                <span className="material-symbols-outlined shrink-0" style={{ fontSize:'20px' }}>{item.icon}</span>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto">
            <button onClick={() => navigate('/settings')}
              className="flex items-center gap-3 p-2.5 w-full text-[#323236] hover:bg-[#f0edf1] rounded-xl transition-all">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize:'20px' }}>settings</span>
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity text-sm font-medium">Settings</span>
            </button>
          </div>
        </nav>

        {/* Website Viewport */}
        <div className="flex-1 overflow-hidden relative bg-[#e5e1e7] flex flex-col">

          {/* Empty state */}
          {!iframeUrl && (
            <div className="flex-1 flex items-center justify-center overflow-auto">
              <div className="text-center bg-white rounded-2xl p-10 shadow-sm mx-8 max-w-lg my-8">
                <div className="w-20 h-20 rounded-2xl bg-[#6750a5]/10 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-[#6750a5]" style={{ fontSize:'40px' }}>web_asset</span>
                </div>
                <h3 className="text-xl font-['Plus_Jakarta_Sans'] font-bold mb-2 text-[#323236]">Load any website</h3>
                <p className="text-[#605e63] text-sm mb-6">Type a URL above, or select a project.</p>
                <div className="flex gap-3 justify-center mb-5">
                  <button onClick={() => setShowProjectModal(true)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-br from-[#6750a5] to-[#bba2fd] text-white font-semibold text-sm shadow-sm hover:brightness-110 transition-all">
                    Select Project
                  </button>
                  <button onClick={() => navigate('/dashboard')}
                    className="px-5 py-2.5 rounded-full bg-[#f0edf1] text-[#605e63] font-semibold text-sm">
                    Dashboard
                  </button>
                </div>
                <div className="pt-4 border-t border-[#f0edf1]">
                  <p className="text-xs text-[#b3b1b7] mb-3">Try these (no X-Frame-Options block):</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['https://example.com','https://info.cern.ch','https://httpbin.org/html'].map(url => (
                      <button key={url} onClick={() => loadUrl(url)}
                        className="px-3 py-1 rounded-full bg-[#f6f2f6] text-[#6750a5] text-xs font-medium hover:bg-[#e8def8] transition-colors">
                        {url.replace('https://','').split('/')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {iframeUrl && (
            <div
              ref={screenshotAreaRef}
              className="flex-1 relative"
              style={{ minHeight: 0 }}
            >
              {/* Loading */}
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#6750a5]/20 border-t-[#6750a5] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-[#323236] mb-1">Loading website...</p>
                    <p className="text-xs text-[#605e63] max-w-xs truncate px-4">{iframeUrl}</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {iframeError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#f6f2f6] z-10 overflow-auto">
                  <div className="text-center bg-white rounded-2xl p-10 shadow-sm max-w-md mx-4 my-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-[#a8364b]" style={{ fontSize:'36px' }}>block</span>
                    </div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg mb-2">Website blocked embedding</h3>
                    <p className="text-sm text-[#605e63] mb-6">
                      This site uses <code className="bg-[#f6f2f6] px-1 rounded text-xs">X-Frame-Options</code> to prevent embedding.
                      Try a portfolio, docs, or simple HTML page.
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap mb-5">
                      <button onClick={() => { setIframeError(false); setIframeUrl(''); setUrlInput(''); }}
                        className="px-4 py-2 rounded-full bg-[#6750a5] text-white font-semibold text-sm">Try different URL</button>
                      <button onClick={() => loadUrl(urlInput)}
                        className="px-4 py-2 rounded-full bg-[#f0edf1] text-[#605e63] font-semibold text-sm">Retry</button>
                    </div>
                    <p className="text-xs text-[#b3b1b7] mb-2">These usually work:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['https://example.com','https://httpbin.org/html','https://info.cern.ch'].map(url => (
                        <button key={url} onClick={() => loadUrl(url)}
                          className="px-3 py-1 rounded-full bg-[#f6f2f6] text-[#6750a5] text-xs font-medium hover:bg-[#e8def8] transition-colors">
                          {url.replace('https://','').split('/')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/*
                ── KEY FIX ──
                The iframe is always pointer-events: auto so it can scroll.
                When in annotation mode, a transparent overlay sits on top to intercept clicks.
                When in navigate mode, the overlay is hidden so the iframe is fully interactive.
              */}
              <div ref={viewportRef} className="absolute inset-0">
                {/* Iframe — always scrollable */}
                <iframe
                  ref={iframeRef}
                  src={iframeUrl}
                  title="Website Review"
                  scrolling="yes"
                  className="w-full h-full border-none"
                  style={{
                    display: iframeError ? 'none' : 'block',
                    opacity: iframeLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                    // pointer-events always auto — iframe handles its own scrolling
                    pointerEvents: 'auto',
                  }}
                  onLoad={() => setIframeLoading(false)}
                  onError={() => { setIframeLoading(false); setIframeError(true); }}
                />

                {/* Annotation overlay — only shown when a tool is active */}
                {isAnnotationMode && !iframeError && !iframeLoading && (
                  <div
                    className="absolute inset-0 z-20"
                    style={{ cursor: activeTool === 'box' ? 'crosshair' : activeTool === 'pin' ? 'crosshair' : 'text' }}
                    onClick={handleOverlayClick}
                    onMouseDown={handleOverlayMouseDown}
                    onMouseMove={handleOverlayMouseMove}
                    onMouseUp={handleOverlayMouseUp}
                  />
                )}

                {/* Drawn boxes layer */}
                {drawnBoxes.map(box => (
                  <div key={box.id} className="absolute pointer-events-none z-30 group"
                    style={{
                      left: `${Math.min(box.startX, box.endX)}%`,
                      top: `${Math.min(box.startY, box.endY)}%`,
                      width: `${Math.abs(box.endX - box.startX)}%`,
                      height: `${Math.abs(box.endY - box.startY)}%`,
                      border: '2px dashed #6750a5',
                      background: 'rgba(103,80,165,0.06)',
                      borderRadius: '6px',
                    }}>
                    <div className="absolute -top-6 left-0 bg-[#6750a5] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                      Box annotation
                    </div>
                  </div>
                ))}

                {/* Live drawing box */}
                {isDrawing && drawBox && <DrawingBox box={drawBox} />}

                {/* Pins */}
                {activeProject && !iframeError && (
                  <div className="absolute inset-0 pointer-events-none z-30">
                    {openPins.map((pin, idx) => {
                      const left = typeof pin.position?.x === 'number' ? `${pin.position.x}%` : `${80 + idx * 60}px`;
                      const top  = typeof pin.position?.y === 'number' ? `${pin.position.y}%` : `${150 + idx * 50}px`;
                      return (
                        <div key={pin._id} className="absolute pointer-events-auto group"
                          style={{ left, top, transform: 'translate(-50%,-50%)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ring-4 ring-white shadow-xl cursor-pointer hover:scale-110 transition-transform"
                            style={{ background: categoryColor[pin.category] || '#6750a5' }}>
                            {pin.pinNumber || idx + 1}
                          </div>
                          <div className="absolute left-10 top-0 min-w-[200px] max-w-[260px] opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-auto">
                            <div className="bg-white rounded-xl shadow-2xl p-3 border border-[#e5e1e7]">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold" style={{ color: categoryColor[pin.category] || '#6750a5' }}>{pin.category}</span>
                                <button onClick={() => handleResolve(pin._id)} className="text-[10px] font-bold text-green-600 hover:underline">Resolve</button>
                              </div>
                              <p className="text-xs text-[#323236] leading-relaxed">{pin.text}</p>
                              {pin.replies?.length > 0 && (
                                <p className="text-[10px] text-[#6750a5] mt-1">💬 {pin.replies.length} repl{pin.replies.length === 1 ? 'y' : 'ies'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Text annotations */}
                    {feedback.filter(f => f.type === 'annotation').map((ann, idx) => {
                      const left = typeof ann.position?.x === 'number' ? `${ann.position.x}%` : '20px';
                      const top  = typeof ann.position?.y === 'number' ? `${ann.position.y}%` : '20px';
                      return (
                        <div key={ann._id} className="absolute pointer-events-auto group"
                          style={{ left, top }}>
                          <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-2 py-1 shadow-sm max-w-[180px]">
                            <p className="text-[10px] text-yellow-800 leading-relaxed">{ann.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Annotation mode hint banner */}
              {isAnnotationMode && !iframeError && !iframeLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-xs font-bold text-white"
                    style={{ background: 'rgba(103,80,165,0.92)', backdropFilter: 'blur(10px)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>ads_click</span>
                    {activeTool === 'pin' && 'Click anywhere to drop a feedback pin (auto-creates an issue)'}
                    {activeTool === 'box' && 'Click and drag to draw a box annotation'}
                    {activeTool === 'text' && 'Click anywhere to add a text note'}
                  </div>
                </div>
              )}

              {/* Exit annotation mode hint */}
              {isAnnotationMode && !iframeError && !iframeLoading && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                  <button onClick={() => setActiveTool('navigate')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#6750a5] bg-white shadow-sm border border-[#e5e1e7] hover:bg-[#f0edf1] transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize:'12px' }}>close</span>
                    Exit {activeTool} mode to scroll
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Floating Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white/95 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-[#e5e1e7] gap-1 z-40">
            {/* Navigate mode (scroll/browse) */}
            <button onClick={() => setActiveTool('navigate')} title="Navigate mode — scroll and browse freely"
              className="p-2.5 rounded-full transition-all"
              style={{ background: activeTool==='navigate' ? '#6750a5':'transparent', color: activeTool==='navigate' ? 'white':'#605e63' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'20px' }}>open_with</span>
            </button>

            <div className="h-5 w-[1px] bg-[#b3b1b7]/30 mx-0.5"></div>

            {/* Pin */}
            <button onClick={() => setActiveTool('pin')} title="Pin mode — click to add feedback"
              className="p-2.5 rounded-full transition-all"
              style={{ background: activeTool==='pin' ? '#6750a5':'transparent', color: activeTool==='pin' ? 'white':'#605e63' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'20px' }}>push_pin</span>
            </button>

            {/* Box */}
            <button onClick={() => setActiveTool('box')} title="Box mode — drag to annotate an area"
              className="p-2.5 rounded-full transition-all"
              style={{ background: activeTool==='box' ? '#6750a5':'transparent', color: activeTool==='box' ? 'white':'#605e63' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'20px' }}>check_box_outline_blank</span>
            </button>

            {/* Text */}
            <button onClick={() => setActiveTool('text')} title="Text mode — click to add a note"
              className="p-2.5 rounded-full transition-all"
              style={{ background: activeTool==='text' ? '#6750a5':'transparent', color: activeTool==='text' ? 'white':'#605e63' }}>
              <span className="material-symbols-outlined" style={{ fontSize:'20px' }}>text_fields</span>
            </button>

            <div className="h-5 w-[1px] bg-[#b3b1b7]/30 mx-0.5"></div>

            {/* Clear boxes */}
            <button onClick={() => setDrawnBoxes([])} title="Clear all box annotations"
              disabled={drawnBoxes.length === 0}
              className="p-2.5 rounded-full text-[#605e63] hover:bg-[#f0edf1] transition-all disabled:opacity-30">
              <span className="material-symbols-outlined" style={{ fontSize:'20px' }}>delete_sweep</span>
            </button>

            <div className="h-5 w-[1px] bg-[#b3b1b7]/30 mx-0.5"></div>

            {/* Current mode badge */}
            <div className="px-3 py-1.5 rounded-full bg-[#f0edf1] text-xs font-bold text-[#6750a5] whitespace-nowrap">
              {toolLabel}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <aside className="w-80 bg-white border-l border-[#e5e1e7] flex flex-col shrink-0">
          <div className="border-b border-[#e5e1e7]">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#323236] truncate">
                {activeProject ? activeProject.name : 'No project selected'}
              </h3>
              <span className="bg-[#e8def8] text-[#554f63] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">{openCount} OPEN</span>
            </div>
            <div className="flex">
              {[
                { id:'feedback', icon:'push_pin', label:'Feedback' },
                { id:'team',     icon:'group',    label:'Team'     },
                { id:'activity', icon:'timeline', label:'Activity' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setPanelTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-semibold transition-all border-b-2"
                  style={{ borderColor: panelTab===tab.id ? '#6750a5':'transparent', color: panelTab===tab.id ? '#6750a5':'#605e63' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:'14px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* FEEDBACK TAB */}
          {panelTab === 'feedback' && (
            <>
              {!activeProject ? (
                <div className="flex-grow flex items-center justify-center p-6 text-center">
                  <div>
                    <span className="material-symbols-outlined text-[#b3b1b7] block mb-2" style={{ fontSize:'32px' }}>rate_review</span>
                    <p className="text-[#605e63] text-sm">Select a project to see feedback</p>
                  </div>
                </div>
              ) : loadingFeedback ? (
                <div className="flex-grow flex items-center justify-center">
                  <div className="w-7 h-7 border-[3px] border-[#6750a5]/30 border-t-[#6750a5] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex-grow overflow-auto p-3 space-y-2 custom-scrollbar">
                  {feedback.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-14 h-14 rounded-2xl bg-[#6750a5]/10 flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-[#6750a5]" style={{ fontSize:'28px' }}>push_pin</span>
                      </div>
                      <p className="text-[#605e63] text-sm font-medium">No feedback yet</p>
                      <p className="text-[#b3b1b7] text-xs mt-1 px-4">
                        Select 📌 Pin mode then click the website
                      </p>
                    </div>
                  ) : (
                    feedback.map((item, idx) => (
                      <FeedbackCard key={item._id} item={item} idx={idx}
                        categoryColor={categoryColor} onResolve={handleResolve} onReply={handleReply} />
                    ))
                  )}
                </div>
              )}
              <div className="p-3 border-t border-[#e5e1e7] space-y-2 shrink-0">
                {activeProject && (
                  <p className="text-[10px] text-center text-[#605e63]">
                    Pins auto-create issues → <button onClick={() => navigate('/issues')} className="font-bold text-[#6750a5] hover:underline">Issues page</button>
                  </p>
                )}
                <button onClick={() => navigate('/issues')}
                  className="w-full py-2.5 rounded-full border border-[#b3b1b7]/30 text-sm font-medium hover:bg-[#f0edf1] transition-all flex items-center justify-center gap-1.5 text-[#323236]">
                  <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>report_problem</span>
                  View All Issues
                </button>
              </div>
            </>
          )}

          {/* TEAM TAB */}
          {panelTab === 'team' && (
            <div className="flex-grow overflow-auto p-4 custom-scrollbar">
              {!activeProject ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-[#b3b1b7] block mb-2" style={{ fontSize:'32px' }}>group</span>
                  <p className="text-[#605e63] text-sm">Select a project to see team</p>
                </div>
              ) : (
                <>
                  <h4 className="text-xs font-bold text-[#605e63] uppercase tracking-widest mb-3">Team ({teamMembers.length})</h4>
                  <div className="space-y-2 mb-4">
                    {teamMembers.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-[#f6f2f6] rounded-xl">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ background: ['#6750a5','#7b5270','#625c71'][i % 3] }}>
                          {m.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#323236] truncate">{m.name || 'Unknown'}</p>
                          <p className="text-xs text-[#605e63] truncate">{m.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${m.role==='Owner' ? 'bg-[#bba2fd]/20 text-[#6750a5]':'bg-[#f0edf1] text-[#605e63]'}`}>
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                  {activeProject.pendingInvites?.length > 0 && (
                    <>
                      <h4 className="text-xs font-bold text-[#605e63] uppercase tracking-widest mb-2">Pending</h4>
                      <div className="space-y-2 mb-4">
                        {activeProject.pendingInvites.map((inv, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-[#f6f2f6] rounded-xl opacity-60">
                            <div className="w-9 h-9 rounded-full bg-[#e5e1e7] flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[#7c7a7f]" style={{ fontSize:'16px' }}>mail</span>
                            </div>
                            <p className="text-xs text-[#605e63] truncate flex-1">{inv.email}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e5e1e7] text-[#605e63]">Pending</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <button onClick={() => navigate('/settings')}
                    className="w-full py-2.5 rounded-full bg-[#6750a5] text-white text-sm font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize:'16px' }}>person_add</span>
                    Invite Team Member
                  </button>
                </>
              )}
            </div>
          )}

          {/* ACTIVITY TAB */}
          {panelTab === 'activity' && (
            <div className="flex-grow overflow-auto p-4 custom-scrollbar">
              <h4 className="text-xs font-bold text-[#605e63] uppercase tracking-widest mb-3">Recent Activity</h4>
              {!activeProject || feedback.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-[#b3b1b7] block mb-2" style={{ fontSize:'28px' }}>history</span>
                  <p className="text-[#605e63] text-xs">{!activeProject ? 'Select a project to see activity' : 'No activity yet. Add feedback pins!'}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {feedback.slice(0, 15).map((item, idx) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                          style={{ background: categoryColor[item.category] || '#6750a5' }}>
                          {item.author?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                        {idx < feedback.length - 1 && <div className="w-[1px] flex-1 bg-[#e5e1e7] mt-1 min-h-[12px]"></div>}
                      </div>
                      <div className="flex-1 pb-3 min-w-0">
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-xs font-bold text-[#323236]">{item.author?.name || 'You'}</span>
                          <span className="text-xs text-[#605e63]">{item.type === 'annotation' ? 'added a note' : 'added a feedback pin'}</span>
                        </div>
                        <p className="text-[10px] text-[#605e63] mt-0.5 line-clamp-2">{item.text}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: `${categoryColor[item.category] || '#6750a5'}20`, color: categoryColor[item.category] || '#6750a5' }}>
                            {item.category}
                          </span>
                          <span className="text-[10px] text-[#b3b1b7]">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </span>
                          {item.replies?.length > 0 && <span className="text-[10px] text-[#6750a5]">💬 {item.replies.length}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}