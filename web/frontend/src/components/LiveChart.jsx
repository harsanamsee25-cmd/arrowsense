import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'


const LINES = [
    { key: 'pm25', color: '#00F5FF', label: 'PM2.5' },
    { key: 'pm10', color: '#39FF14', label: 'PM10' },
    { key: 'no2', color: '#FFB800', label: 'NO₂' },
    { key: 'so2', color: '#FF6B6B', label: 'SO₂' },
    { key: 'co2', color: '#BF9FFF', label: 'CO₂' },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'rgba(10,15,28,0.95)', border: '1px solid rgba(0,245,255,0.15)',
            borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-data)',
        }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 6 }}>{label}</p>
            {payload.map(p => (
                <p key={p.dataKey} style={{ color: p.color, fontSize: '0.78rem', margin: '2px 0' }}>
                    {p.name}: <strong>{p.value?.toFixed(1)}</strong>
                </p>
            ))}
        </div>
    )
}

export default function LiveChart({ data = [] }) {
    const chartData = data.slice(-30).map(r => ({
        ...r,
        time: r.timestamp ? r.timestamp.slice(11, 16) : '',
    }))

    return (
        <div className="glass-card" style={{ padding: '20px 16px 8px' }}>
            <div style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
                color: 'var(--text-muted)', textTransform: 'uppercase',
                fontFamily: 'var(--font-head)', marginBottom: 16,
            }}>
                Live Emission Graph
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-data)' }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-data)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '0.72rem', paddingTop: 8, fontFamily: 'var(--font-data)' }}
                        formatter={(v) => <span style={{ color: 'var(--text-muted)' }}>{v}</span>}
                    />
                    {LINES.map(l => (
                        <Line
                            key={l.key}
                            type="monotone"
                            dataKey={l.key}
                            name={l.label}
                            stroke={l.color}
                            strokeWidth={1.5}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
