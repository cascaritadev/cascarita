'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegistroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al crear la cuenta.')
      setLoading(false)
      return
    }

    // Auto login after register
    await signIn('credentials', {
      email: form.email,
      password: form.password,
      callbackUrl: '/',
    })
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <section className="hidden lg:flex relative bg-primary-container overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0 opacity-40 bg-gradient-to-br from-primary to-primary-container" />
        <div className="relative z-10 max-w-lg text-white">
          <h1 className="font-headline text-7xl font-black italic tracking-tighter leading-none mb-6">
            LA CASCARITA
          </h1>
          <p className="font-body text-xl text-primary-fixed-dim/80 leading-relaxed max-w-sm">
            Únete al club. Jerseys auténticos, entregas de élite.
          </p>
        </div>
      </section>

      <section className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <Link href="/"><h2 className="font-headline text-3xl font-black italic tracking-tighter text-primary">LA CASCARITA</h2></Link>
          </div>

          <div className="mb-10">
            <h3 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Crea tu cuenta</h3>
            <p className="text-on-surface-variant font-body">Únete al club de coleccionistas.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-container text-error px-4 py-3 text-sm font-bold">{error}</div>
            )}

            {[
              { id: 'name', label: 'NOMBRE COMPLETO', type: 'text', placeholder: 'Tu nombre', key: 'name' as const },
              { id: 'email', label: 'CORREO ELECTRÓNICO', type: 'email', placeholder: 'nombre@ejemplo.com', key: 'email' as const },
              { id: 'password', label: 'CONTRASEÑA', type: 'password', placeholder: '••••••••', key: 'password' as const },
            ].map((field) => (
              <div key={field.id}>
                <label className="block font-label text-[10px] font-bold uppercase tracking-[0.15em] text-outline mb-2" htmlFor={field.id}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary text-on-surface py-4 px-4 text-sm font-body outline-none transition-all"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="kinetic-gradient w-full py-4 text-white font-label font-bold uppercase tracking-[0.2em] text-sm flex justify-center items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-on-surface-variant">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-bold text-primary-container hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
