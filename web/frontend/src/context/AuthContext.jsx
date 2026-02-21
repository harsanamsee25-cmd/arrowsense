import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('aero_token'))
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('aero_user')
        return u ? JSON.parse(u) : null
    })

    const login = (tokenVal, userData) => {
        setToken(tokenVal)
        setUser(userData)
        localStorage.setItem('aero_token', tokenVal)
        localStorage.setItem('aero_user', JSON.stringify(userData))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('aero_token')
        localStorage.removeItem('aero_user')
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuth: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
