import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-screen-2xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primary/30">
          <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <span className="font-label text-xs font-bold tracking-[0.3em] text-primary uppercase mb-4 block">
          PAGO CONFIRMADO
        </span>
        <h1 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
          ¡Tu Caja <br />
          <span className="text-primary">Está en Camino!</span>
        </h1>
        <p className="text-on-surface-variant text-lg font-medium max-w-md mb-12 leading-relaxed">
          Hemos recibido tu pago y estamos preparando tu Mystery Box. Recibirás un correo con los detalles de tu envío.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/rastreo"
            className="kinetic-gradient text-white px-10 py-4 font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">location_on</span>
            Rastrear mi Pedido
          </Link>
          <Link
            href="/"
            className="border-2 border-primary text-primary px-10 py-4 font-black uppercase tracking-widest text-sm rounded-lg hover:bg-primary hover:text-white transition-all"
          >
            Volver al Inicio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
