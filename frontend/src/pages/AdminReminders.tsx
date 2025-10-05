import { useEffect, useState } from 'react'
import { apiRequest } from '../shared/api'

type Reminder = {
    id: string
    orderId: string
    bookTitle: string
    userEmail: string
    remindAt: string
    delivered: boolean
}

export default function AdminReminders() {
    const [items, setItems] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await apiRequest<Reminder[]>('/api/admin/reminders')
            setItems(data)
        } catch (err) {
            console.error(err)
            setError('Не удалось получить список напоминаний')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Автоматические напоминания</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Сервис автоматически формирует напоминания за 24 часа до завершения аренды. Здесь можно отслеживать, что уже отправлено.
                    </p>
                </div>
                <button
                    className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                    onClick={() => void load()}
                    disabled={loading}
                >
                    Обновить
                </button>
            </div>
            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
            {loading ? (
                <p className="text-sm text-slate-500">Загрузка...</p>
            ) : items.length === 0 ? (
                <p className="text-sm text-slate-500">Пока нет запланированных напоминаний.</p>
            ) : (
                <ul className="space-y-3">
                    {items.map(reminder => (
                        <li key={reminder.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{reminder.bookTitle}</p>
                                    <p className="text-xs text-slate-500">Пользователь: {reminder.userEmail}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-600">Напомнить: {new Date(reminder.remindAt).toLocaleString()}</p>
                                    <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${reminder.delivered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {reminder.delivered ? 'Отправлено' : 'Запланировано'}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}