import Link from 'next/link'
import FooterActions from '@/components/FooterActions'

export default function Footer() {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 w-full max-w-screen-2xl mx-auto gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-black text-primary uppercase tracking-tighter font-headline">
            LA CASCARITA JERSEY CLUB
          </span>
          <p className="font-medium tracking-tight text-[10px] text-zinc-500 uppercase">
            ©2025 LA CASCARITA / KINETIC PRECISION. DISEÑADO PARA LA CANCHA.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          <Link href="/terminos" className="font-medium tracking-tight text-xs uppercase text-zinc-500 hover:text-primary transition-colors hover:underline">
            Términos
          </Link>
          <Link href="/privacidad" className="font-medium tracking-tight text-xs uppercase text-zinc-500 hover:text-primary transition-colors hover:underline">
            Privacidad
          </Link>
          <Link href="/envios" className="font-medium tracking-tight text-xs uppercase text-zinc-500 hover:text-primary transition-colors hover:underline">
            Envíos
          </Link>
        </div>

        <FooterActions />
      </div>
    </footer>
  )
}
