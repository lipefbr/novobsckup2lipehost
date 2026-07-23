import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const deploys = await db.deploy.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json({
    deploys: deploys.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      framework: d.framework,
      repoUrl: d.repoUrl,
      previewUrl: d.previewUrl,
      customDomain: d.customDomain,
      createdAt: d.createdAt,
      user: d.user,
    })),
  })
}
