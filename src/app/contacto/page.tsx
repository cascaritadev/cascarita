import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ContactoPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-5xl text-primary mb-6 block">mail</span>
          <h1 className="font-headline text-5xl font-black uppercase tracking-tighter mb-4">Contacto</h1>
          <p className="text-on-surface-variant text-lg mb-12 leading-relaxed">
            ¿Tienes dudas sobre tu pedido o quieres saber más de La Cascarita?
            Escríbenos y te respondemos en menos de 24 horas.
          </p>
          <div className="bg-surface-container-low p-10 rounded-2xl text-left space-y-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">email</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</p>
                <p className="font-bold text-sm">contacto@cascaritajc.mx</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">chat</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">WhatsApp</p>
                <p className="font-bold text-sm">+52 (55) 1624-6461</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Horario</p>
                <p className="font-bold text-sm">Lun–Vie 9am – 6pm (CST)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
