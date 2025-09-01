import { API_BASE, API_KEY } from '../config'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)
  if (API_KEY) {
    headers.set('X-API-Key', API_KEY)
  }
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Error ${res.status}`)
  }
  return res.json()
}
