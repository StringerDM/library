import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../app/AuthProvider'
import { apiRequest, ApiError } from '../shared/api'

type BookStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ARCHIVED'

type OrderType = 'PURCHASE' | 'RENT_TWO_WEEKS' | 'RENT_ONE_MONTH' | 'RENT_THREE_MONTHS'

type BookListItem = {
    id: string
    title: string
    author: string
    category: string
    year: number
    purchasePrice: number | null
    status: BookStatus
    coverUrl: string | null
}

type BookPage = {
    items: BookListItem[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    hasNext: boolean
}

type BookDetails = {
    id: string
    title: string
    author: string
    category: string
    year: number
    description: string | null
    coverUrl: string | null
    purchasePrice: number | null
    rentTwoWeeks: number | null
    rentOneMonth: number | null
    rentThreeMonths: number | null
    status: BookStatus
    createdAt: string
    updatedAt: string | null
}

interface Filters {
    category: string
    author: string
    year: string
    sort: 'title' | 'author' | 'year'
}

const defaultFilters: Filters = {
    category: '',
    author: '',
    year: '',
    sort: 'title',
}

export default function Catalog() {
    const { user } = useAuth()
    const [filters, setFilters] = useState<Filters>(defaultFilters)
    const [page, setPage] = useState(0)
    const [books, setBooks] = useState<BookListItem[]>([])
    const [hasNext, setHasNext] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [details, setDetails] = useState<Record<string, BookDetails>>({})
    const [actionMessage, setActionMessage] = useState<string | null>(null)

    useEffect(() => {
        void loadPage(0, false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.category, filters.author, filters.year, filters.sort])

    const loadPage = async (targetPage: number, append: boolean) => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            params.set('page', targetPage.toString())
            params.set('size', '12')
            if (filters.category) params.set('category', filters.category)
            if (filters.author) params.set('author', filters.author)
            if (filters.year) params.set('year', filters.year)
            if (filters.sort) params.set('sort', filters.sort)

            const data = await apiRequest<BookPage>(`/api/books?${params.toString()}`)
            setPage(data.page)
            setHasNext(data.hasNext)
            setBooks(prev => (append ? [...prev, ...data.items] : data.items))
        } catch (err) {
            console.error(err)
            setError('Не удалось загрузить каталог')
        } finally {
            setLoading(false)
        }
    }

    const categories = useMemo(() => Array.from(new Set(books.map(book => book.category))).sort(), [books])
    const authors = useMemo(() => Array.from(new Set(books.map(book => book.author))).sort(), [books])

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const loadDetails = async (bookId: string) => {
        setSelectedId(bookId)
        if (details[bookId]) {
            return
        }
        try {
            const data = await apiRequest<BookDetails>(`/api/books/${bookId}`)
            setDetails(prev => ({ ...prev, [bookId]: data }))
        } catch (err) {
            console.error(err)
            setError('Не удалось загрузить описание книги')
        }
    }

    const handleOrder = async (book: BookListItem | BookDetails, type: OrderType) => {
        setActionMessage(null)
        try {
            await apiRequest('/api/orders', {
                method: 'POST',
                body: JSON.stringify({ bookId: book.id, type }),
                headers: { 'Content-Type': 'application/json' },
            })
            const message = type === 'PURCHASE'
                ? `Книга «${book.title}» добавлена в ваши покупки`
                : `Аренда книги «${book.title}» успешно оформлена`
            setActionMessage(message)
        } catch (err) {
            if (err instanceof ApiError) {
                setActionMessage(err.message)
            } else {
                setActionMessage('Не удалось выполнить операцию')
            }
        }
    }

    const selectedBook = selectedId ? details[selectedId] : null

    return (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-5">
                <h1 className="text-2xl font-semibold text-slate-800">Каталог книг</h1>
                <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Категория</label>
                        <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                            value={filters.category}
                            onChange={e => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">Все категории</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Автор</label>
                        <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                            value={filters.author}
                            onChange={e => handleFilterChange('author', e.target.value)}
                        >
                            <option value="">Все авторы</option>
                            {authors.map(author => (
                                <option key={author} value={author}>{author}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Год</label>
                        <input
                            type="number"
                            min="1800"
                            max="2100"
                            placeholder="Например, 2021"
                            value={filters.year}
                            onChange={e => handleFilterChange('year', e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Сортировка</label>
                        <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                            value={filters.sort}
                            onChange={e => handleFilterChange('sort', e.target.value as Filters['sort'])}
                        >
                            <option value="title">По названию</option>
                            <option value="author">По автору</option>
                            <option value="year">По году</option>
                        </select>
                    </div>
                </div>

                {actionMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{actionMessage}</p>}
                {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {books.map(book => (
                        <article key={book.id} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="space-y-3">
                                {book.coverUrl && (
                                    <img src={book.coverUrl} alt={book.title} className="h-48 w-full rounded-xl object-cover" />
                                )}
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-slate-800">{book.title}</h3>
                                    <p className="text-sm text-slate-600">{book.author}</p>
                                    <p className="text-xs text-slate-500">{book.category} · {book.year}</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700">Покупка</span>
                                    <span className="text-slate-600">{book.purchasePrice ? `${book.purchasePrice.toFixed(2)} ₽` : '—'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                    <span className={`rounded-full px-2 py-1 ${book.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {book.status === 'AVAILABLE' ? 'Доступна' : book.status === 'UNAVAILABLE' ? 'Недоступна' : 'Архив'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        className="rounded-lg border border-emerald-600 px-3 py-1 text-sm text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-40"
                                        disabled={!user || book.status !== 'AVAILABLE'}
                                        onClick={() => handleOrder(book, 'PURCHASE')}
                                    >
                                        Купить
                                    </button>
                                    <button
                                        className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-40"
                                        disabled={!user || book.status !== 'AVAILABLE'}
                                        onClick={() => setSelectedId(prev => prev === book.id ? null : (void loadDetails(book.id), book.id))}
                                    >
                                        Подробнее
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {hasNext && (
                    <div className="text-center">
                        <button
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50"
                            onClick={() => loadPage(page + 1, true)}
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : 'Показать ещё'}
                        </button>
                    </div>
                )}

                {!loading && books.length === 0 && <p className="text-sm text-slate-500">По выбранным фильтрам ничего не найдено.</p>}
            </section>

            <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800">Аренда</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Выберите книгу и оформите аренду на удобный срок. Стоимость фиксирована для 2 недель, 1 или 3 месяцев.
                    </p>
                    {!user && (
                        <p className="mt-3 text-sm text-emerald-700">
                            Авторизуйтесь, чтобы покупать и брать книги в аренду.
                        </p>
                    )}
                </div>

                {selectedBook && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-800">{selectedBook.title}</h3>
                                <p className="text-sm text-emerald-700">{selectedBook.author}</p>
                                <p className="text-xs text-emerald-600">{selectedBook.category} · {selectedBook.year}</p>
                            </div>
                            <button className="text-xs text-emerald-700" onClick={() => setSelectedId(null)}>×</button>
                        </div>
                        {selectedBook.description && (
                            <p className="mt-3 text-sm leading-6 text-emerald-900">
                                {selectedBook.description}
                            </p>
                        )}
                        <dl className="mt-4 space-y-2 text-sm text-emerald-800">
                            <div className="flex items-center justify-between">
                                <dt>Аренда на 2 недели</dt>
                                <dd>{selectedBook.rentTwoWeeks ? `${selectedBook.rentTwoWeeks.toFixed(2)} ₽` : '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Аренда на 1 месяц</dt>
                                <dd>{selectedBook.rentOneMonth ? `${selectedBook.rentOneMonth.toFixed(2)} ₽` : '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                                <dt>Аренда на 3 месяца</dt>
                                <dd>{selectedBook.rentThreeMonths ? `${selectedBook.rentThreeMonths.toFixed(2)} ₽` : '—'}</dd>
                            </div>
                        </dl>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                                disabled={!user || selectedBook.status !== 'AVAILABLE'}
                                onClick={() => handleOrder(selectedBook, 'RENT_TWO_WEEKS')}
                            >
                                2 недели
                            </button>
                            <button
                                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60"
                                disabled={!user || selectedBook.status !== 'AVAILABLE'}
                                onClick={() => handleOrder(selectedBook, 'RENT_ONE_MONTH')}
                            >
                                1 месяц
                            </button>
                            <button
                                className="rounded-lg bg-emerald-400 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                                disabled={!user || selectedBook.status !== 'AVAILABLE'}
                                onClick={() => handleOrder(selectedBook, 'RENT_THREE_MONTHS')}
                            >
                                3 месяца
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    )
}