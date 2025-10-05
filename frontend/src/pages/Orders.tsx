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

const TYPE_LABELS: Record<OrderType, string> = {
    PURCHASE: 'Покупка',
    RENT_TWO_WEEKS: 'Аренда (2 недели)',
    RENT_ONE_MONTH: 'Аренда (1 месяц)',
    RENT_THREE_MONTHS: 'Аренда (3 месяца)',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
    ACTIVE: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    OVERDUE: 'bg-rose-100 text-rose-700',
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await apiRequest<Order[]>('/api/orders/my')
                setOrders(data)
            } catch (err) {
                console.error(err)
                setError('Не удалось получить ваши заказы')
            } finally {
                setLoading(false)
            }
        }
        void load()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">Мои книги и аренды</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Здесь отображаются все покупки и активные аренды. Напоминания об окончании аренды приходят автоматически за 1 день.
                </p>
            </div>
            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
            {loading ? (
                <p className="text-sm text-slate-500">Загрузка...</p>
            ) : orders.length === 0 ? (
                <p className="text-sm text-slate-500">Вы ещё не оформили ни одной покупки или аренды.</p>
            ) : (
                <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                    {orders.map(order => (
                        <article key={order.id} className="grid gap-3 p-4 sm:grid-cols-[2fr_1fr] sm:items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{order.bookTitle}</h3>
                                <p className="mt-1 text-sm text-slate-600">{TYPE_LABELS[order.type]}</p>
                                <p className="mt-1 text-xs text-slate-500">Начало: {new Date(order.startDate).toLocaleDateString()}</p>
                                {order.endDate && (
                                    <p className="text-xs text-slate-500">Завершение: {new Date(order.endDate).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                <span className="text-sm font-semibold text-slate-700">{order.price.toFixed(2)} ₽</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}>
                                    {order.status === 'ACTIVE' && 'Активна'}
                                    {order.status === 'COMPLETED' && 'Завершена'}
                                    {order.status === 'OVERDUE' && 'Просрочена'}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}