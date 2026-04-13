import Link from 'next/link'
import Image from 'next/image'
import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="bg-surface text-on-surface">
      <AnnouncementBar />
      <Navbar />

      <main>
        {/* ── Hero Section ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-primary">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">

            {/* Left — copy */}
            <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 py-14 text-white">
              <span className="inline-block text-xs font-bold tracking-[0.2em] text-emerald-400 mb-4 uppercase font-label">
                SERIE KINETIC / 01
              </span>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-8 font-headline">
                VIVE LA<br />EMOCIÓN DEL<br />
                <span className="text-emerald-400 italic underline decoration-4 underline-offset-8">
                  UNBOXING.
                </span>
              </h1>
              <p className="text-lg text-zinc-100 font-medium max-w-md mb-12 leading-relaxed">
                Jerseys de las mejores ligas y selecciones del mundo.
                Cada caja es una jugada inesperada
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/cajas"
                  className="bg-white text-primary px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-sm shadow-2xl hover:bg-emerald-50 transition-all"
                >
                  Empieza tu Colección
                </Link>
                <button className="bg-transparent border-2 border-white/40 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  Ver Unboxing
                </button>
              </div>

            </div>

            {/* Right — imagen */}
            <div className="relative hidden lg:block">
              <Image
                src="/banner.png"
                alt="Banner La Cascarita"
                fill
                className="object-cover"
                style={{ objectPosition: '-550px center' }}
                priority
              />
              {/* degradado de fusión hacia la izquierda */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/10 to-transparent" />
            </div>
          </div>

          {/* Imagen en mobile — strip debajo del copy */}
          <div className="relative lg:hidden w-full h-56 sm:h-72">
            <Image
              src="/banner.png"
              alt="Banner La Cascarita"
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-transparent" />
          </div>
        </section>

        {/* ── Scrolling Marquee ─────────────────────────────────────── */}
        <section className="bg-emerald-900 py-10 overflow-hidden relative border-y border-emerald-800">
          <div className="animate-marquee whitespace-nowrap">
            <div className="flex gap-20 items-center pr-20">
              <span className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter opacity-70 font-headline">ENVÍO GRATIS</span>
              <span className="material-symbols-outlined text-emerald-400 text-4xl">local_shipping</span>
              <span className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter opacity-70 font-headline">ENTREGA INMEDIATA</span>
              <span className="material-symbols-outlined text-emerald-400 text-4xl">rocket_launch</span>
              <span className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter opacity-70 font-headline">CALIDAD TOP</span>
              <span className="material-symbols-outlined text-emerald-400 text-4xl">verified</span>
            </div>
            <div className="flex gap-20 items-center pr-20">
              <span className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter opacity-70 font-headline">ENVÍO GRATIS</span>
              <span className="material-symbols-outlined text-emerald-400 text-4xl">local_shipping</span>
              <span className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter opacity-70 font-headline">ENTREGA INMEDIATA</span>
              <span className="material-symbols-outlined text-emerald-400 text-4xl">rocket_launch</span>
              <span className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter opacity-70 font-headline">CALIDAD TOP</span>
              <span className="material-symbols-outlined text-emerald-400 text-4xl">verified</span>
            </div>
          </div>
        </section>

        {/* ── Product Tiers ─────────────────────────────────────────── */}
        <section className="py-24 px-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-5xl font-black tracking-tighter text-on-surface uppercase leading-none font-headline">
                Elige Tu<br />Intensidad
              </h2>
            </div>
            <p className="max-w-sm text-sm text-on-surface-variant font-medium leading-relaxed">
              Selecciona el nivel que se adapte a tu pasión. Cada caja es curada con jerseys auténticos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tier 1: Debutante */}
            <div className="md:col-span-4 bg-surface-container-lowest p-8 flex flex-col justify-between group border border-zinc-100 hover:border-primary transition-colors">
              <div>
                <div className="flex justify-between items-start mb-12">
                  <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase font-label">01 JERSEY / EL DEBUTANTE</span>
                  <span className="bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">KIT BASE</span>
                </div>
                <div className="relative w-full aspect-square mb-8 overflow-hidden">
                  <div className="absolute inset-0 translate-y-10">
                    <Image
                      src="/playera_1.png"
                      alt="Jersey La Inicial"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight text-on-surface uppercase font-headline">La Inicial</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">La entrada perfecta al club. Un jersey auténtico de élite de cualquier liga del mundo.</p>
                </div>
              </div>
              <div className="mt-12 flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400 line-through font-bold">$1,450.00 MXN</span>
                  <span className="text-3xl font-black text-on-surface font-headline">$1,199.00</span>
                </div>
                <Link href="/cajas?box=debutante" className="material-symbols-outlined p-4 bg-primary text-white hover:bg-emerald-800 transition-colors rounded-full">
                  add_shopping_cart
                </Link>
              </div>
            </div>

            {/* Tier 2: Destacado */}
            <div className="md:col-span-8 overflow-hidden group grid grid-cols-1 md:grid-cols-[3fr_2fr] min-h-[480px]">

              {/* Panel izquierdo — imagen sin padding, sangra hasta los bordes */}
              <div className="relative bg-emerald-950 min-h-[420px]">
                <Image
                  src="/playeras.png"
                  alt="Playeras La Cascarita"
                  fill
                  className="object-cover object-center"
                />
                {/* velo sutil en la parte inferior para fusionar con el copy */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-950/60 to-transparent" />
                <span className="absolute top-5 left-5 bg-emerald-400 text-emerald-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest z-10">
                  PROMO 3×2
                </span>
              </div>

              {/* Panel derecho — copy sobre blanco */}
              <div className="bg-white flex flex-col justify-center px-10 py-12 gap-7">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-3">
                    03 Jerseys · Hat-Trick
                  </p>
                  <h3 className="text-5xl font-black tracking-tighter uppercase leading-[0.9] text-zinc-950 font-headline">
                    Dominio<br />Total
                  </h3>
                </div>

                <p className="text-sm text-zinc-500 leading-relaxed">
                  Paga dos, recibe tres. La caja de mayor valor para coleccionistas serios.
                </p>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-zinc-950 font-headline">$3,299</span>
                  <span className="text-sm text-zinc-400 line-through font-bold">$4,350 MXN</span>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/cajas?box=hat-trick"
                    className="flex items-center justify-between bg-zinc-950 text-white px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-emerald-950 transition-colors group/btn"
                  >
                    Comprar ahora
                    <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                  <p className="text-[10px] text-zinc-400 font-medium text-center uppercase tracking-widest">
                    Envío gratis · Lo más vendido
                  </p>
                </div>
              </div>
            </div>

            {/* Tier 3: Jersey Club */}
            <div className="md:col-span-6 bg-surface-container-low p-8 group border border-zinc-100">
              <div className="flex justify-between items-start mb-8">
                <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase font-label">04 JERSEYS / JERSEY CLUB PACK</span>
                <span className="bg-emerald-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">AHORRA 40%</span>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-1/2 aspect-square bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[5rem] text-outline-variant">inventory_2</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-on-surface uppercase tracking-tighter font-headline">La Escuadra Completa</h3>
                  <p className="text-sm text-on-surface-variant">La experiencia definitiva. 4 jerseys auténticos.</p>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-400 line-through font-bold">$5,800.00 MXN</span>
                    <span className="text-4xl font-black text-primary font-headline">$3,499.00</span>
                  </div>
                  <Link
                    href="/cajas?box=jersey-club"
                    className="block w-full text-center bg-primary text-white py-4 font-black uppercase tracking-widest text-xs hover:bg-emerald-800 transition-colors"
                  >
                    Añadir al Carrito
                  </Link>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="md:col-span-6 bg-surface-container p-8 flex flex-col justify-center border border-zinc-100">
              <div className="max-w-md">
                <span className="material-symbols-outlined text-4xl text-primary mb-6">inventory_2</span>
                <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight mb-4 font-headline">El Protocolo Unboxing</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  Cada entrega es un ritual. Sellado con cinta técnica, envuelto en papel seda y acompañado de una tarjeta de autenticidad.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-l-2 border-primary pl-4">
                    <div className="text-[10px] uppercase font-bold text-primary tracking-widest">Estándar</div>
                    <div className="text-lg font-black uppercase font-headline">Empaque Elite</div>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <div className="text-[10px] uppercase font-bold text-primary tracking-widest">Incluido</div>
                    <div className="text-lg font-black uppercase font-headline">Certificado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Brand Story ───────────────────────────────────────────── */}
        <section className="bg-white py-32 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -top-12 -left-12 w-48 h-48 border-[20px] border-surface-container-highest -z-10" />
              <div className="w-full aspect-[4/5] bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[10rem] text-outline-variant">sports_soccer</span>
              </div>
              <div className="absolute bottom-8 right-8 glass-card p-4 rounded-lg flex items-center gap-4 border border-white/40">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">verified</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-primary uppercase">Coleccionista Verificado</div>
                  <div className="text-sm font-black italic">&quot;ES MÁS QUE UNA CAMISETA.&quot;</div>
                </div>
              </div>
            </div>

            <div className="space-y-12 order-1 lg:order-2">
              <h2 className="text-7xl font-black tracking-tighter text-on-surface uppercase leading-[0.9] font-headline">
                Más que<br />un Kit. Es<br />Tu{' '}
                <span className="text-primary underline decoration-emerald-400">Identidad.</span>
              </h2>
              <p className="text-xl text-on-surface-variant font-medium leading-relaxed max-w-lg">
                No solo vendemos jerseys. Curamos momentos de pura adrenalina. Cada caja es un boleto a una historia.
              </p>
              <div className="space-y-8">
                {[
                  {
                    n: '01',
                    title: 'Algoritmo de Curaduría',
                    desc: 'Nuestros expertos filtran miles de kits para asegurar que solo equipo auténtico de alta gama llegue a tus manos.',
                  },
                  {
                    n: '02',
                    title: 'Ciclo de Exclusividad',
                    desc: 'Lanzamientos mensuales limitados. Una vez que se agotan, comienza la siguiente serie con clubes totalmente nuevos.',
                  },
                ].map((item) => (
                  <div key={item.n} className="flex gap-6">
                    <span className="text-4xl font-thin text-outline-variant">{item.n}</span>
                    <div>
                      <h4 className="font-black text-xl uppercase tracking-tight font-headline">{item.title}</h4>
                      <p className="text-on-surface-variant text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
