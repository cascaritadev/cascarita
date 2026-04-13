import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200">
      <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 w-full max-w-screen-2xl mx-auto gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-black text-primary uppercase tracking-tighter font-headline">
            LA CASCARITA JERSEY CLUB
          </span>
          <p className="font-medium tracking-tight text-[10px] text-zinc-500 uppercase">
            ©2024 LA CASCARITA / KINETIC PRECISION. DISEÑADO PARA LA CANCHA.
          </p>
        </div>

        <div className="flex gap-10">
          <Link href="#" className="font-medium tracking-tight text-xs uppercase text-zinc-500 hover:text-primary transition-colors hover:underline">
            Términos
          </Link>
          <Link href="#" className="font-medium tracking-tight text-xs uppercase text-zinc-500 hover:text-primary transition-colors hover:underline">
            Privacidad
          </Link>
          <Link href="#" className="font-medium tracking-tight text-xs uppercase text-zinc-500 hover:text-primary transition-colors hover:underline">
            Envíos
          </Link>
          <Link href="#" className="font-medium tracking-tight text-xs uppercase text-zinc-500 hover:text-primary transition-colors hover:underline">
            Autenticidad
          </Link>
        </div>

        <div className="flex gap-4">
          <span className="material-symbols-outlined text-zinc-400 hover:text-primary cursor-pointer">language</span>
          <span className="material-symbols-outlined text-zinc-400 hover:text-primary cursor-pointer">share</span>
        </div>
      </div>
    </footer>
  )
}
