import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const FAQ = [
  {
    q: '¿Cuánto tarda mi pedido?',
    a: 'Los envíos se procesan en 1-2 días hábiles. El tiempo de entrega es de 3 a 7 días hábiles dependiendo tu ubicación.',
  },
  {
    q: '¿A dónde envían?',
    a: 'Por ahora enviamos a toda la República Mexicana a través de nuestro socio logístico SkyDropX.',
  },
  {
    q: '¿Cómo puedo rastrear mi pedido?',
    a: 'Una vez confirmado el pago recibirás un número de guía por email. También puedes usar nuestra página de rastreo.',
  },
  {
    q: '¿El envío tiene costo?',
    a: 'No. Todas las Mystery Boxes incluyen envío express gratuito a cualquier parte de México.',
  },
]

export default function EnviosPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="material-symbols-outlined text-5xl text-primary mb-6 block">local_shipping</span>
            <h1 className="font-headline text-5xl font-black uppercase tracking-tighter mb-4">Envíos</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Envío express gratuito a toda México. Rápido, seguro y rastreable.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-16">
            {[
              { icon: 'rocket_launch', stat: 'Gratis', label: 'Envío express' },
              { icon: 'schedule', stat: '3-7 días', label: 'Tiempo de entrega' },
              { icon: 'location_on', stat: 'Nacional', label: 'Cobertura MX' },
            ].map((item) => (
              <div key={item.label} className="bg-surface-container-low p-6 rounded-xl text-center">
                <span className="material-symbols-outlined text-primary text-3xl block mb-2">{item.icon}</span>
                <p className="font-headline font-black text-xl uppercase tracking-tight">{item.stat}</p>
                <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h2 className="font-headline font-black text-2xl uppercase tracking-tighter mb-8">Preguntas frecuentes</h2>
            {FAQ.map((item) => (
              <div key={item.q} className="bg-white border border-zinc-100 rounded-xl p-6">
                <h3 className="font-bold uppercase tracking-tight mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">help</span>
                  {item.q}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed pl-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
