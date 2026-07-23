'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Wallet, CreditCard, Clock, CheckCircle2, XCircle, Loader2,
  RefreshCw, QrCode, Copy, Check, AlertCircle, Crown,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  status: string
  dueDate: string | null
  paidAt: string | null
  createdAt: string
  mpPixQrCode: string | null
  mpPixQrCodeImage: string | null
  plan?: { name: string } | null
}

export default function FinanceiroPage() {
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/list')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPayments(data.payments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  const pending = payments.filter((p) => p.status === 'pending')
  const approved = payments.filter((p) => p.status === 'approved')
  const rejected = payments.filter((p) => p.status === 'rejected' || p.status === 'cancelled')
  const totalSpent = approved.reduce((sum, p) => sum + p.amount, 0)

  const copyQr = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <PainelShell>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Wallet className="size-7 text-blue-600" />
              Financeiro
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie seus pagamentos e assinatura
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/painel/planos">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <Crown className="size-4" />
                Ver Planos
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={load} className="text-slate-600">
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex items-center gap-2">
            <AlertCircle className="size-4" /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-1 text-amber-600 mb-1">
              <Clock className="size-4" />
              <span className="text-xs font-semibold">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{pending.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-1 text-emerald-600 mb-1">
              <CheckCircle2 className="size-4" />
              <span className="text-xs font-semibold">Pagos</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{approved.length}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-1 text-red-600 mb-1">
              <XCircle className="size-4" />
              <span className="text-xs font-semibold">Recusados</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{rejected.length}</p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Wallet className="size-4" />
              <span className="text-xs font-semibold">Total gasto</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">R$ {totalSpent.toFixed(2)}</p>
          </div>
        </div>

        {/* Pending payments (FIRST — most important) */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="size-5 text-amber-600" />
            Pagamentos Pendentes
            {pending.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pending.length}</span>
            )}
          </h2>
          {loading ? (
            <div className="py-8 text-center"><Loader2 className="size-6 text-slate-400 animate-spin mx-auto" /></div>
          ) : pending.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
              <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhum pagamento pendente. Tudo em dia! ✓</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pending.map((p) => (
                <div key={p.id} className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{p.plan?.name || 'Assinatura'}</h3>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Pendente</span>
                      </div>
                      <p className="text-sm font-mono font-semibold text-slate-900 mt-1">R$ {p.amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.paymentMethod === 'pix' ? 'PIX' : 'Cartão'} ·
                        {' '}Criado em {new Date(p.createdAt).toLocaleString('pt-BR')}
                        {p.dueDate && ` · Expira em ${new Date(p.dueDate).toLocaleTimeString('pt-BR')}`}
                      </p>
                    </div>
                    {p.paymentMethod === 'pix' && p.mpPixQrCode && (
                      <div className="flex items-center gap-2">
                        {p.mpPixQrCodeImage && (
                          <div className="p-2 bg-white border-2 border-slate-200 rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`data:image/png;base64,${p.mpPixQrCodeImage}`} alt="QR PIX" className="size-24" />
                          </div>
                        )}
                        <button
                          onClick={() => copyQr(p.id, p.mpPixQrCode!)}
                          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          {copied === p.id ? <><Check className="size-3" /> Copiado!</> : <><Copy className="size-3" /> Copiar PIX</>}
                        </button>
                      </div>
                    )}
                    {p.paymentMethod === 'credit_card' && (
                      <Link href="/painel/planos">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <CreditCard className="size-3.5" /> Pagar agora
                        </Button>
                      </Link>
                    )}
                  </div>
                  {p.paymentMethod === 'credit_card' && (
                    <p className="text-xs text-red-600 mt-2">
                      ⚠️ Pagamento recusado. Clique em "Pagar agora" para tentar novamente.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Histórico de Pagamentos</h2>
          {approved.length === 0 && rejected.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm text-slate-500">Nenhum pagamento ainda</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Plano</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Valor</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Método</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...approved, ...rejected].map((p) => (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{p.plan?.name || '—'}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">R$ {p.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-700">{p.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {p.status === 'approved' ? '✓ Pago' : p.status === 'rejected' ? '✕ Recusado' : p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString('pt-BR') : new Date(p.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PainelShell>
  )
}
