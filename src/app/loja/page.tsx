import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { LojaCatalog } from '@/components/loja/loja-catalog'
import { SYSTEMS } from '@/lib/content'

const siteUrl = 'https://lipe.host'

export const metadata: Metadata = {
  title: 'Loja — Catálogo de Sistemas Prontos para Implantação',
  description:
    'Catálogo de sistemas prontos da LIPE.HOST (lipehost): aplicativo de mobilidade (Uber clone), delivery, marketplace multi-vendedores, PDV, CRM, plataforma SaaS, agente IA, sistema de gestão e mais. Sistemas personalizados sob medida.',
  alternates: {
    canonical: '/loja',
  },
  keywords: [
    'sistemas prontos',
    'comprar sistema',
    'aplicativo uber clone',
    'app de delivery',
    'marketplace multi vendedores',
    'pdv completo',
    'crm de vendas',
    'plataforma saas',
    'agente ia',
    'sistema de gestão',
    'sistema de passagens',
    'sistema hospitalar',
    'loja de sistemas',
    'lipehost loja',
    'lipe.host loja',
  ],
  openGraph: {
    title: 'Loja LIPE.HOST — Catálogo de Sistemas Prontos',
    description:
      'Mais de 12 sistemas desenvolvidos, testados e em produção. Mobilidade, delivery, marketplace, PDV, CRM, SaaS, IA e mais.',
    url: `${siteUrl}/loja`,
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Loja LIPE.HOST' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loja LIPE.HOST — Catálogo de Sistemas Prontos',
    description:
      'Mais de 12 sistemas desenvolvidos, testados e em produção. Escolha o sistema ideal para o seu negócio.',
    images: ['/og-image.png'],
  },
}

export default function LojaPage() {
  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Loja',
        item: `${siteUrl}/loja`,
      },
    ],
  }

  // JSON-LD: ItemList with all systems (helps Google index the catalog)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Catálogo de Sistemas LIPE.HOST',
    description:
      'Catálogo de sistemas prontos para implantação: mobilidade, delivery, marketplace, saúde, turismo, financeiro, SaaS, IA e mais.',
    url: `${siteUrl}/loja`,
    numberOfItems: SYSTEMS.length,
    itemListElement: SYSTEMS.map((sys, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: sys.name,
      url: `${siteUrl}/loja/${sys.slug}`,
      description: sys.shortDescription,
    })),
  }

  // JSON-LD: CollectionPage
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Loja de Sistemas LIPE.HOST',
    description:
      'Catálogo completo de sistemas prontos e personalizados desenvolvidos pela LIPE.HOST.',
    url: `${siteUrl}/loja`,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: {
      '@type': 'Thing',
      name: 'Sistemas para Empresas',
    },
    mainEntity: itemListJsonLd,
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <CursorGlow />
      <Navbar />

      <main className="flex-1 pt-32">
        <LojaCatalog />
      </main>

      <Footer />
    </div>
  )
}
