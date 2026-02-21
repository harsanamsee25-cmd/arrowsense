const POLLUTANTS = ['pm25', 'pm10', 'no2', 'so2', 'co2']
const LABELS = { pm25: 'PM2.5', pm10: 'PM10', no2: 'NO₂', so2: 'SO₂', co2: 'CO₂' }

function getStatus(reading, limits) {
    if (!reading || !limits) return 'unknown'
    const violations = POLLUTANTS.filter(p => reading[p] && limits[p] && reading[p] > limits[p])
    const warnings = POLLUTANTS.filter(p => reading[p] && limits[p] && reading[p] / limits[p] >= 0.8 && reading[p] <= limits[p])

    if (violations.length > 0) return 'danger'
    if (warnings.length > 0) return 'warning'
    return 'safe'
}

export default function ComplianceMatrix({ reading, limits }) {
    const overall = getStatus(reading, limits)

    const statusMap = {
        safe: { label: 'WITHIN SAFE LIMITS', color: 'var(--safe)', bg: 'rgba(57,255,20,0.07)', icon: '✓' },
        warning: { label: 'WARNING', color: 'var(--warning)', bg: 'rgba(255,184,0,0.07)', icon: '!' },
        danger: { label: 'VIOLATION DETECTED', color: 'var(--danger)', bg: 'rgba(255,46,46,0.09)', icon: '⚠' },
        unknown: { label: 'NO DATA', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)', icon: '—' },
    }

    const cfg = statusMap[overall]

    return (
        <div className="glass-card" style={{ padding: 20 }}>
            <div style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                color: 'var(--text-muted)', textTransform: 'uppercase',
                fontFamily: 'var(--font-head)', marginBottom: 14,
            }}>
                Compliance Matrix
            </div>

            {/* Big status */}
            <div style={{
                background: cfg.bg, border: `1px solid ${cfg.color}33`,
                borderRadius: 10, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                animation: overall === 'danger' ? 'flicker 3s ease-in-out infinite' : 'none',
            }}>
                <span style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${cfg.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', color: cfg.color, fontWeight: 700,
                    flexShrink: 0,
                }}>
                    {cfg.icon}
                </span>
                <span style={{
                    fontFamily: 'var(--font-head)', fontWeight: 800,
                    fontSize: '0.88rem', letterSpacing: '0.08em',
                    color: cfg.color, textTransform: 'uppercase',
                }}>
                    {cfg.label}
                </span>
            </div>

            {/* Per-pollutant rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {POLLUTANTS.map(p => {
                    const val = reading?.[p]
                    const lim = limits?.[p]
                    const pct = val && lim ? (val / lim) * 100 : 0
                    const st = !val || !lim ? 'unknown'
                        : pct >= 100 ? 'danger'
                            : pct >= 80 ? 'warning'
                                : 'safe'
                    const col = st === 'danger' ? 'var(--danger)'
                        : st === 'warning' ? 'var(--warning)'
                            : st === 'safe' ? 'var(--safe)'
                                : 'var(--text-muted)'

                    return (
                        <div key={p} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '6px 8px', borderRadius: 6,
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: col, flexShrink: 0,
                                boxShadow: `0 0 6px ${col}`,
                            }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 44, fontFamily: 'var(--font-data)' }}>
                                {LABELS[p]}
                            </span>
                            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                <div style={{
                                    height: 2, borderRadius: 2, width: `${Math.min(pct, 100)}%`,
                                    background: col, transition: 'width 0.6s',
                                }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: col, fontWeight: 600, width: 36, textAlign: 'right' }}>
                                {val ? `${Math.round(pct)}%` : '—'}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
