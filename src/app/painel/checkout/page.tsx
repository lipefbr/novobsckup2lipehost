'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Loader2, ArrowLeft, Check, X, Lock } from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="size-8 text-slate-400 animate-spin" /></div>}>
      <CheckoutContent />
    </React.Suspense>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment')
  const [payment, setPayment] = React.useState<{
    amount: number
    paymentMethod: string
    status: string
    mpPreferenceId: string | null
    initPoint?: string
    plan?: { name: string } | null
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [paid, setPaid] = React.useState(false)

  React.useEffect(() => {
    if (!paymentId) {
      setError('ID do pagamento não fornecido')
      setLoading(false)
      return
    }

    // Fetch payment details + create preference if needed
    fetch(`/api/payments/checkout?paymentId=${paymentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success && data.error) throw new Error(data.error)
        setPayment(data)
        if (data.status === 'approved') setPaid(true)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro'))
      .finally(() => setLoading(false))

    // Poll for payment status every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?paymentId=${paymentId}`)
        const data = await res.json()
        if (data.status === 'approved') {
          setPaid(true)
          clearInterval(interval)
        }
      } catch {}
    }, 3000)

    return () => clearInterval(interval)
  }, [paymentId])

  if (loading) {
    return (
      <PainelShell>
        <div className="max-w-2xl mx-auto p-8">
          <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-center text-sm text-slate-500 mt-3">Preparando checkout...</p>
        </div>
      </PainelShell>
    )
  }

  if (error) {
    return (
      <PainelShell>
        <div className="max-w-2xl mx-auto p-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <X className="size-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-900 font-semibold">{error}</p>
            <Link href="/painel/planos" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
              ← Voltar para planos
            </Link>
          </div>
        </div>
      </PainelShell>
    )
  }

  if (paid) {
    return (
      <PainelShell>
        <div className="max-w-2xl mx-auto p-8">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-8 text-center">
            <div className="size-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Check className="size-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900">Pagamento aprovado!</h2>
            <p className="text-emerald-700 mt-2">Sua assinatura foi ativada com sucesso.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/painel" className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Ir para o painel
              </Link>
              <Link href="/painel/planos" className="px-6 py-2.5 rounded-lg border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-100">
                Ver planos
              </Link>
            </div>
          </div>
        </div>
      </PainelShell>
    )
  }

  return (
    <PainelShell>
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Header with security badge */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/painel/planos" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <Lock className="size-3.5" />
            Pagamento seguro
          </div>
        </div>

        {/* Plan summary */}
        {payment?.plan && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Assinatura</p>
                <p className="text-lg font-bold text-slate-900">{payment.plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Valor</p>
                <p className="text-lg font-bold text-slate-900">R$ {payment.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Shield className="size-4 text-emerald-600" /> Criptografado SSL
          </div>
          <div className="flex items-center gap-1">
            <Lock className="size-4 text-blue-600" /> Mercado Pago
          </div>
        </div>

        {/* MP Checkout iframe */}
        {payment?.initPoint && (
          <div className="rounded-xl border-2 border-slate-200 overflow-hidden bg-white">
            <iframe
              src={payment.initPoint}
              className="w-full"
              style={{ minHeight: '600px', border: 'none' }}
              title="Checkout Mercado Pago"
            />
          </div>
        )}

        {!payment?.initPoint && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm text-amber-900">
              Aguarde, redirecionando para o checkout seguro...
            </p>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">
          🔒 Seu pagamento é processado com segurança pelo Mercado Pago.
          Não armazenamos seus dados de cartão.
        </p>
      </div>
    </PainelShell>
  )
}
