import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import api from '../api'

const POLLUTANTS = ['pm25', 'pm10', 'no2', 'so2', 'co2']
const P_LABELS = { pm25: 'PM2.5', pm10: 'PM10', no2: 'NO₂', so2: 'SO₂', co2: 'CO₂' }

function complianceColor(score) {
    if (score == null) return 'var(--text-muted)'
    if (score >= 80) return 'var(--safe)'
    if (score >= 50) return 'var(--warning)'
    return 'var(--danger)'
}

function RiskBadge({ score }) {
    const risk = score == null ? 'unknown' : score >= 80 ? 'low' : score >= 50 ? 'medium' : 'high'
    const map = {
        low: { label: 'LOW RISK', cls: 'badge-safe' },
        medium: { label: 'MEDIUM RISK', cls: 'badge-warning' },
        high: { label: 'HIGH RISK', cls: 'badge-danger' },
        unknown: { label: 'NO DATA', cls: '' },
    }
    const cfg = map[risk]
    return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
}

function IndustryCard({ industry, onClick, selected }) {
    const score = industry.compliance_score
    const col = complianceColor(score)

    return (
        <div onClick={onClick} style={{
            cursor: 'pointer', padding: '22px 20px',
            background: selected ? 'rgba(0,245,255,0.07)' : 'rgba(255,255,255,0.02)',
            border: selected
                ? '1px solid rgba(0,245,255,0.3)'
                : '1px solid var(--glass-border)',
            borderRadius: 14, transition: 'all 0.2s',
        }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = selected ? 'rgba(0,245,255,0.3)' : 'var(--glass-border)'}
        >
            {/* Score arc */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-head)', fontWeight: 700,
                        fontSize: '0.98rem', letterSpacing: '-0.01em', marginBottom: 4
                    }}>
                        {industry.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {industry.location}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontFamily: 'var(--font-data)', fontWeight: 700,
                        fontSize: '2rem', color: col, lineHeight: 1
                    }}>
                        {score != null ? Math.round(score) : '—'}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SCORE</div>
                </div>
            </div>

            {/* Overall bar */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 12 }}>
                <div style={{
                    height: 3, borderRadius: 2, width: `${score ?? 0}%`,
                    background: col, boxShadow: `0 0 8px ${col}55`,
                    transition: 'width 0.8s', maxWidth: '100%',
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <RiskBadge score={score} />
                <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Type: <span style={{ color: 'var(--accent-primary)' }}>{industry.industry_type}</span>
                    </span>
                    {industry.violations_count > 0 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--danger)' }}>
                            ⚠ {industry.violations_count} violations
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

const CustomBar = (props) => {
    const { x, y, width, height, value, limit } = props
    const pct = limit ? (value / limit) * 100 : 0
    const color = pct >= 100 ? '#FF2E2E' : pct >= 80 ? '#FFB800' : '#39FF14'
    return <rect x={x} y={y} width={width} height={height} fill={color} rx={2} />
}

export default function Industries() {
    const [industries, setIndustries] = useState([])
    const [selected, setSelected] = useState(null)
    const [history, setHistory] = useState([])
    const [limits, setLimits] = useState(null)
    const [loading, setLoading] = useState(true)
    const nav = useNavigate()

    useEffect(() => {
        api.get('/industries').then(r => {
            setIndustries(r.data)
            if (r.data.length) setSelected(r.data[0])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!selected) return
        api.get(`/history/${selected.id}?limit=20`).then(r => setHistory(r.data)).catch(() => { })
        api.get(`/safe-limits/${encodeURIComponent(selected.industry_type)}`).then(r => setLimits(r.data)).catch(() => { })
    }, [selected?.id])

    if (loading) return (
        <div className="app-bg" style={{
            minHeight: '100vh', paddingTop: 100, display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em' }}>
                LOADING INTELLIGENCE...
            </span>
        </div>
    )

    // Chart data — average per pollutant vs limit
    const chartData = limits ? POLLUTANTS.map(p => {
        const vals = history.map(r => r[p]).filter(Boolean)
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
        return { name: P_LABELS[p], value: Math.round(avg * 10) / 10, limit: limits[p] }
    }) : []

    return (
        <div className="app-bg" style={{ minHeight: '100vh', paddingTop: 64 }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>

                <div className="animate-fade-up delay-1" style={{ marginBottom: 32 }}>
                    <div style={{
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                        color: 'var(--text-muted)', textTransform: 'uppercase',
                        fontFamily: 'var(--font-head)', marginBottom: 8
                    }}>
                        Intelligence Network
                    </div>
                    <h1 className="font-head" style={{
                        margin: 0, fontSize: '2.4rem', fontWeight: 800,
                        letterSpacing: '-0.03em'
                    }}>
                        INDUSTRY <span style={{ color: 'var(--accent-primary)' }}>INTELLIGENCE</span>
                    </h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

                    {/* Industry list */}
                    <div className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {industries.map(ind => (
                            <IndustryCard
                                key={ind.id}
                                industry={ind}
                                selected={selected?.id === ind.id}
                                onClick={() => setSelected(ind)}
                            />
                        ))}
                    </div>

                    {/* Detail panel */}
                    {selected && (
                        <div className="animate-fade-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {/* Header */}
                            <div className="glass-card" style={{ padding: '24px 28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 className="font-head" style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 800 }}>
                                            {selected.name}
                                        </h2>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{selected.location}</div>
                                        <div style={{ marginTop: 10 }}>
                                            <span className="badge" style={{
                                                background: 'rgba(0,245,255,0.08)', color: 'var(--accent-primary)',
                                                border: '1px solid rgba(0,245,255,0.2)',
                                            }}>{selected.industry_type}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontFamily: 'var(--font-data)', fontWeight: 800, fontSize: '3rem',
                                            color: complianceColor(selected.compliance_score), lineHeight: 1,
                                        }}>{selected.compliance_score != null ? Math.round(selected.compliance_score) : '—'}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                                            COMPLIANCE SCORE
                                        </div>
                                        <button
                                            className="btn-ghost"
                                            style={{ marginTop: 12, padding: '6px 14px', fontSize: '0.72rem' }}
                                            onClick={() => nav('/admin')}
                                        >
                                            Admin Actions →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Avg readings vs limits bar chart */}
                            {chartData.length > 0 && (
                                <div className="glass-card" style={{ padding: '20px 16px 8px' }}>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                                        color: 'var(--text-muted)', textTransform: 'uppercase',
                                        fontFamily: 'var(--font-head)', marginBottom: 16
                                    }}>
                                        Avg Readings vs Safe Limits (Last 20 scans)
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ background: 'rgba(10,15,28,0.95)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 8 }}
                                                labelStyle={{ color: 'var(--text-primary)', fontFamily: 'var(--font-data)' }}
                                                itemStyle={{ color: 'var(--accent-primary)' }}
                                            />
                                            <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Avg Value">
                                                {chartData.map((entry, i) => <CustomBar key={i} {...entry} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    {/* Limit indicators */}
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, paddingLeft: 8 }}>
                                        {chartData.map(d => (
                                            <div key={d.name} style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                <span style={{ color: 'var(--text-primary)' }}>{d.name}</span> limit: {d.limit}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Safe limits table */}
                            {limits && (
                                <div className="glass-card" style={{ padding: '20px 24px' }}>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                                        color: 'var(--text-muted)', textTransform: 'uppercase',
                                        fontFamily: 'var(--font-head)', marginBottom: 14
                                    }}>
                                        Regulatory Safe Limits · {limits.industry_type}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                                        {POLLUTANTS.map(p => (
                                            <div key={p} style={{
                                                textAlign: 'center', padding: '12px 8px',
                                                background: 'rgba(0,245,255,0.04)', borderRadius: 8,
                                                border: '1px solid var(--glass-border)'
                                            }}>
                                                <div style={{
                                                    fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: '1.4rem',
                                                    color: 'var(--accent-primary)'
                                                }}>{limits[p]}</div>
                                                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                    {P_LABELS[p]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
