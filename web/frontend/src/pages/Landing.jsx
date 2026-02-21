import { useNavigate } from 'react-router-dom'
import Drone3D from '../components/Drone3D'

export default function Landing() {
    const nav = useNavigate()

    return (
        <div className="app-bg" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Decorative radial glows */}
            <div className="radial-glow" style={{
                width: 700, height: 700, background: '#00F5FF',
                top: -150, left: '50%', transform: 'translateX(-50%)', opacity: 0.06,
            }} />
            <div className="radial-glow" style={{
                width: 320, height: 320, background: '#FF7B2C',
                bottom: 80, right: '8%', opacity: 0.05,
            }} />

            {/* Hero section */}
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                paddingTop: 64, position: 'relative', zIndex: 1,
            }}>
                {/* Live tag */}
                <div className="animate-fade-up delay-1" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.2)',
                    borderRadius: 100, padding: '6px 18px', marginBottom: 24,
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)',
                        animation: 'blink 1.2s step-end infinite',
                    }} />
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em',
                        color: 'var(--accent-primary)', fontFamily: 'var(--font-head)', textTransform: 'uppercase',
                    }}>
                        Live Drone Network · Active
                    </span>
                </div>

                {/* ── 3D Interactive Drone ── */}
                <div className="animate-fade-up delay-2" style={{ position: 'relative', marginBottom: 16 }}>
                    {/* CSS orbit rings behind the canvas */}
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none', zIndex: 0,
                    }}>
                        <svg width="500" height="500" viewBox="-250 -250 500 500" style={{ opacity: 0.5 }}>
                            <circle cx="0" cy="0" r="200" fill="none"
                                stroke="rgba(0,245,255,0.06)" strokeWidth="1" strokeDasharray="5 7" />
                            <circle cx="0" cy="0" r="150" fill="none"
                                stroke="rgba(0,245,255,0.04)" strokeWidth="1" />
                            <circle cx="0" cy="0" r="200" fill="none"
                                stroke="rgba(0,245,255,0.05)" strokeWidth="1"
                                style={{ animation: 'pulse-ring 3.5s ease-out infinite' }} />
                        </svg>
                    </div>

                    <Drone3D width="480px" height="460px" />
                </div>

                {/* Headline */}
                <h1 className="animate-fade-up delay-3 font-head" style={{
                    fontSize: 'clamp(2.6rem, 5.5vw, 5rem)',
                    fontWeight: 800, lineHeight: 1.0,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                    textAlign: 'center', margin: 0,
                }}>
                    AUTONOMOUS<br />
                    <span style={{
                        background: 'linear-gradient(90deg, var(--accent-primary), #00A8B5)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        EMISSION INTELLIGENCE
                    </span>
                </h1>

                <p className="animate-fade-up delay-4" style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '1.05rem', color: 'var(--text-muted)',
                    marginTop: 18, marginBottom: 36,
                    textAlign: 'center', letterSpacing: '0.02em',
                    maxWidth: 480,
                }}>
                    From Monitoring Pollution to Eliminating It.
                </p>

                <div className="animate-fade-up delay-5" style={{ display: 'flex', gap: 16 }}>
                    <button className="btn-primary" onClick={() => nav('/dashboard')}>
                        Enter Command Center
                    </button>
                    <button className="btn-ghost" onClick={() => nav('/industries')}>
                        View Industries
                    </button>
                </div>

                {/* Stats strip */}
                <div className="animate-fade-up delay-6" style={{
                    display: 'flex', gap: 0, marginTop: 64,
                    border: '1px solid var(--glass-border)', borderRadius: 12, overflow: 'hidden',
                }}>
                    {[
                        { value: '6', label: 'Industries Monitored' },
                        { value: '5', label: 'Pollutants Tracked' },
                        { value: '24/7', label: 'Autonomous Operation' },
                        { value: '< 5s', label: 'Update Latency' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            padding: '20px 36px', textAlign: 'center',
                            borderRight: i < 3 ? '1px solid var(--glass-border)' : 'none',
                            background: 'rgba(0,245,255,0.03)',
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem',
                                color: 'var(--accent-primary)', letterSpacing: '-0.02em',
                            }}>{s.value}</div>
                            <div style={{
                                fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em',
                                marginTop: 4, textTransform: 'uppercase',
                            }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
