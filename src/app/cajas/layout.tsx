import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mystery Box de Jerseys',
  description:
    'Elige tu Mystery Box: Debutante ($899), Doble ($1,599), Hat-Trick ($2,499) o Jersey Club ($2,999). Jerseys originales de Liga MX, Premier League, Champions League y más. Envío gratis a todo México.',
  alternates: {
    canonical: 'https://cascaritajc.com/cajas',
  },
  openGraph: {
    url: 'https://cascaritajc.com/cajas',
    title: 'Mystery Box de Jerseys Originales | La Cascarita Jersey Club',
    description:
      'Desde $899 MXN. Recibe jerseys originales de sorpresa de las mejores ligas del mundo. Envío gratis incluido.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Mystery Box de Jerseys – La Cascarita Jersey Club',
  url: 'https://cascaritajc.com/cajas',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Product',
        name: 'Mystery Box Debutante',
        description: '1 jersey original de las mejores ligas del mundo. Envío gratis a México.',
        url: 'https://cascaritajc.com/cajas',
        brand: { '@type': 'Brand', name: 'La Cascarita Jersey Club' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MXN',
          price: '899.00',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'La Cascarita Jersey Club' },
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Product',
        name: 'Mystery Box Doble',
        description: '2 jerseys originales de las mejores ligas del mundo. Envío gratis a México.',
        url: 'https://cascaritajc.com/cajas',
        brand: { '@type': 'Brand', name: 'La Cascarita Jersey Club' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MXN',
          price: '1599.00',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'La Cascarita Jersey Club' },
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Product',
        name: 'Mystery Box Hat-Trick',
        description: '3 jerseys originales de las mejores ligas del mundo. Envío gratis a México.',
        url: 'https://cascaritajc.com/cajas',
        brand: { '@type': 'Brand', name: 'La Cascarita Jersey Club' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MXN',
          price: '2499.00',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'La Cascarita Jersey Club' },
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Product',
        name: 'Mystery Box Jersey Club',
        description: '4 jerseys originales de las mejores ligas del mundo. Envío gratis a México.',
        url: 'https://cascaritajc.com/cajas',
        brand: { '@type': 'Brand', name: 'La Cascarita Jersey Club' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MXN',
          price: '2999.00',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'La Cascarita Jersey Club' },
        },
      },
    },
  ],
}

export default function CajasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
