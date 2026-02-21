import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket(url = 'http://localhost:5000') {
    const socketRef = useRef(null)
    const [connected, setConnected] = useState(false)
    const [droneState, setDroneState] = useState(null)
    const [liveReading, setLiveReading] = useState(null)

    useEffect(() => {
        const socket = io(url, { transports: ['websocket', 'polling'] })
        socketRef.current = socket

        socket.on('connect', () => { setConnected(true) })
        socket.on('disconnect', () => { setConnected(false) })
        socket.on('drone_state', (data) => { setDroneState(data) })
        socket.on('drone_update', (data) => { setLiveReading(data) })

        return () => { socket.disconnect() }
    }, [url])

    return { connected, droneState, liveReading, socket: socketRef.current }
}
