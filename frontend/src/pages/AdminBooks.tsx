import { FormEvent, useEffect, useMemo, useState } from 'react'
import { apiRequest, ApiError } from '../shared/api'

type BookStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ARCHIVED'

type Book = {
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
}

const EMPTY_FORM = {
    title: '',
    author: '',
    category: '',
    year: '2024',
    description: '',
    coverUrl: '',
    purchasePrice: '',
    rentTwoWeeks: '',
    rentOneMonth: '',
    rentThreeMonths: '',
}

type FormState = typeof EMPTY_FORM

export default function AdminBooks() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        void loadBooks()
    }, [])

    const loadBooks = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await apiRequest<{ items: Book[] }>('/api/books?status=ALL&size=200')
            setBooks(data.items)
        } catch (err) {
            console.error(err)
            setError('Не удалось загрузить список книг')
        } finally {
            setLoading(false)
        }
    }

    const startCreate = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setMessage(null)
    }

    const startEdit = (book: Book) => {
        setEditingId(book.id)
        setForm({
            title: book.title,
            author: book.author,
            category: book.category,
            year: String(book.year),
            description: book.description ?? '',
            coverUrl: book.coverUrl ?? '',
            purchasePrice: book.purchasePrice?.toString() ?? '',
            rentTwoWeeks: book.rentTwoWeeks?.toString() ?? '',
            rentOneMonth: book.rentOneMonth?.toString() ?? '',
            rentThreeMonths: book.rentThreeMonths?.toString() ?? '',
        })
        setMessage(null)
    }

    const handleChange = (field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const buildPayload = () => ({
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim(),
        year: Number(form.year),
        description: form.description.trim() || null,
        coverUrl: form.coverUrl.trim() || null,
        purchasePrice: Number(form.purchasePrice || 0),
        rentTwoWeeks: Number(form.rentTwoWeeks || 0),
        rentOneMonth: Number(form.rentOneMonth || 0),
        rentThreeMonths: Number(form.rentThreeMonths || 0),
    })

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setMessage(null)
        try {
            const payload = buildPayload()
            if (editingId) {
                await apiRequest(`/api/books/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                setMessage('Книга обновлена')
            } else {
                await apiRequest('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                setMessage('Книга добавлена в каталог')
            }
            await loadBooks()
            startCreate()
        } catch (err) {
            if (err instanceof ApiError) {
                setMessage(err.message)
            } else {
                setMessage('Не удалось сохранить изменения')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const changeStatus = async (book: Book, status: BookStatus) => {
        try {
            await apiRequest(`/api/books/${book.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            setMessage(`Статус книги «${book.title}» обновлён`)
            await loadBooks()
        } catch (err) {
            if (err instanceof ApiError) {
                setMessage(err.message)
            } else {
                setMessage('Не удалось изменить статус')
            }
        }
    }

    const statusOptions: BookStatus[] = ['AVAILABLE', 'UNAVAILABLE', 'ARCHIVED']

    const booksByStatus = useMemo(() => {
        return statusOptions.map(status => ({
            status,
            items: books.filter(book => book.status === status),
        }))
    }, [books])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Управление каталогом</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Добавляйте новые книги, редактируйте существующие и управляйте доступностью для пользователей.
                    </p>
                </div>
                <button
                    className="self-start rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                    onClick={startCreate}
                >
                    Добавить книгу
                </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-slate-800">{editingId ? 'Редактирование книги' : 'Новая книга'}</h2>
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Название</label>
                    <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.title}
                        onChange={e => handleChange('title', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Автор</label>
                    <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.author}
                        onChange={e => handleChange('author', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Категория</label>
                    <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.category}
                        onChange={e => handleChange('category', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Год выпуска</label>
                    <input
                        type="number"
                        min="1800"
                        max="2100"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.year}
                        onChange={e => handleChange('year', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="lg:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Описание</label>
                    <textarea
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        rows={3}
                        value={form.description}
                        onChange={e => handleChange('description', e.target.value)}
                        disabled={submitting}
                    />
                </div>
                <div className="lg:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Обложка (URL)</label>
                    <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.coverUrl}
                        onChange={e => handleChange('coverUrl', e.target.value)}
                        disabled={submitting}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Покупка, ₽</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.purchasePrice}
                        onChange={e => handleChange('purchasePrice', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Аренда, 2 недели (₽)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.rentTwoWeeks}
                        onChange={e => handleChange('rentTwoWeeks', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Аренда, 1 месяц (₽)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.rentOneMonth}
                        onChange={e => handleChange('rentOneMonth', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase text-slate-500">Аренда, 3 месяца (₽)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={form.rentThreeMonths}
                        onChange={e => handleChange('rentThreeMonths', e.target.value)}
                        required
                        disabled={submitting}
                    />
                </div>
                <div className="lg:col-span-2 flex gap-3">
                    <button
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-70"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Сохраняем...' : editingId ? 'Обновить' : 'Добавить'}
                    </button>
                    {editingId && (
                        <button
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
                            type="button"
                            onClick={startCreate}
                            disabled={submitting}
                        >
                            Отменить
                        </button>
                    )}
                </div>
                {message && <p className="lg:col-span-2 text-sm text-emerald-700">{message}</p>}
            </form>

            {loading ? (
                <p className="text-sm text-slate-500">Загрузка каталога...</p>
            ) : (
                <div className="space-y-8">
                    {booksByStatus.map(group => (
                        <section key={group.status} className="space-y-4">
                            <header className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {group.status === 'AVAILABLE' && 'Доступные книги'}
                                    {group.status === 'UNAVAILABLE' && 'Временно недоступны'}
                                    {group.status === 'ARCHIVED' && 'Архив'}
                                </h3>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{group.items.length}</span>
                            </header>
                            <div className="grid gap-3 lg:grid-cols-2">
                                {group.items.map(book => (
                                    <article key={book.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-base font-semibold text-slate-800">{book.title}</h4>
                                                    <p className="text-sm text-slate-600">{book.author} · {book.year}</p>
                                                </div>
                                                <button className="text-xs text-emerald-700" onClick={() => startEdit(book)}>
                                                    Редактировать
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500">{book.category}</p>
                                            <div className="text-sm text-slate-600">
                                                Покупка: {book.purchasePrice?.toFixed(2) ?? '—'} ₽
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {statusOptions.map(option => (
                                                    <button
                                                        key={option}
                                                        className={`rounded-md px-2 py-1 text-xs ${option === book.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                                                        onClick={() => changeStatus(book, option)}
                                                        disabled={option === book.status}
                                                    >
                                                        {option === 'AVAILABLE' && 'Доступна'}
                                                        {option === 'UNAVAILABLE' && 'Скрыть'}
                                                        {option === 'ARCHIVED' && 'В архив'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                                {group.items.length === 0 && <p className="text-sm text-slate-400">Нет книг в этой группе.</p>}
                            </div>
                        </section>
                    ))}
                </div>
            )}
            {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
    )
}