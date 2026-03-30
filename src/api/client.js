const BASE_URL = import.meta.env.VITE_API_URL

if (!BASE_URL) {
  console.error('VITE_API_URL is not set. Create a .env file with VITE_API_URL=https://...')
}

async function request(method, path, { body, auth = true, signal } = {}) {
  if (!BASE_URL) throw new Error('VITE_API_URL is not configured')

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = localStorage.getItem('cf_token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    let errorBody
    try {
      errorBody = await response.json()
    } catch {
      errorBody = { message: `Request failed with status ${response.status}` }
    }
    throw errorBody
  }

  return response.json()
}

export const get  = (path, opts) => request('GET',    path, opts)
export const post = (path, opts) => request('POST',   path, opts)
export const put  = (path, opts) => request('PUT',    path, opts)
export const del  = (path, opts) => request('DELETE', path, opts)
