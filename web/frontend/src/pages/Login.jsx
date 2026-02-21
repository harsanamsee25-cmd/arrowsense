import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const nav = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const r = await api.post('/login', { username, password })
            login(r.data.token, { username: r.data.username, role: r.data.role })
            nav('/admin')
        } catch {
            setError('Invalid credentials. Default: admin / admin123')
        }
        setLoading(false)
    }

    return (
        <div className="app-bg" style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center', paddingTop: 64,
        }}>
            <div className="radial-glow" style={{
                width: 400, height: 400, background: '#00F5FF',
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05,
            }} />

            <div className="animate-fade-up delay-1 glass-card" style={{
                width: '100%', maxWidth: 420, padding: '44px 40px',
                position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem',
                        color: 'var(--accent-primary)', letterSpacing: '-0.02em', marginBottom: 6
                    }}>
                        AEROSENSE
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        Admin Authentication
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{
                            display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)',
                            letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-head)',
                            marginBottom: 6
                        }}>
                            Username
                        </label>
                        <input
                            className="input-field"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)',
                            letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-head)',
                            marginBottom: 6
                        }}>
                            Password
                        </label>
                        <input
                            className="input-field"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 8,
                            background: 'rgba(255,46,46,0.08)', border: '1px solid rgba(255,46,46,0.2)',
                            fontSize: '0.78rem', color: 'var(--danger)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: 8, width: '100%' }}
                        disabled={loading}>
                        {loading ? 'Authenticating…' : 'Enter Command Center'}
                    </button>
                </form>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Link to="/" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                        onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
