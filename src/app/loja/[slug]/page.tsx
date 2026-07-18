import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { SYSTEMS } from '@/lib/content'
import { SystemDetailClient } from '@/components/loja/system-detail-client'

const siteUrl = 'https://lipe.host'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const system = SYSTEMS.find((s) => s.slug === slug)
  if (!system) {
    return {
      title: 'Sistema não encontrado',
      description: 'O sistema solicitado não foi encontrado.',
      robots: { index: false, follow: false },
    }
  }

  const title = `${system.name} — ${system.tagline}`
  const description = system.shortDescription

  return {
    title,
    description,
    alternates: {
      canonical: `/loja/${system.slug}`,
    },
    keywords: [
      system.name.toLowerCase(),
      system.category.toLowerCase(),
      ...system.technologies.map((t) => t.toLowerCase()),
      ...system.highlights.map((h) => h.toLowerCase()),
      'sistema pronto',
      'comprar sistema',
      'implantação de sistema',
      'lipehost',
      'lipe.host',
    ],
    openGraph: {
      title: `${system.name} — LIPE.HOST`,
      description,
      type: 'website',
      url: `${siteUrl}/loja/${system.slug}`,
      siteName: 'LIPE.HOST',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: system.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${system.name} — LIPE.HOST`,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default async function SystemDetailPage({ params }: PageProps) {
  const { slug } = await params
  const system = SYSTEMS.find((s) => s.slug === slug)

  if (!system) {
    notFound()
  }

  // related systems (same category or random)
  const related = SYSTEMS.filter((s) => s.slug !== system.slug && s.category === system.category).slice(0, 3)
  const fallbackRelated = SYSTEMS.filter((s) => s.slug !== system.slug).slice(0, 3)
  const finalRelated = related.length > 0 ? related : fallbackRelated

  // JSON-LD: SoftwareApplication
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: system.name,
    applicationCategory: system.category,
    operatingSystem: 'Web, Android, iOS',
    description: system.longDescription,
    url: `${siteUrl}/loja/${system.slug}`,
    screenshot: `${siteUrl}/og-image.png`,
    offers: {
      '@type': 'Offer',
      price: system.startingPrice?.replace(/[^\d]/g, '') || '0',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/loja/${system.slug}#planos`,
      seller: { '@id': `${siteUrl}/#organization` },
    },
    featureList: system.features.map((f) => `${f.title}: ${f.description}`),
    softwareRequirements: system.technologies.join(', '),
    applicationSubCategory: system.tagline,
    publisher: { '@id': `${siteUrl}/#organization` },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '12',
    },
  }

  // JSON-LD: Product (helps shopping rich results)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: system.name,
    description: system.shortDescription,
    category: system.category,
    brand: { '@id': `${siteUrl}/#organization` },
    url: `${siteUrl}/loja/${system.slug}`,
    image: `${siteUrl}/og-image.png`,
    offers: system.plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      description: plan.description,
      price: plan.price.replace(/[^\d]/g, '') || '0',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/loja/${system.slug}#planos`,
      seller: { '@id': `${siteUrl}/#organization` },
    })),
    keywords: system.highlights.join(', '),
  }

  // JSON-LD: FAQPage
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: system.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

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
      {
        '@type': 'ListItem',
        position: 3,
        name: system.name,
        item: `${siteUrl}/loja/${system.slug}`,
      },
    ],
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <CursorGlow />
      <Navbar />

      <main className="flex-1 pt-32">
        <SystemDetailClient system={system} related={finalRelated} />
      </main>

      <Footer />
    </div>
  )
}
