import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

// ─── Floating 3D Card ─────────────────────────────────────────────────────────
function Card3D({ children, className = '', depth = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `perspective(800px) rotateY(${dx * 8 * depth}deg) rotateX(${-dy * 8 * depth}deg) translateZ(${depth * 10}px)`;
    };
    const onLeave = () => {
      el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
    };
    window.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [depth]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 1500;
        const step = (end / duration) * 16;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Mouse Parallax Background ────────────────────────────────────────────────
function ParallaxBg() {
  const ref = useRef(null);
  useEffect(() => {
    const onMove = (e) => {
      if (!ref.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      ref.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep space grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(103,80,165,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(103,80,165,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      {/* Parallax orbs */}
      <div ref={ref} style={{ transition: 'transform 0.1s ease-out' }}>
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(103,80,165,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(123,82,112,0.15) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(187,162,253,0.08) 0%, transparent 70%)' }} />
      </div>
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: `rgba(187,162,253,${Math.random() * 0.4 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Landing ─────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = () => navigate(isLoggedIn ? '/dashboard' : '/auth');

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: '#06060c', fontFamily: "'Syne', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          66% { transform: translateY(10px) translateX(-10px); opacity: 0.4; }
        }
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.4; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-title { animation: slide-up 0.9s ease forwards; }
        .hero-sub   { animation: slide-up 0.9s 0.2s ease forwards; opacity: 0; animation-fill-mode: forwards; }
        .hero-cta   { animation: slide-up 0.9s 0.4s ease forwards; opacity: 0; animation-fill-mode: forwards; }
        .hero-cards { animation: slide-up 0.9s 0.6s ease forwards; opacity: 0; animation-fill-mode: forwards; }
        .section-reveal { 
          opacity: 0; 
          transform: translateY(30px); 
          transition: opacity 0.7s ease, transform 0.7s ease; 
        }
        .section-reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none', background: scrollY > 40 ? 'rgba(6,6,12,0.8)' : 'transparent', borderBottom: scrollY > 40 ? '1px solid rgba(103,80,165,0.15)' : 'none', transition: 'all 0.3s ease' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6750a5, #bba2fd)' }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>
            Web<span style={{ color: '#bba2fd' }}>Insight</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Pricing'].map((item) => (
            <button key={item} className="text-sm text-white/50 hover:text-white transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Sign in
          </button>
          <button onClick={handleCTA}
            className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #6750a5, #9b7fd4)', fontFamily: "'DM Sans', sans-serif" }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <ParallaxBg />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text */}
            <div>
              {/* Pill badge */}
              <div className="hero-title inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
                style={{ borderColor: 'rgba(187,162,253,0.25)', background: 'rgba(103,80,165,0.12)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#bba2fd]" style={{ animation: 'pulse-ring 2s infinite' }}></div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#bba2fd', letterSpacing: '0.08em' }}>
                  AI-POWERED DESIGN REVIEW
                </span>
              </div>

              <h1 className="hero-title mb-6 leading-none"
                style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(42px, 5vw, 72px)', letterSpacing: '-2px' }}>
                Review websites.<br />
                <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(187,162,253,0.5)' }}>Catch every</span><br />
                <span style={{ background: 'linear-gradient(135deg, #bba2fd, #9b7fd4, #6750a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>flaw instantly.</span>
              </h1>

              <p className="hero-sub mb-10 text-white/50 leading-relaxed max-w-md"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '17px', fontWeight: 300 }}>
                Click any element on a live website, drop feedback pins, track design issues, and let AI surface patterns your team missed.
              </p>

              <div className="hero-cta flex flex-wrap items-center gap-4">
                <button onClick={handleCTA}
                  className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #6750a5, #9b7fd4)', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(103,80,165,0.4)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
                  Start for free
                </button>
                <button onClick={() => navigate('/review')}
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.7)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_circle</span>
                  See it live
                </button>
              </div>

              {/* Stats row */}
              <div className="hero-cta mt-12 flex gap-8">
                {[
                  { n: 12, s: 'k+', label: 'Teams using it' },
                  { n: 98, s: '%', label: 'Issue catch rate' },
                  { n: 3, s: 'x', label: 'Faster reviews' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '28px', color: '#bba2fd' }}>
                      <Counter end={stat.n} suffix={stat.s} />
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3D Dashboard Preview */}
            <div className="hero-cards relative">
              {/* Orbit ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[500px] rounded-full border opacity-10"
                  style={{ borderColor: '#6750a5', animation: 'slow-spin 20s linear infinite' }} />
                <div className="absolute w-[380px] h-[380px] rounded-full border opacity-5"
                  style={{ borderColor: '#bba2fd', animation: 'slow-spin 14s linear infinite reverse' }} />
              </div>

              {/* Main dashboard card */}
              <Card3D depth={1.2} className="relative z-10">
                <div className="rounded-2xl overflow-hidden border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(103,80,165,0.25)', backdropFilter: 'blur(10px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)' }}>
                  {/* Fake browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
                    <div className="flex-1 mx-3 py-1 px-3 rounded text-xs text-white/20" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      webinsight.app/dashboard
                    </div>
                  </div>
                  {/* Dashboard mockup */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Projects', val: '24', color: '#6750a5' },
                        { label: 'Issues', val: '12', color: '#a8364b' },
                        { label: 'AI Tips', val: '08', color: '#7b5270' },
                        { label: 'Activity', val: '92%', color: '#625c71' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `2px solid ${s.color}` }}>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', color: s.color }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>ACTIVE PROJECTS</div>
                      <div className="space-y-2">
                        {[{ name: 'FinTech Dashboard', pct: 75, c: '#6750a5' }, { name: 'E-Commerce', pct: 40, c: '#7b5270' }].map((p) => (
                          <div key={p.name}>
                            <div className="flex justify-between" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '3px' }}>
                              <span>{p.name}</span><span>{p.pct}%</span>
                            </div>
                            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                              <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.c }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card3D>

              {/* Floating annotation pin */}
              <Card3D depth={2.5} className="absolute -left-8 top-24 z-20">
                <div className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(103,80,165,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(103,80,165,0.4)', border: '1px solid rgba(255,255,255,0.1)', minWidth: '180px' }}>
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#6750a5] font-bold" style={{ fontSize: '12px', flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Contrast Issue</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>Hero CTA button</div>
                  </div>
                </div>
              </Card3D>

              {/* AI insight chip */}
              <Card3D depth={2} className="absolute -right-4 bottom-24 z-20">
                <div className="rounded-xl p-3"
                  style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(187,162,253,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minWidth: '160px' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#bba2fd', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span style={{ fontSize: '9px', color: '#bba2fd', fontWeight: 700, letterSpacing: '0.08em' }}>AI INSIGHT</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>Health score improved 4% this sprint</div>
                  <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full w-[88%]" style={{ background: 'linear-gradient(90deg, #6750a5, #bba2fd)' }}></div>
                  </div>
                </div>
              </Card3D>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>SCROLL</span>
          <div className="w-[1px] h-10" style={{ background: 'linear-gradient(to bottom, rgba(187,162,253,0.8), transparent)' }}></div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 section-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border"
              style={{ borderColor: 'rgba(187,162,253,0.2)', background: 'rgba(103,80,165,0.08)' }}>
              <span style={{ fontSize: '11px', color: '#bba2fd', letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif" }}>HOW IT WORKS</span>
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 4vw, 54px)', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
              From URL to insights<br />
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>in under 60 seconds.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                icon: 'link',
                title: 'Paste any URL',
                desc: 'Drop in any live website link. WebInsight loads it inside our sandboxed review interface.',
                color: '#6750a5',
              },
              {
                num: '02',
                icon: 'push_pin',
                title: 'Click to annotate',
                desc: 'Click any element to drop a feedback pin. Add context, assign severity, link to your team.',
                color: '#9b7fd4',
              },
              {
                num: '03',
                icon: 'auto_awesome',
                title: 'AI does the rest',
                desc: 'Gemini AI reads all feedback, finds patterns, scores your design, and suggests targeted fixes.',
                color: '#bba2fd',
              },
            ].map((step, i) => (
              <Card3D key={i} depth={0.8} className="section-reveal rounded-2xl p-7 border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(103,80,165,0.15)', '--reveal-delay': `${i * 0.15}s` }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}>
                    <span className="material-symbols-outlined" style={{ color: step.color, fontSize: '22px' }}>{step.icon}</span>
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '48px', color: 'rgba(255,255,255,0.05)', lineHeight: 1 }}>{step.num}</span>
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{step.desc}</p>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ASYMMETRIC GRID ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Big feature */}
            <Card3D depth={0.6} className="section-reveal rounded-2xl p-8 md:row-span-2 flex flex-col justify-between"
              style={{ background: 'linear-gradient(135deg, rgba(103,80,165,0.25), rgba(123,82,112,0.15))', border: '1px solid rgba(103,80,165,0.2)', minHeight: '420px' }}>
              <div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(103,80,165,0.3)' }}>
                  <span className="material-symbols-outlined text-[#bba2fd]" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>rate_review</span>
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '26px', marginBottom: '14px', letterSpacing: '-0.5px' }}>
                  Live website review canvas
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '360px' }}>
                  Load any URL and review it like it's open in your browser. Pin issues directly on elements — no screenshots, no guessing.
                </p>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="p-4 space-y-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                        style={{ background: n === 1 ? '#6750a5' : '#7b5270', fontSize: '11px' }}>{n}</div>
                      <div className="h-2 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.08)' }}></div>
                      <div className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(103,80,165,0.3)', color: '#bba2fd', fontSize: '9px' }}>PIN</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card3D>

            {/* Small features */}
            {[
              { icon: 'bug_report', title: 'Issue Tracker', desc: 'Auto-convert pins into tracked issues with severity, status, and assignees.' },
              { icon: 'insights', title: 'AI Health Score', desc: 'Gemini analyzes all data and scores your design 0–100 with actionable breakdowns.' },
            ].map((f, i) => (
              <Card3D key={i} depth={0.6} className="section-reveal rounded-2xl p-7 border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(103,80,165,0.12)' }}>
                <span className="material-symbols-outlined mb-4 block" style={{ color: '#9b7fd4', fontSize: '28px' }}>{f.icon}</span>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</p>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center section-reveal">
          <div className="rounded-3xl p-16 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(103,80,165,0.3), rgba(123,82,112,0.2))', border: '1px solid rgba(103,80,165,0.25)' }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[600px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(103,80,165,0.12) 0%, transparent 70%)' }} />
            </div>
            <div className="relative z-10">
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>
                Your team's websites deserve<br />better feedback loops.
              </h2>
              <p className="mb-10" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '17px', color: 'rgba(255,255,255,0.4)' }}>
                Join thousands of product teams shipping cleaner UX.
              </p>
              <button onClick={handleCTA}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #6750a5, #9b7fd4)', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 60px rgba(103,80,165,0.4)', fontSize: '16px' }}>
                <span className="material-symbols-outlined">arrow_forward</span>
                Create free account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-8 py-10" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            Web<span style={{ color: '#6750a5' }}>Insight</span> © 2026
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Docs', 'API'].map((l) => (
              <a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}
                className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* Scroll reveal script */}
      <ScrollReveal />
    </div>
  );
}

function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.section-reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}