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

          {/* Banner como fondo en mobile */}
          <div className="absolute inset-0 lg:hidden">
            <Image
              src="/banner.png"
              alt="Banner La Cascarita"
              fill
              className="object-cover"
              style={{ objectPosition: '80% top' }}
              priority
            />
            <div className="absolute inset-0 bg-primary/80" />
          </div>

          <div className="relative max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] lg:min-h-[60vh]">

            {/* Left — copy */}
            <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 py-16 text-white">
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

            {/* Right — imagen (solo desktop) */}
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
            {/* Tier 1: La Inicial */}
            <div className="md:col-span-4 bg-surface-container-lowest flex flex-col justify-between group border border-zinc-100 hover:border-primary hover:shadow-2xl transition-all duration-300 overflow-hidden">

              {/* Barra de acento superior */}
              <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400" />

              <div className="p-8 flex flex-col flex-1">
                {/* Header: etiqueta + urgencia */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-on-surface-variant uppercase font-label block mb-2">SERIE 01 · 1 JERSEY</span>
                    <span className="bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest inline-block">Kit de Inicio</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest leading-none">Solo quedan</span>
                    <span className="text-3xl font-black text-red-500 leading-none">35</span>
                    <span className="text-[9px] text-red-400 uppercase font-bold leading-none">unidades</span>
                  </div>
                </div>

                {/* Imagen con badge de ahorro y efecto hover */}
                <div className="relative w-full aspect-[3/4] mb-6 overflow-hidden bg-zinc-50">
                  <div className="absolute inset-0 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Image
                      src="/playera_1.png"
                      alt="Jersey La Inicial"
                      fill
                      className="object-cover object-top scale-110 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Badge de ahorro */}
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg z-10">
                    <span className="text-[9px] font-black leading-none uppercase">AHORRAS</span>
                    <span className="text-sm font-black leading-tight">$300</span>
                  </div>
                </div>

                {/* Nombre + descripción */}
                <div className="space-y-2 mb-5">
                  <h3 className="text-3xl font-black tracking-tight text-on-surface uppercase font-headline leading-none">La Inicial</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Tu primer jersey de élite. Cualquier liga del mundo la emoción está en no saber cuál.
                  </p>
                </div>

                {/* Lista de beneficios */}
                <ul className="space-y-2 mb-6">
                  {[
                    '1 jersey premium auténtico',
                    'Empaque sellado sorpresa',
                    'Tarjeta de autenticidad',
                    'Envío gratis incluido',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                      <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Precio + CTA fijo al fondo */}
              <div className="px-8 pb-8">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-xs text-zinc-400 line-through font-bold block">$1,199.00 MXN</span>
                    <span className="text-4xl font-black text-on-surface font-headline leading-none">
                      $899<span className="text-lg">.00</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">MXN · IVA incluido</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block">Ahorras</span>
                    <span className="text-xl font-black text-emerald-600">$300</span>
                  </div>
                </div>
                <Link
                  href="/configurar?box=debutante&categoria=Liga%20MX"
                  className="flex items-center justify-between w-full bg-primary text-white px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-emerald-800 transition-colors group/btn"
                >
                  Quiero Este Kit
                  <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
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
                  TRIPLE PACK
                </span>
              </div>

              {/* Panel derecho — copy sobre blanco */}
              <div className="bg-white flex flex-col justify-center px-10 py-12 gap-7">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-3">
                    03 Jerseys · Hat-Trick
                  </p>
                  <h3 className="text-5xl font-black tracking-tighter uppercase leading-[0.9] text-zinc-950 font-headline">
                    Hat-Trick<br />
                  </h3>
                </div>

                <p className="text-sm text-zinc-500 leading-relaxed">
                  La caja de mayor valor para coleccionistas serios.
                </p>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-zinc-950 font-headline">$2,599</span>
                  <span className="text-sm text-zinc-400 line-through font-bold">$3,599 MXN</span>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/configurar?box=hat-trick&categoria=Internacional"
                    className="flex items-center justify-between bg-primary text-white px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-emerald-800 transition-colors group/btn"
                  >
                    Quiero Este Kit
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
                <div className="relative w-1/2 aspect-square overflow-hidden">
                  <Image
                    src="/playera_2.png"
                    alt="La Escuadra Completa"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center -40px' }}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-on-surface uppercase tracking-tighter font-headline">La Escuadra Completa</h3>
                  <p className="text-sm text-on-surface-variant">La experiencia definitiva. 4 jerseys auténticos.</p>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-400 line-through font-bold">$4,799.00 MXN</span>
                    <span className="text-4xl font-black text-primary font-headline">$3,399.00</span>
                  </div>
                  <Link
                    href="/configurar?box=jersey-club&categoria=Mix%20(Recomendado)"
                    className="flex items-center justify-between w-full bg-primary text-white px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-emerald-800 transition-colors group/btn"
                  >
                    Quiero Este Kit
                    <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
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
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <Image
                  src="/caja.png"
                  alt="Caja La Cascarita"
                  fill
                  className="object-cover"
                />
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
                No eliges un jersey… eliges vivir la emoción de descubrirlo.
                Cada mystery box es una jugada inesperada, puede ser ese club que amas, esa joya retro o la pieza que faltaba en tu colección.
              </p>
              <div className="space-y-8">
                {[
                  {
                    n: '01',
                    title: 'Algoritmo de Curaduría',
                    desc: 'Nuestros algoritmos filtran miles de kits para asegurar que nunca se repita un solo equipo.',
                  },
                  {
                    n: '02',
                    title: 'Para verdaderos aficionados',
                    desc: 'Si amas el fútbol, sabes que cada jersey cuenta una historia. Esta puede ser la tuya.',
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
