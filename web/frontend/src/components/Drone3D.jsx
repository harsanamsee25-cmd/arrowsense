import { useState } from 'react'

// Pure CSS 3D drone — no WebGL, no crashes
// Sensor dots with hover tooltips

const SENSORS = [
    { id: 'gps', label: 'GPS', sub: 'L1/L2 GNSS Module', angle: -90, dist: 155 },
    { id: 'pm25', label: 'PM2.5', sub: 'Particulate Sensor', angle: -30, dist: 160 },
    { id: 'no2', label: 'NO₂', sub: 'Gas Detector', angle: 30, dist: 158 },
    { id: 'so2', label: 'SO₂/CO₂', sub: 'Multi-Gas Array', angle: 90, dist: 154 },
    { id: 'cam', label: 'CAMERA', sub: '4K Stabilised Gimbal', angle: 150, dist: 155 },
    { id: 'tmp', label: 'TEMP/RH', sub: 'Environmental Sensor', angle: -150, dist: 155 },
]

function SensorDot({ angle, dist, label, sub }) {
    const [hovered, setHovered] = useState(false)
    const rad = (angle * Math.PI) / 180
    const x = Math.cos(rad) * dist
    const y = Math.sin(rad) * dist
    const lineEndX = Math.cos(rad) * (dist - 48)
    const lineEndY = Math.sin(rad) * (dist - 48)

    return (
        <g>
            {/* Dashed connector line */}
            <line
                x1={lineEndX} y1={lineEndY}
                x2={x - Math.cos(rad) * 10} y2={y - Math.sin(rad) * 10}
                stroke={hovered ? 'rgba(0,245,255,0.7)' : 'rgba(0,245,255,0.3)'}
                strokeWidth="1" strokeDasharray="3 3"
                style={{ transition: 'stroke 0.2s' }}
            />
            {/* Origin dot on drone */}
            <circle
                cx={lineEndX} cy={lineEndY} r="3"
                fill="#FF7B2C" opacity="0.9"
            />
            {/* Hoverable dot */}
            <circle
                cx={x} cy={y} r={hovered ? 7 : 5}
                fill="#00F5FF" fillOpacity={hovered ? 0.9 : 0.7}
                style={{
                    cursor: 'pointer',
                    filter: hovered ? 'drop-shadow(0 0 6px #00F5FF)' : 'drop-shadow(0 0 3px #00F5FF)',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />
            {/* Label */}
            <text
                x={x + Math.cos(rad) * 18} y={y + Math.sin(rad) * 18}
                textAnchor="middle" dominantBaseline="middle"
                fill={hovered ? '#00F5FF' : 'rgba(0,245,255,0.65)'}
                fontSize="10" fontFamily="'IBM Plex Sans Condensed', sans-serif"
                fontWeight="700" letterSpacing="0.8"
                style={{
                    filter: hovered ? 'drop-shadow(0 0 5px rgba(0,245,255,0.8))' : 'none',
                    transition: 'all 0.2s', cursor: 'pointer',
                    userSelect: 'none',
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {label}
            </text>
            {/* Popup on hover */}
            {hovered && (
                <foreignObject
                    x={x + Math.cos(rad) * 24 - 55}
                    y={y + Math.sin(rad) * 24 + 8}
                    width="120" height="38"
                >
                    <div style={{
                        background: 'rgba(10,15,28,0.95)',
                        border: '1px solid rgba(0,245,255,0.45)',
                        borderRadius: 6, padding: '4px 9px',
                        fontFamily: "'IBM Plex Sans Condensed', sans-serif",
                        boxShadow: '0 0 12px rgba(0,245,255,0.15)',
                    }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#00F5FF', letterSpacing: '0.08em' }}>
                            {label}
                        </div>
                        <div style={{ fontSize: 9, color: '#5C7A8A', marginTop: 1 }}>{sub}</div>
                    </div>
                </foreignObject>
            )}
        </g>
    )
}

export default function Drone3D({ width = '480px', height = '460px' }) {
    return (
        <div style={{ width, height, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Animated SVG drone diagram with CSS 3D illusion */}
            <svg
                width="480" height="460"
                viewBox="-240 -230 480 460"
                style={{ overflow: 'visible' }}
            >
                {/* ── Background glow rings ── */}
                <circle cx="0" cy="0" r="72" fill="rgba(0,245,255,0.03)"
                    stroke="rgba(0,245,255,0.15)" strokeWidth="1" />
                <circle cx="0" cy="0" r="72" fill="none"
                    stroke="rgba(0,245,255,0.12)" strokeWidth="1.5"
                    style={{ animation: 'pulse-ring 2.5s ease-out infinite' }} />
                <circle cx="0" cy="0" r="115" fill="none"
                    stroke="rgba(0,245,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="0" cy="0" r="160" fill="none"
                    stroke="rgba(0,245,255,0.04)" strokeWidth="1" strokeDasharray="3 8" />

                {/* ── DRONE body group — floating animation ── */}
                <g style={{ animation: 'droneFloat 2.8s ease-in-out infinite', transformOrigin: '0 0' }}>

                    {/* Perspective shadow ellipse */}
                    <ellipse cx="0" cy="68" rx="52" ry="8"
                        fill="rgba(0,0,0,0.25)"
                        style={{ animation: 'shadowPulse 2.8s ease-in-out infinite', transformOrigin: '0 68px' }}
                    />

                    {/* ── Arms (using perspective trick — shorter back arms) ── */}
                    {/* Front-left arm */}
                    <line x1="-10" y1="-4" x2="-38" y2="-32"
                        stroke="#B8C4D6" strokeWidth="5" strokeLinecap="round" />
                    {/* Front-right arm */}
                    <line x1="10" y1="-4" x2="38" y2="-32"
                        stroke="#B8C4D6" strokeWidth="5" strokeLinecap="round" />
                    {/* Back-left arm (shorter for perspective) */}
                    <line x1="-9" y1="4" x2="-32" y2="26"
                        stroke="#9BAABB" strokeWidth="4" strokeLinecap="round" />
                    {/* Back-right arm */}
                    <line x1="9" y1="4" x2="32" y2="26"
                        stroke="#9BAABB" strokeWidth="4" strokeLinecap="round" />

                    {/* ── Motor hubs ── */}
                    <circle cx="-38" cy="-32" r="9" fill="#C0CAD8" stroke="#8FA0B4" strokeWidth="1.5" />
                    <circle cx="38" cy="-32" r="9" fill="#C0CAD8" stroke="#8FA0B4" strokeWidth="1.5" />
                    <circle cx="-32" cy="26" r="7" fill="#A8B4C2" stroke="#7A8EA2" strokeWidth="1" />
                    <circle cx="32" cy="26" r="7" fill="#A8B4C2" stroke="#7A8EA2" strokeWidth="1" />

                    {/* ── Spinning rotors (CSS animation) ── */}
                    {/* Front-left rotor */}
                    <g style={{ animation: 'rotor 0.18s linear infinite', transformOrigin: '-38px -32px' }}>
                        <line x1="-56" y1="-32" x2="-20" y2="-32" stroke="#DEE6F2" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
                        <line x1="-38" y1="-50" x2="-38" y2="-14" stroke="#DEE6F2" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
                    </g>
                    {/* Front-right rotor (counter) */}
                    <g style={{ animation: 'rotorCCW 0.18s linear infinite', transformOrigin: '38px -32px' }}>
                        <line x1="20" y1="-32" x2="56" y2="-32" stroke="#DEE6F2" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
                        <line x1="38" y1="-50" x2="38" y2="-14" stroke="#DEE6F2" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
                    </g>
                    {/* Back-left rotor */}
                    <g style={{ animation: 'rotorCCW 0.15s linear infinite', transformOrigin: '-32px 26px' }}>
                        <line x1="-46" y1="26" x2="-18" y2="26" stroke="#CDD5E0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                        <line x1="-32" y1="12" x2="-32" y2="40" stroke="#CDD5E0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                    </g>
                    {/* Back-right rotor */}
                    <g style={{ animation: 'rotor 0.15s linear infinite', transformOrigin: '32px 26px' }}>
                        <line x1="18" y1="26" x2="46" y2="26" stroke="#CDD5E0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                        <line x1="32" y1="12" x2="32" y2="40" stroke="#CDD5E0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                    </g>

                    {/* ── Main body — top face (with 3D perspective illusion) ── */}
                    {/* Bottom face (darker, slightly offset) */}
                    <rect x="-28" y="-6" width="56" height="30" rx="5"
                        fill="#A0AABC" stroke="none" />
                    {/* Front face */}
                    <rect x="-28" y="24" width="56" height="6" rx="2"
                        fill="#8896AA" />
                    {/* Top face */}
                    <rect x="-30" y="-12" width="60" height="30" rx="6"
                        fill="#D5DCE8" stroke="#C0CAD8" strokeWidth="1" />
                    {/* Orange accent top stripe */}
                    <rect x="-30" y="-12" width="60" height="5" rx="3"
                        fill="#FF7B2C" opacity="0.9" />
                    {/* Orange accent bottom stripe */}
                    <rect x="-30" y="13" width="60" height="5" rx="3"
                        fill="#FF7B2C" opacity="0.9" />
                    {/* Body center detail */}
                    <rect x="-14" y="-4" width="28" height="14" rx="3"
                        fill="#B8C2D2" />
                    <circle cx="0" cy="3" r="5" fill="#C8D2E2" />
                    {/* Status LED */}
                    <circle cx="0" cy="3" r="3" fill="#00F5FF"
                        style={{
                            animation: 'blink 1.4s step-end infinite',
                            filter: 'drop-shadow(0 0 4px #00F5FF)'
                        }} />

                    {/* ── GPS mast ── */}
                    <line x1="0" y1="-12" x2="0" y2="-30"
                        stroke="#B0BAC8" strokeWidth="2.5" />
                    <circle cx="0" cy="-33" r="4.5" fill="#FF7B2C"
                        style={{ filter: 'drop-shadow(0 0 5px rgba(255,123,44,0.8))' }} />

                    {/* ── Camera gimbal ── */}
                    <circle cx="0" cy="34" r="9" fill="#181828" stroke="#2A3044" strokeWidth="1.5" />
                    <circle cx="0" cy="34" r="5" fill="#0C0C1C" />
                    <circle cx="0" cy="34" r="2.5" fill="#00F5FF" opacity="0.4" />

                    {/* ── Landing gear ── */}
                    {[[-20, 12], [20, 12]].map(([x, side], i) => (
                        <g key={i}>
                            <line x1={x} y1="20" x2={x} y2="44"
                                stroke="#9BAABB" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1={x - 10} y1="44" x2={x + 10} y2="44"
                                stroke="#FF7B2C" strokeWidth="3" strokeLinecap="round" />
                        </g>
                    ))}

                    {/* ── Belly LED strip ── */}
                    <rect x="-16" y="14" width="32" height="3" rx="2"
                        fill="#00F5FF" opacity="0.6"
                        style={{
                            animation: 'glowPulse 1.8s ease-in-out infinite',
                            filter: 'drop-shadow(0 0 4px #00F5FF)'
                        }}
                    />
                </g>

                {/* ── Sensor annotation dots (outside the floating group) ── */}
                {SENSORS.map(s => <SensorDot key={s.id} {...s} />)}
            </svg>

            {/* Hint */}
            <div style={{
                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                fontSize: '0.6rem', color: 'rgba(92,122,138,0.7)',
                fontFamily: "'IBM Plex Sans Condensed', sans-serif",
                letterSpacing: '0.1em', textTransform: 'uppercase',
                pointerEvents: 'none', whiteSpace: 'nowrap',
            }}>
                Hover cyan dots for sensors
            </div>
        </div>
    )
}
