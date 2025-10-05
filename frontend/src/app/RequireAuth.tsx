import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

interface RequireAuthProps {
    children: JSX.Element
    roles?: Array<'USER' | 'ADMIN'>
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Загрузка...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/catalog" replace />
    }

    return children
}