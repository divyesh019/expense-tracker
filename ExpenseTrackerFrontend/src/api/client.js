const API_BASE = '/api/v1.0'

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const raw = await response.text()
  let data = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = { message: raw }
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status)
  }

  return data
}

function filenameFromContentDisposition(header) {
  if (!header) return null
  const utf8 = header.match(/filename\*=UTF-8''([^;\n]+)/i)
  if (utf8) return decodeURIComponent(utf8[1])
  const quoted = header.match(/filename="([^"]+)"/i)
  if (quoted) return quoted[1]
  const simple = header.match(/filename=([^;\n]+)/i)
  if (simple) return simple[1].trim()
  return null
}

/**
 * GET binary response (e.g. Excel export). Sends Bearer token when provided.
 */
export async function downloadBlob(path, { token, fallbackFilename = 'download' } = {}) {
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const raw = await response.text()
    let message = `Request failed (${response.status})`
    if (raw) {
      try {
        const data = JSON.parse(raw)
        message = data?.message || message
      } catch {
        message = raw
      }
    }
    throw new ApiError(message, response.status)
  }

  const blob = await response.blob()
  const name = filenameFromContentDisposition(response.headers.get('Content-Disposition')) || fallbackFilename
  return { blob, filename: name }
}

export function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
}
