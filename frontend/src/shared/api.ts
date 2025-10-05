const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export interface ApiErrorBody {
    message: string
    errors?: Record<string, string> | null
}

export class ApiError extends Error {
    readonly status: number
    readonly body: ApiErrorBody | null

    constructor(status: number, message: string, body: ApiErrorBody | null = null) {
        super(message)
        this.status = status
        this.body = body
    }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers)
    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(API_BASE + path, {
        ...options,
        headers,
        credentials: 'include',
    })

    const text = await response.text()
    const data = text ? (JSON.parse(text) as unknown) : undefined

    if (!response.ok) {
        const body = (data as ApiErrorBody | undefined) ?? null
        const message = body?.message || 'Request failed with status ' + response.status
        throw new ApiError(response.status, message, body)
    }

    return data as T
}
