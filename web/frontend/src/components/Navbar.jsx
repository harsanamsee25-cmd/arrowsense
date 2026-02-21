import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Command Center' },
    { to: '/industries', label: 'Industries' },
    { to: '/admin', label: 'Admin' },
]

export default function Navbar() {
    const { pathname } = useLocation()
    const { isAuth, logout, user } = useAuth()
    const nav = useNavigate()

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                        <circle cx="13" cy="13" r="12" stroke="#00F5FF" strokeWidth="1.5" />
                        <circle cx="13" cy="13" r="4" fill="#00F5FF" opacity="0.9" />
                        <line x1="13" y1="1" x2="13" y2="6" stroke="#00F5FF" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="13" y1="20" x2="13" y2="25" stroke="#00F5FF" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="13" x2="6" y2="13" stroke="#00F5FF" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="20" y1="13" x2="25" y2="13" stroke="#00F5FF" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    AEROSENSE
                </span>
            </Link>

            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                {links.map(l => (
                    <Link
                        key={l.to}
                        to={l.to}
                        className={`nav-link ${pathname === l.to ? 'active' : ''}`}
                    >
                        {l.label}
                    </Link>
                ))}
                {isAuth ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-data)' }}>
                            ◉ {user?.username}
                        </span>
                        <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}
                            onClick={() => { logout(); nav('/login') }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login">
                        <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>Login</button>
                    </Link>
                )}
            </div>
        </nav>
    )
}
