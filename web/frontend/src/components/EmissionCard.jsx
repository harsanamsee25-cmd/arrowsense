function getState(value, limit) {
    if (!value || !limit) return 'safe'
    const pct = (value / limit) * 100
    if (pct < 80) return 'safe'
    if (pct < 100) return 'warning'
    return 'danger'
}

const STATE_STYLE = {
    safe: { color: 'var(--safe)', border: 'rgba(57,255,20,0.25)', glow: '0 0 24px rgba(57,255,20,0.12)' },
    warning: { color: 'var(--warning)', border: 'rgba(255,184,0,0.25)', glow: '0 0 24px rgba(255,184,0,0.12)' },
    danger: { color: 'var(--danger)', border: 'rgba(255,46,46,0.3)', glow: '0 0 24px rgba(255,46,46,0.15)' },
}

const UNITS = { pm25: 'µg/m³', pm10: 'µg/m³', no2: 'µg/m³', so2: 'µg/m³', co2: 'ppm' }
const LABELS = { pm25: 'PM2.5', pm10: 'PM10', no2: 'NO₂', so2: 'SO₂', co2: 'CO₂' }

export default function EmissionCard({ pollutant, value, limit, animDelay = 0 }) {
    const st = getState(value, limit)
    const sty = STATE_STYLE[st]
    const pct = value && limit ? Math.round((value / limit) * 100) : 0
    const displayVal = value != null ? value.toFixed(1) : '—'

    return (
        <div className="animate-fade-up glass-card" style={{
            padding: '24px 20px',
            border: `1px solid ${sty.border}`,
            boxShadow: sty.glow,
            display: 'flex', flexDirection: 'column', gap: 8,
            animationDelay: `${animDelay}s`,
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background accent */}
            <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: sty.color, opacity: 0.05, filter: 'blur(20px)',
            }} />

            <span style={{
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em',
                color: 'var(--text-muted)', textTransform: 'uppercase',
                fontFamily: 'var(--font-head)',
            }}>
                {LABELS[pollutant] || pollutant}
            </span>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="emission-value" style={{ color: sty.color, fontSize: value > 999 ? '2.6rem' : '3.5rem' }}>
                    {displayVal}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
                    {UNITS[pollutant]}
                </span>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{
                    height: 3, borderRadius: 2,
                    width: `${Math.min(pct, 100)}%`,
                    background: sty.color,
                    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: `0 0 8px ${sty.color}`,
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Limit: <span style={{ color: 'var(--text-primary)' }}>{limit}</span>
                </span>
                <span style={{
                    fontSize: '0.72rem', fontWeight: 700, color: sty.color,
                    letterSpacing: '0.06em',
                }}>
                    {pct}%
                </span>
            </div>

            {st === 'danger' && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: '0.65rem', fontWeight: 700, color: 'var(--danger)',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    animation: 'flicker 2s ease-in-out infinite',
                }}>
                    ⚠ VIOLATION
                </div>
            )}
        </div>
    )
}
