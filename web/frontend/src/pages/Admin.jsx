import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const ACTIONS = ['Notice Issued', 'Fine Imposed', 'Operations Closed']
const POLLUTANTS = ['pm25', 'pm10', 'no2', 'so2', 'co2']
const P_LABELS = { pm25: 'PM2.5', pm10: 'PM10', no2: 'NO₂', so2: 'SO₂', co2: 'CO₂' }

function ViolationRow({ v, onSelect, selected }) {
    return (
        <div onClick={() => onSelect(v)} style={{
            padding: '14px 18px', borderRadius: 10, cursor: 'pointer',
            background: selected ? 'rgba(255,46,46,0.08)' : 'rgba(255,255,255,0.02)',
            border: selected ? '1px solid rgba(255,46,46,0.3)' : '1px solid var(--glass-border)',
            transition: 'all 0.2s', marginBottom: 8,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                        {v.industry_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(v.timestamp).toLocaleString()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {POLLUTANTS.filter(p => v[p] && v.limits?.[p] && v[p] > v.limits[p]).map(p => (
                        <span key={p} className="badge badge-danger" style={{ fontSize: '0.62rem' }}>
                            {P_LABELS[p]} ↑
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function Admin() {
    const { isAuth, logout } = useAuth()
    const nav = useNavigate()
    const [violations, setViolations] = useState([])
    const [selected, setSelected] = useState(null)
    const [industries, setIndustries] = useState([])
    const [selectedIndustry, setSelectedIndustry] = useState('')
    const [comment, setComment] = useState('')
    const [action, setAction] = useState('Notice Issued')
    const [email, setEmail] = useState('')
    const [sending, setSending] = useState(false)
    const [statusMsg, setStatusMsg] = useState('')
    const [comments, setComments] = useState([])
    const [tab, setTab] = useState('violations')

    useEffect(() => {
        if (!isAuth) { nav('/login'); return }
        api.get('/violations').then(r => {
            setViolations(r.data)
            if (r.data.length) { setSelected(r.data[0]); setSelectedIndustry(String(r.data[0].industry_id)) }
        }).catch(() => { })
        api.get('/industries').then(r => setIndustries(r.data)).catch(() => { })
    }, [isAuth])

    useEffect(() => {
        if (!selectedIndustry) return
        api.get(`/comments/${selectedIndustry}`).then(r => setComments(r.data)).catch(() => { })
    }, [selectedIndustry])

    const handleComment = async () => {
        if (!comment.trim() || !selectedIndustry) return
        await api.post('/comment', {
            industry_id: parseInt(selectedIndustry),
            reading_id: selected?.id || null,
            comment, action,
        })
        setComment('')
        setStatusMsg('✓ Comment saved.')
        api.get(`/comments/${selectedIndustry}`).then(r => setComments(r.data)).catch(() => { })
        setTimeout(() => setStatusMsg(''), 3000)
    }

    const handleSendEmail = async () => {
        if (!selectedIndustry) return
        setSending(true)
        try {
            const r = await api.post('/send-notice', {
                industry_id: parseInt(selectedIndustry),
                action, comment, email,
            })
            if (r.data.success) {
                if (r.data.mode === 'demo') {
                    setStatusMsg(`✓ Demo: Notice logged for ${r.data.email_sent_to} (configure SMTP to send real emails)`)
                } else {
                    setStatusMsg(`✓ Email sent to ${r.data.email_sent_to}`)
                }
            } else {
                setStatusMsg('⚠ Email send failed (check SMTP config in backend/.env)')
            }
        } catch {
            setStatusMsg('⚠ Server error. Is the backend running?')
        }
        setSending(false)
        setTimeout(() => setStatusMsg(''), 6000)
    }


    const handleDownloadPDF = () => {
        if (!selectedIndustry) return
        window.open(`http://localhost:5000/api/pdf/${selectedIndustry}`, '_blank')
    }

    const ind = industries.find(i => String(i.id) === selectedIndustry)

    return (
        <div className="app-bg" style={{ minHeight: '100vh', paddingTop: 64 }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="animate-fade-up delay-1" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{
                            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                            color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-head)', marginBottom: 8
                        }}>
                            Secure Admin Terminal
                        </div>
                        <h1 className="font-head" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                            ADMIN <span style={{ color: 'var(--danger)' }}>CONTROL PANEL</span>
                        </h1>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {violations.length} violation{violations.length !== 1 ? 's' : ''} recorded
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

                    {/* Left — violations list + detail */}
                    <div>
                        {/* Tab bar */}
                        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                            {['violations', 'comments'].map(t => (
                                <button key={t} onClick={() => setTab(t)} style={{
                                    padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
                                    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.75rem',
                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                    border: tab === t ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
                                    background: tab === t ? 'rgba(255,46,46,0.08)' : 'transparent',
                                    color: tab === t ? 'var(--danger)' : 'var(--text-muted)',
                                    transition: 'all 0.2s',
                                }}>
                                    {t === 'violations' ? `Violations (${violations.length})` : 'Action Log'}
                                </button>
                            ))}
                        </div>

                        {tab === 'violations' && (
                            <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
                                {violations.length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontFamily: 'var(--font-data)' }}>
                                        No violations detected.
                                    </div>
                                ) : violations.map(v => (
                                    <ViolationRow key={v.id} v={v} selected={selected?.id === v.id}
                                        onSelect={(v) => { setSelected(v); setSelectedIndustry(String(v.industry_id)) }} />
                                ))}
                            </div>
                        )}

                        {tab === 'comments' && (
                            <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
                                {comments.length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No actions recorded.</div>
                                ) : comments.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: '14px 18px', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span className="badge badge-danger" style={{ fontSize: '0.62rem' }}>{c.action}</span>
                                            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
                                                {new Date(c.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={{ margin: '4px 0', fontSize: '0.82rem', lineHeight: 1.5 }}>{c.comment}</p>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>— {c.officer}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right — Action panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Selected violation detail */}
                        {selected && (
                            <div className="glass-card" style={{ padding: '18px 20px' }}>
                                <div style={{
                                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em',
                                    color: 'var(--danger)', textTransform: 'uppercase', fontFamily: 'var(--font-head)', marginBottom: 10
                                }}>
                                    ⚠ Violation Detail
                                </div>
                                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                                    {selected.industry_name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                                    {new Date(selected.timestamp).toLocaleString()}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                    {POLLUTANTS.map(p => {
                                        if (!selected[p]) return null
                                        const limit = selected.limits?.[p]
                                        const over = limit && selected[p] > limit
                                        return (
                                            <div key={p} style={{
                                                padding: '8px 10px', borderRadius: 6,
                                                background: over ? 'rgba(255,46,46,0.08)' : 'rgba(57,255,20,0.06)',
                                                border: `1px solid ${over ? 'rgba(255,46,46,0.2)' : 'rgba(57,255,20,0.1)'}`
                                            }}>
                                                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{P_LABELS[p]}</div>
                                                <div style={{ fontWeight: 700, color: over ? 'var(--danger)' : 'var(--safe)', fontSize: '1rem' }}>
                                                    {selected[p]?.toFixed(1)}
                                                </div>
                                                {limit && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>limit: {limit}</div>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action form */}
                        <div className="glass-card" style={{ padding: '20px' }}>
                            <div style={{
                                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em',
                                color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-head)', marginBottom: 14
                            }}>
                                Issue Action
                            </div>

                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                    Industry
                                </label>
                                <select className="input-field" value={selectedIndustry}
                                    onChange={e => setSelectedIndustry(e.target.value)}>
                                    <option value="">Select industry…</option>
                                    {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                    Action
                                </label>
                                <select className="input-field" value={action} onChange={e => setAction(e.target.value)}>
                                    {ACTIONS.map(a => <option key={a}>{a}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                    Officer Remarks
                                </label>
                                <textarea className="input-field" rows={3} value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Enter your remarks…"
                                    style={{ resize: 'vertical' }} />
                            </div>

                            <button className="btn-ghost" style={{ width: '100%', marginBottom: 12 }}
                                onClick={handleComment}>
                                Save Comment
                            </button>

                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                    Send Notice To (email)
                                </label>
                                <input className="input-field" type="email" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={ind?.contact_email || 'industry@example.com'} />
                            </div>

                            <button className="btn-danger" style={{ width: '100%', marginBottom: 8 }}
                                onClick={handleSendEmail} disabled={sending}>
                                {sending ? 'Sending…' : '⚡ Send Email Notice'}
                            </button>

                            <button className="btn-ghost" style={{ width: '100%' }} onClick={handleDownloadPDF}>
                                ↓ Download PDF Report
                            </button>

                            {statusMsg && (
                                <div style={{
                                    marginTop: 12, padding: '10px 14px', borderRadius: 8,
                                    background: statusMsg.includes('✓') ? 'rgba(57,255,20,0.08)' : 'rgba(255,184,0,0.08)',
                                    border: `1px solid ${statusMsg.includes('✓') ? 'rgba(57,255,20,0.2)' : 'rgba(255,184,0,0.2)'}`,
                                    fontSize: '0.78rem', color: statusMsg.includes('✓') ? 'var(--safe)' : 'var(--warning)',
                                }}>
                                    {statusMsg}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
