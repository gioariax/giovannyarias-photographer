import { createHmac, timingSafeEqual } from 'node:crypto'
import { next } from '@vercel/functions'

const prefix = process.env.ESGRIMA_PASSWORD_PREFIX || 'aurablanca@'
const cookieName = 'esgrima_access'

function dateParts() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date())
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]))
}

function sameValue(actual, expected) {
  const a = Buffer.from(actual)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function loginPage(error = false) {
  return new Response(`<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Acceso privado · Esgrima</title>
<style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#111;color:#f3f0e9;font-family:system-ui,sans-serif;padding:24px}
  main{width:min(100%,420px);border:1px solid #514d46;padding:clamp(28px,7vw,48px)}
  .label{color:#c3aa80;font-size:12px;letter-spacing:.18em;text-transform:uppercase}
  h1{font-family:Georgia,serif;font-size:clamp(32px,8vw,44px);font-weight:400;margin:20px 0}
  p{color:#c5c1b9;line-height:1.6}label{display:block;margin:28px 0 8px;font-size:14px}
  input{width:100%;padding:14px;background:#1c1c1b;color:#fff;border:1px solid #777;font-size:16px}
  button{width:100%;margin-top:16px;padding:14px;border:0;background:#e9e2d5;color:#111;font-size:14px;cursor:pointer}
  button:hover{background:#fff}.error{color:#ffaaa0;font-size:14px}
</style></head><body><main>
<span class="label">Esgrima · Exposición fotográfica</span>
<h1>Acceso privado</h1>
<p>Este es un sitio privado. Introduce la contraseña para acceder a la exposición.</p>
<form method="post">
<label for="password">Contraseña</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? '<p class="error" role="alert">Contraseña incorrecta. Inténtalo de nuevo.</p>' : ''}
<button type="submit">Entrar</button>
</form></main></body></html>`, {
    status: error ? 401 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  })
}

export default async function proxy(request) {
  const url = new URL(request.url)
  const date = dateParts()
  const password = `${prefix}${date.day}${date.year.slice(-2)}`
  // Include the full date so an old session does not become valid again next month.
  const token = createHmac('sha256', prefix).update(`${date.year}-${date.month}-${date.day}`).digest('hex')
  const cookie = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || ''

  if (sameValue(cookie, token)) return next()

  const isPage = ['/esgrima', '/esgrima/', '/esgrima.html'].includes(url.pathname)
  if (!isPage) return new Response('Acceso privado', { status: 401, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })

  if (request.method === 'POST') {
    const form = await request.formData().catch(() => null)
    const supplied = form?.get('password')
    if (typeof supplied === 'string' && sameValue(supplied, password)) {
      const destination = new URL(`/esgrima${url.search}`, url.origin)
      return new Response(null, {
        status: 303,
        headers: {
          Location: destination.toString(),
          'Set-Cookie': `${cookieName}=${token}; Path=/; HttpOnly;${url.protocol === 'https:' ? ' Secure;' : ''} SameSite=Lax`,
          'Cache-Control': 'no-store',
        },
      })
    }
    return loginPage(true)
  }
  return loginPage()
}
