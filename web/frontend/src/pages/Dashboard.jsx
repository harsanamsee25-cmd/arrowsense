import { useState, useEffect, useRef } from 'react'
import DroneStatusBar from '../components/DroneStatusBar'
import EmissionCard from '../components/EmissionCard'
import ComplianceMatrix from '../components/ComplianceMatrix'
import LiveChart from '../components/LiveChart'
import { useSocket } from '../hooks/useSocket'
import api from '../api'

const POLLUTANTS = ['pm25', 'pm10', 'no2', 'so2', 'co2']

export default function Dashboard() {
    const { connected, droneState, liveReading } = useSocket()
    const [industries, setIndustries] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [history, setHistory] = useState([])
    const [currentReading, setCurrentReading] = useState(null)
    const [currentLimits, setCurrentLimits] = useState(null)
    const historyRef = useRef([])

    // Load industries on mount
    useEffect(() => {
        api.get('/industries').then(r => {
            setIndustries(r.data)
            if (r.data.length) setSelectedId(r.data[0].id)
        }).catch(() => { })
    }, [])

    // When drone switches industry, auto-select it
    useEffect(() => {
        if (droneState?.industry_id) {
            setSelectedId(droneState.industry_id)
        }
    }, [droneState?.industry_id])

    // Load history for selected industry
    useEffect(() => {
        if (!selectedId) return
        api.get(`/history/${selectedId}?limit=40`).then(r => {
            historyRef.current = r.data
            setHistory([...r.data])
        }).catch(() => { })
        api.get(`/live/${selectedId}`).then(r => {
            setCurrentReading(r.data)
            setCurrentLimits(r.data.limits)
        }).catch(() => { })
    }, [selectedId])

    // Live WebSocket reading
    useEffect(() => {
        if (!liveReading) return
        if (liveReading.industry_id !== selectedId) return
        setCurrentReading(liveReading)
        setCurrentLimits(liveReading.limits)
        historyRef.current = [...historyRef.current.slice(-39), liveReading]
        setHistory([...historyRef.current])
    }, [liveReading])

    const limits = currentLimits || {}
    const reading = currentReading || {}
    const selectedIndustry = industries.find(i => i.id === selectedId)

    return (
        <div className="app-bg" style={{ minHeight: '100vh', paddingTop: 64 }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="animate-fade-up delay-1" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{
                                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                                color: 'var(--text-muted)', textTransform: 'uppercase',
                                fontFamily: 'var(--font-head)', marginBottom: 6
                            }}>
                                Live Command Dashboard
                            </div>
                            <h1 className="font-head" style={{
                                margin: 0, fontSize: '2.2rem', fontWeight: 800,
                                letterSpacing: '-0.03em', lineHeight: 1.1
                            }}>
                                EMISSION <span style={{ color: 'var(--accent-primary)' }}>COMMAND CENTER</span>
                            </h1>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: connected ? 'var(--safe)' : 'var(--danger)',
                                boxShadow: connected ? '0 0 10px var(--safe)' : '0 0 10px var(--danger)',
                                display: 'inline-block',
                            }} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em' }}>
                                {connected ? 'LIVE · CONNECTED' : 'DISCONNECTED'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Drone status bar */}
                <div className="animate-fade-up delay-2" style={{ marginBottom: 24 }}>
                    <DroneStatusBar droneState={droneState} />
                </div>

                {/* Industry selector tabs */}
                <div className="animate-fade-up delay-2" style={{
                    display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
                }}>
                    {industries.map(ind => (
                        <button key={ind.id} onClick={() => setSelectedId(ind.id)} style={{
                            padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
                            fontFamily: 'var(--font-head)', fontWeight: 600,
                            fontSize: '0.75rem', letterSpacing: '0.05em',
                            border: selectedId === ind.id ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                            background: selectedId === ind.id ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.03)',
                            color: selectedId === ind.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                            transition: 'all 0.2s',
                        }}>
                            {ind.name.split(' ').slice(0, 2).join(' ')}
                        </button>
                    ))}
                </div>

                {/* Selected industry info */}
                {selectedIndustry && (
                    <div className="animate-fade-up delay-2" style={{
                        marginBottom: 20,
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <span className="badge badge-safe" style={{
                            background: 'rgba(0,245,255,0.08)', color: 'var(--accent-primary)',
                            border: '1px solid rgba(0,245,255,0.2)',
                        }}>
                            {selectedIndustry.industry_type}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {selectedIndustry.location}
                        </span>
                        {currentReading?.timestamp && (
                            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                Last update: {new Date(currentReading.timestamp).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                )}

                {/* Main grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 300px',
                    gridTemplateRows: 'auto auto',
                    gap: 16,
                }}>
                    {/* Emission cards – 5 pollutants */}
                    {POLLUTANTS.map((p, i) => (
                        <div key={p} className="animate-fade-up" style={{ animationDelay: `${0.3 + i * 0.08}s`, opacity: 0 }}>
                            <EmissionCard
                                pollutant={p}
                                value={reading?.[p]}
                                limit={limits?.[p]}
                                animDelay={0}
                            />
                        </div>
                    ))}

                    {/* Compliance matrix — last column, spans 2 rows */}
                    <div className="animate-fade-up delay-4" style={{ gridRow: '1 / 3' }}>
                        <ComplianceMatrix reading={currentReading} limits={currentLimits} />

                        {/* Temp/Humidity widget */}
                        <div className="glass-card" style={{ marginTop: 16, padding: 18 }}>
                            <div style={{
                                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em',
                                color: 'var(--text-muted)', textTransform: 'uppercase',
                                fontFamily: 'var(--font-head)', marginBottom: 12
                            }}>
                                Environmental
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { label: 'TEMP', value: reading?.temperature, unit: '°C', color: '#FF6B6B' },
                                    { label: 'HUMIDITY', value: reading?.humidity, unit: '%', color: '#4ECDC4' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        textAlign: 'center', padding: '12px 8px',
                                        background: 'rgba(255,255,255,0.03)', borderRadius: 8
                                    }}>
                                        <div style={{
                                            fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-data)',
                                            color: item.color
                                        }}>
                                            {item.value?.toFixed(1) ?? '—'}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.unit}</div>
                                        <div style={{
                                            fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em',
                                            fontFamily: 'var(--font-head)', marginTop: 2
                                        }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Live chart — spans 3 columns */}
                    <div className="animate-fade-up delay-5" style={{ gridColumn: '1 / 4' }}>
                        <LiveChart data={history} />
                    </div>
                </div>
            </div>
        </div>
    )
}
