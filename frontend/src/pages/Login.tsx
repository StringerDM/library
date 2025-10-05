import { FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'
import { ApiError } from '../shared/api'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, login, register } = useAuth()
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [identifier, setIdentifier] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (user) {
            const redirect = (location.state as { from?: Location })?.from?.pathname ?? '/catalog'
            navigate(redirect, { replace: true })
        }
    }, [user, navigate, location.state])

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            if (mode === 'login') {
                await login(identifier.trim(), password)
            } else {
                await register({
                    username: username.trim(),
                    email: email.trim(),
                    password,
                })
            }
            navigate('/catalog')
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.body?.errors) {
                    const firstError = Object.values(err.body.errors)[0]
                    setError(firstError || err.message)
                } else {
                    setError(err.message)
                }
            } else {
                setError('Что-то пошло не так, попробуйте ещё раз')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const toggleMode = () => {
        setMode(prev => (prev === 'login' ? 'register' : 'login'))
        setError(null)
    }

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-10 lg:flex-row">
            <section className="flex-1 space-y-4">
                <h1 className="text-3xl font-semibold text-emerald-700">Добро пожаловать!</h1>
                <p className="text-sm leading-6 text-gray-600">
                    Электронная библиотека Synergy: выбирайте любимые книги, читайте описания, оформляйте покупку или аренду.
                    Администратор управляет каталогом и отслеживает аренды.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Каталог с фильтрами по жанру, автору и году</li>
                    <li>• История покупок и аренд в один клик</li>
                    <li>• Автоматические напоминания об окончании аренды</li>
                </ul>
            </section>
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">
                    {mode === 'login' ? 'Вход в кабинет' : 'Создание аккаунта'}
                </h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    {mode === 'login' ? (
                        <input
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            placeholder="Email или имя пользователя"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            disabled={submitting}
                            required
                        />
                    ) : (
                        <>
                            <input
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                placeholder="Имя пользователя"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                disabled={submitting}
                                required
                            />
                            <input
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                placeholder="Email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={submitting}
                                required
                            />
                        </>
                    )}
                    <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        placeholder="Пароль"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={submitting}
                        required
                    />
                    {error && <p className="text-sm text-rose-600">{error}</p>}
                    <button
                        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-70"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>
                <button
                    className="mt-4 text-sm text-emerald-700 transition hover:text-emerald-800"
                    onClick={toggleMode}
                    disabled={submitting}
                >
                    {mode === 'login' ? 'Нет аккаунта? Создайте его' : 'Уже зарегистрированы? Войдите'}
                </button>
            </section>
        </div>
    )
}