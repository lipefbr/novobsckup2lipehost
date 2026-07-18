import type { MetadataRoute } from 'next'
import { SYSTEMS } from '@/lib/content'

const siteUrl = 'https://lipe.host'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/loja`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
  ]

  const systemPages: MetadataRoute.Sitemap = SYSTEMS.map((s) => ({
    url: `${siteUrl}/loja/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  return [...staticPages, ...systemPages]
}
