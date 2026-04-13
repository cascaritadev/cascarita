'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Correo o contraseña incorrectos.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ── Branding Section ─────────────────────────── */}
      <section className="hidden lg:flex relative bg-primary-container overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0 opacity-40 bg-gradient-to-br from-primary to-primary-container" />

        {/* Performance HUD */}
        <div className="absolute top-8 left-8 z-10">
          <span className="text-[10px] font-label font-bold tracking-[0.2em] text-primary-fixed uppercase py-1 px-2 border border-primary-fixed/20">
            SISTEMA / KINETIC 2.4
          </span>
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <h1 className="font-headline text-7xl font-black italic tracking-tighter leading-none mb-6">
            LA CASCARITA
          </h1>
          <p className="font-body text-xl text-primary-fixed-dim/80 leading-relaxed max-w-sm">
            Eleva tu juego. El estándar de élite para el fútbol moderno comienza aquí.
          </p>
          <div className="mt-12 flex gap-4 items-center">
            <div className="h-[2px] w-12 bg-primary-fixed" />
            <span className="font-label text-xs uppercase tracking-[0.3em] font-bold text-primary-fixed">
              PRECISIÓN TÉCNICA
            </span>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 z-10 text-primary-fixed/40 font-label text-[10px] tracking-widest text-right">
          COORD: 19.4326° N, 99.1332° W<br />
          ALTITUD: 2240M / CDMX
        </div>
      </section>

      {/* ── Form Section ──────────────────────────────── */}
      <section className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <Link href="/">
              <h2 className="font-headline text-3xl font-black italic tracking-tighter text-primary">
                LA CASCARITA
              </h2>
            </Link>
          </div>

          <div className="mb-10">
            <h3 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">
              Bienvenido de nuevo
            </h3>
            <p className="text-on-surface-variant font-body">
              Ingresa tus credenciales para acceder a la plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-container text-error px-4 py-3 text-sm font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block font-label text-[10px] font-bold uppercase tracking-[0.15em] text-outline mb-2" htmlFor="email">
                CORREO ELECTRÓNICO
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary text-on-surface py-4 px-4 text-sm font-body outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label text-[10px] font-bold uppercase tracking-[0.15em] text-outline" htmlFor="password">
                  CONTRASEÑA
                </label>
                <button type="button" className="text-[10px] font-bold text-primary-container uppercase tracking-wider hover:opacity-70 transition-opacity">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary text-on-surface py-4 px-4 text-sm font-body outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="kinetic-gradient w-full py-4 text-white font-label font-bold uppercase tracking-[0.2em] text-sm flex justify-center items-center gap-2 group hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
              {!loading && (
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-surface-container flex flex-col gap-6">
            <button
              onClick={handleGoogle}
              className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant/15 text-on-surface font-body text-sm font-medium hover:bg-surface-container-low transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>

            <div className="text-center">
              <p className="font-body text-sm text-on-surface-variant">
                ¿No tienes una cuenta?{' '}
                <Link href="/registro" className="font-bold text-primary-container hover:underline ml-1">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-auto w-full max-w-md pt-8 flex justify-between items-center text-[9px] font-label font-bold text-outline-variant uppercase tracking-widest">
          <span>© 2024 LA CASCARITA</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary">PRIVACIDAD</Link>
            <Link href="#" className="hover:text-primary">TÉRMINOS</Link>
          </div>
        </footer>
      </section>
    </main>
  )
}
