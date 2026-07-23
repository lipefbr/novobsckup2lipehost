'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ExternalLink, Crown, CreditCard, Rocket, Ticket, Database } from 'lucide-react'

/**
 * Renders AI chat messages with clickable buttons for internal paths.
 * Detects /painel/planos, /loja/xxx, /painel/tickets, etc. and renders as buttons.
 * Also parses **bold** text.
 */
export function ChatMessageRenderer({ content }: { content: string }) {
  const router = useRouter()
  const blocks = content.split('\n\n')
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} router={router} />
      ))}
    </div>
  )
}

function BlockRenderer({ block, router }: { block: string; router: ReturnType<typeof useRouter> }) {
  const trimmed = block.trim()
  if (!trimmed) return null

  // List items
  if (trimmed.match(/^[-•]\s/m) || trimmed.match(/^\d+\.\s/m)) {
    const items = trimmed.split('\n').filter(l => l.trim())
    return (
      <ul className="space-y-1 ml-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm flex items-start gap-1.5">
            <span className="text-blue-500 mt-0.5">•</span>
            <span className="flex-1"><InlineRenderer text={item.replace(/^[-•]\s|^\d+\.\s/, '')} router={router} /></span>
          </li>
        ))}
      </ul>
    )
  }

  // Heading
  if (trimmed.startsWith('##') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 60)) {
    const text = trimmed.replace(/^##\s*|^\*\*|\*\*$/g, '')
    return <h4 className="text-sm font-bold text-slate-900 mt-1">{text}</h4>
  }

  // Regular paragraph
  return <p className="text-sm leading-relaxed"><InlineRenderer text={trimmed} router={router} /></p>
}

function InlineRenderer({ text, router }: { text: string; router: ReturnType<typeof useRouter> }) {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Strip ** around paths: **/painel/planos** → /painel/planos
    // Match paths even inside bold markdown
    const pathMatch = remaining.match(/\/(?:painel\/[\w/]+|loja\/[\w/]+|admin\/\w+)/)
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)

    const pathIdx = pathMatch ? remaining.indexOf(pathMatch[0]) : -1
    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : -1

    if (pathIdx === -1 && boldIdx === -1) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }

    // If a path is found, render it as a button (even if inside **)
    if (pathIdx !== -1 && (boldIdx === -1 || pathIdx <= boldIdx)) {
      // Check if path is inside **bold** — if so, skip the ** before it
      if (pathIdx >= 2 && remaining[pathIdx - 1] === '*' && remaining[pathIdx - 2] === '*') {
        // Render text before the **
        if (pathIdx - 2 > 0) parts.push(<span key={key++}>{remaining.substring(0, pathIdx - 2)}</span>)
        parts.push(<PathButton key={key++} path={pathMatch![0]} router={router} />)
        // Skip the path + trailing ** if present
        let afterPath = pathIdx + pathMatch![0].length
        if (afterPath < remaining.length && remaining[afterPath] === '*' && remaining[afterPath + 1] === '*') {
          afterPath += 2
        }
        remaining = remaining.substring(afterPath)
      } else {
        if (pathIdx > 0) parts.push(<span key={key++}>{remaining.substring(0, pathIdx)}</span>)
        parts.push(<PathButton key={key++} path={pathMatch![0]} router={router} />)
        remaining = remaining.substring(pathIdx + pathMatch![0].length)
      }
    } else if (boldIdx !== -1) {
      // Check if the bold text contains a path
      const boldContent = boldMatch![1]
      const innerPath = boldContent.match(/\/(?:painel\/[\w/]+|loja\/[\w/]+|admin\/\w+)/)
      if (innerPath) {
        // The bold text contains a path — render as button
        if (boldIdx > 0) parts.push(<span key={key++}>{remaining.substring(0, boldIdx)}</span>)
        parts.push(<PathButton key={key++} path={innerPath[0]} router={router} />)
        remaining = remaining.substring(boldIdx + boldMatch![0].length)
      } else {
        // Regular bold
        if (boldIdx > 0) parts.push(<span key={key++}>{remaining.substring(0, boldIdx)}</span>)
        parts.push(<strong key={key++} className="font-semibold text-slate-900">{boldContent}</strong>)
        remaining = remaining.substring(boldIdx + boldMatch![0].length)
      }
    }
  }

  return <>{parts}</>
}

function PathButton({ path, router }: { path: string; router: ReturnType<typeof useRouter> }) {
  let icon = <ChevronRight className="size-3.5" />
  let label = path

  if (path.includes('/planos')) { icon = <Crown className="size-3.5" />; label = 'Ver Planos' }
  else if (path.includes('/loja/')) { icon = <Rocket className="size-3.5" />; label = 'Ver Sistema' }
  else if (path.includes('/loja')) { icon = <Rocket className="size-3.5" />; label = 'Ver Loja' }
  else if (path.includes('/tickets')) { icon = <Ticket className="size-3.5" />; label = 'Abrir Tickets' }
  else if (path.includes('/financeiro')) { icon = <CreditCard className="size-3.5" />; label = 'Financeiro' }
  else if (path.includes('/bancos')) { icon = <Database className="size-3.5" />; label = 'Bancos de Dados' }
  else if (path.includes('/projetos')) { icon = <Rocket className="size-3.5" />; label = 'Meus Projetos' }

  return (
    <button
      onClick={() => router.push(path)}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 text-blue-700 text-xs font-semibold transition-all align-middle mx-0.5"
    >
      {icon}
      {label}
      <ExternalLink className="size-3 opacity-50" />
    </button>
  )
}
