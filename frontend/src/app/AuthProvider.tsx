import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest, ApiError } from '../shared/api'

type UserRole = 'USER' | 'ADMIN'

export interface User {
    id: string
    username: string
    email: string
    role: UserRole
    createdAt: string
}

interface AuthResponse {
    user: User
}

interface AuthContextValue {
    user: User | null
    loading: boolean
    login: (identifier: string, password: string) => Promise<User>
    register: (data: { username: string; email: string; password: string }) => Promise<User>
    logout: () => Promise<void>
    refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const data = await apiRequest<AuthResponse>('/api/auth/me')
            setUser(data.user)
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setUser(null)
            } else {
                console.error('Failed to fetch session', error)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh])

    const login = useCallback(async (identifier: string, password: string) => {
        const data = await apiRequest<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ identifier, password }),
            headers: { 'Content-Type': 'application/json' },
        })
        setUser(data.user)
        return data.user
    }, [])

    const register = useCallback(async (payload: { username: string; email: string; password: string }) => {
        const data = await apiRequest<AuthResponse>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        })
        setUser(data.user)
        return data.user
    }, [])

    const logout = useCallback(async () => {
        try {
            await apiRequest<void>('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
        } finally {
            setUser(null)
        }
    }, [])

    const value = useMemo<AuthContextValue>(() => ({ user, loading, login, register, logout, refresh }), [user, loading, login, register, logout, refresh])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}