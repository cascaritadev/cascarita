'use client'

import { useState } from 'react'

export default function FooterActions() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const data = {
      title: 'La Cascarita Jersey Club',
      text: 'Mystery Boxes de jerseys auténticos. Envío gratis a toda México.',
      url: window.location.origin,
    }

    if (navigator.share) {
      try {
        await navigator.share(data)
      } catch {
        // user cancelled — no action needed
      }
    } else {
      await navigator.clipboard.writeText(data.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex gap-4 items-center">
      <a
        href="https://www.instagram.com/cascaritajc/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram de La Cascarita"
        className="material-symbols-outlined text-zinc-400 hover:text-primary transition-colors cursor-pointer"
      >
        language
      </a>

      <button
        onClick={handleShare}
        aria-label={copied ? 'Enlace copiado' : 'Compartir La Cascarita'}
        title={copied ? '¡Enlace copiado!' : 'Compartir'}
        className="material-symbols-outlined text-zinc-400 hover:text-primary transition-colors cursor-pointer relative"
      >
        {copied ? 'check_circle' : 'share'}
      </button>
    </div>
  )
}
