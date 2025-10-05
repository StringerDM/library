import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './app/AuthProvider'

export default function App() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, loading, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const navLink = (to: string, label: string) => {
        const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
        return (
            <Link
                key={to}
                to={to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${active ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
            >
                {label}
            </Link>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-6 pb-12">
                <header className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link to="/catalog" className="text-2xl font-semibold text-emerald-700">
                        Электронная библиотека
                    </Link>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                        <nav className="flex flex-wrap gap-2">
                            {navLink('/catalog', 'Каталог')}
                            {user && navLink('/orders', 'Мои книги')}
                            {user?.role === 'ADMIN' && navLink('/admin/books', 'Книги (админ)')}
                            {user?.role === 'ADMIN' && navLink('/admin/orders', 'Аренды')}
                            {user?.role === 'ADMIN' && navLink('/admin/reminders', 'Напоминания')}
                        </nav>
                        <div className="flex items-center gap-3">
                            {loading ? (
                                <span className="text-sm text-gray-500">Проверяем сессию...</span>
                            ) : user ? (
                                <>
                                    <span className="text-sm text-gray-600">
                                        {user.username}
                                        {user.role === 'ADMIN' && <span className="ml-2 rounded bg-emerald-200 px-2 py-0.5 text-xs text-emerald-800">администратор</span>}
                                    </span>
                                    <button
                                        className="rounded-md border border-emerald-600 px-3 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                                        onClick={handleLogout}
                                    >
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="rounded-md border border-emerald-600 px-3 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                                >
                                    Войти
                                </Link>
                            )}
                        </div>
                    </div>
                </header>
                <main className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}