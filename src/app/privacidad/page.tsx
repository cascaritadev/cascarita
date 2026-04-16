import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const SECTIONS = [
  {
    icon: 'database',
    title: '¿Qué datos recopilamos?',
    body: 'Recopilamos los datos que tú nos proporcionas: nombre completo, dirección de envío, correo electrónico y método de pago. Los datos de pago son procesados directamente por Stripe y nunca quedan almacenados en nuestros servidores.',
  },
  {
    icon: 'manage_accounts',
    title: '¿Cómo usamos tu información?',
    body: 'Usamos tu información exclusivamente para: procesar y entregar tu pedido, enviarte actualizaciones sobre tu envío, y ocasionalmente informarte de nuevas colecciones (puedes darte de baja en cualquier momento).',
  },
  {
    icon: 'share',
    title: 'Compartición con terceros',
    body: 'Compartimos datos únicamente con proveedores esenciales para operar el servicio: Stripe (pago), SkyDropX (logística) y servicios de hosting. Nunca vendemos ni cedemos tu información a terceros con fines comerciales.',
  },
  {
    icon: 'cookie',
    title: 'Cookies',
    body: 'Utilizamos cookies propias para mantener tu sesión activa y recordar tu carrito. No utilizamos cookies de seguimiento de terceros ni plataformas de publicidad comportamental.',
  },
  {
    icon: 'security',
    title: 'Seguridad',
    body: 'Tu información viaja cifrada a través de HTTPS. El acceso a los datos de pedidos está restringido al equipo de operaciones de La Cascarita y sólo con fines de gestión de pedidos.',
  },
  {
    icon: 'verified_user',
    title: 'Tus derechos (LFPDPPP)',
    body: 'Conforme a la Ley Federal de Protección de Datos Personales en México, tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos (derechos ARCO). Ejércelos escribiéndonos a: privacidad@lacascarita.mx',
  },
  {
    icon: 'update',
    title: 'Actualizaciones a esta política',
    body: 'Podemos actualizar esta política periódicamente. Notificaremos cambios significativos por correo electrónico o mediante un aviso en el sitio.',
  },
]

export default function PrivacidadPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-primary mb-4 sm:mb-6 block">shield</span>
            <h1 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter mb-3">Política de Privacidad</h1>
            <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
              Última actualización: enero 2025
            </p>
          </div>

          <div className="space-y-4">
            {SECTIONS.map((s) => (
              <div key={s.title} className="bg-white border border-zinc-100 rounded-xl p-5 sm:p-7">
                <h2 className="font-bold uppercase tracking-tight mb-3 flex items-start gap-3 text-sm sm:text-base">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">{s.icon}</span>
                  {s.title}
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed pl-7">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
