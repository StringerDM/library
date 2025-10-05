import { useEffect, useState } from 'react'
import { apiRequest } from '../shared/api'

type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE'

type OrderType = 'PURCHASE' | 'RENT_TWO_WEEKS' | 'RENT_ONE_MONTH' | 'RENT_THREE_MONTHS'

type Order = {
    id: string
    bookId: string
    bookTitle: string
    type: OrderType
    status: OrderStatus
    price: number
    startDate: string
    endDate: string | null
}

const STATUS_COLORS: Record<OrderStatus, string> = {
    ACTIVE: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    OVERDUE: 'bg-rose-100 text-rose-700',
}

const TYPE_LABELS: Record<OrderType, string> = {
    PURCHASE: 'Покупка',
    RENT_TWO_WEEKS: '2 недели',
    RENT_ONE_MONTH: '1 месяц',
    RENT_THREE_MONTHS: '3 месяца',
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await apiRequest<Order[]>('/api/admin/orders')
                setOrders(data)
            } catch (err) {
                console.error(err)
                setError('Не удалось загрузить активные аренды')
            } finally {
                setLoading(false)
            }
        }
        void load()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">Аренды пользователей</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Отслеживайте активные и просроченные аренды. Напоминания о скором завершении создаются автоматически.
                </p>
            </div>
            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
            {loading ? (
                <p className="text-sm text-slate-500">Загрузка...</p>
            ) : orders.length === 0 ? (
                <p className="text-sm text-slate-500">Пока нет активных аренд.</p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Книга</th>
                                <th className="px-4 py-3">Тип</th>
                                <th className="px-4 py-3">Статус</th>
                                <th className="px-4 py-3">Начало</th>
                                <th className="px-4 py-3">Окончание</th>
                                <th className="px-4 py-3 text-right">Сумма</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{order.bookTitle}</td>
                                    <td className="px-4 py-3 text-slate-600">{TYPE_LABELS[order.type]}</td>
                                    <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                        {order.status === 'ACTIVE' && 'Активна'}
                                        {order.status === 'COMPLETED' && 'Завершена'}
                                        {order.status === 'OVERDUE' && 'Просрочена'}
                                    </span></td>
                                    <td className="px-4 py-3 text-slate-500">{new Date(order.startDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-slate-500">{order.endDate ? new Date(order.endDate).toLocaleDateString() : '—'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-slate-700">{order.price.toFixed(2)} ₽</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}