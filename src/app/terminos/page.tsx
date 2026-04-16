import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const SECTIONS = [
  {
    title: 'Aceptación de los términos',
    body: 'Al acceder y realizar una compra en La Cascarita Jersey Club, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, te pedimos que no realices compras en nuestro sitio.',
  },
  {
    title: 'Descripción del servicio',
    body: 'La Cascarita ofrece Mystery Boxes de jerseys deportivos. Dado que cada caja es una sorpresa curada, no se garantiza un equipo, liga o talla específica a menos que se indique en la descripción del producto al momento de la compra.',
  },
  {
    title: 'Proceso de compra',
    body: 'Al completar tu pedido, confirmas que la información proporcionada (nombre, dirección, método de pago) es correcta y vigente. El pago se procesa de forma segura a través de Stripe. Una vez confirmado el pago, recibirás un correo de confirmación con el número de tu pedido.',
  },
  {
    title: 'Política de cambios y devoluciones',
    body: 'Por la naturaleza sorpresa de las Mystery Boxes, no se aceptan devoluciones ni cambios una vez que el paquete ha sido enviado. Si recibes un producto dañado o incorrecto (distinto a lo prometido en la descripción), contáctanos dentro de las 48 horas siguientes a la recepción para resolver el caso.',
  },
  {
    title: 'Propiedad intelectual',
    body: 'Todo el contenido de este sitio imágenes, textos, diseños y la marca La Cascarita  es propiedad de Andrea Alejandra Figueroa Ayala y Edwin Sacbe Flores Serra. Queda prohibida su reproducción total o parcial sin autorización escrita.',
  },
  {
    title: 'Limitación de responsabilidad',
    body: 'La Cascarita no será responsable por daños indirectos, pérdidas de beneficios ni demoras causadas por terceros (paqueterías, bancos, etc.). Nuestra responsabilidad máxima se limita al monto pagado por el pedido en cuestión.',
  },
  {
    title: 'Modificaciones',
    body: 'Nos reservamos el derecho de actualizar estos términos en cualquier momento. Los cambios se publicarán en esta página y se considerarán aceptados al continuar usando el sitio.',
  },
  {
    title: 'Contacto',
    body: 'Para cualquier duda sobre estos términos, escríbenos a: contacto@lacascarita.mx',
  },
]

export default function TerminosPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-primary mb-4 sm:mb-6 block">gavel</span>
            <h1 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter mb-3">Términos y Condiciones</h1>
            <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
              Última actualización: enero 2025
            </p>
          </div>

          <div className="space-y-6">
            {SECTIONS.map((s, i) => (
              <div key={s.title} className="bg-white border border-zinc-100 rounded-xl p-5 sm:p-7">
                <h2 className="font-bold uppercase tracking-tight mb-3 flex items-start gap-2 text-sm sm:text-base">
                  <span className="text-primary font-black shrink-0">{String(i + 1).padStart(2, '0')}.</span>
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
