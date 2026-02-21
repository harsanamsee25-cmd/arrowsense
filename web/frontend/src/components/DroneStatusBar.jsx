const STATE_CONFIG = {
    traveling: { color: '#FFB800', label: 'TRAVELING', icon: '✈', pulse: false },
    scanning: { color: '#00F5FF', label: 'SCANNING', icon: '⬡', pulse: true },
    uploading: { color: '#39FF14', label: 'UPLOADING', icon: '↑', pulse: false },
}

export default function DroneStatusBar({ droneState }) {
    const state = droneState?.state || 'traveling'
    const cfg = STATE_CONFIG[state] || STATE_CONFIG.traveling
    const industryName = droneState?.industry_name || '—'

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 24,
            background: 'rgba(0,245,255,0.04)',
            border: '1px solid rgba(0,245,255,0.1)',
            borderRadius: 12, padding: '12px 28px',
            fontFamily: 'var(--font-data)',
        }}>
            {/* Animated indicator */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {cfg.pulse && (
                    <span style={{
                        position: 'absolute', width: 12, height: 12, borderRadius: '50%',
                        background: cfg.color, opacity: 0.4,
                        animation: 'pulse-ring 1.8s ease-out infinite',
                        transform: 'scale(1)',
                    }} />
                )}
                <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: cfg.color, boxShadow: `0 0 10px ${cfg.color}`,
                    display: 'inline-block', flexShrink: 0,
                }} />
            </div>

            <span style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em',
                color: cfg.color, textTransform: 'uppercase'
            }}>
                DRONE · {cfg.label}
            </span>

            <span style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.08)' }} />

            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Target:&nbsp;
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{industryName}</span>
            </span>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {['traveling', 'scanning', 'uploading'].map(s => (
                    <div key={s} style={{
                        width: 32, height: 4, borderRadius: 2,
                        background: state === s ? cfg.color : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.4s',
                    }} />
                ))}
            </div>
        </div>
    )
}
