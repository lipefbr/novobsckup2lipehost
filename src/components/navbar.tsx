'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, X, ArrowRight, LogIn } from 'lucide-react'
import { NAV_LINKS } from '@/lib/content'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet'

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 24)
  })

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'py-2.5' : 'py-4'
      )}
    >
      <div className="container-x">
        <div
          className={cn(
            'flex items-center justify-between rounded-2xl px-4 sm:px-6 transition-all duration-300',
            scrolled
              ? 'glass-strong h-14 shadow-2xl shadow-black/40'
              : 'h-16 bg-transparent'
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label="LIPE.HOST">
            <Image
              src="/lipehost-logo-navbar.png"
              alt="LIPE.HOST"
              width={129}
              height={32}
              priority
              className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA — Entrar + Solicitar Projeto */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/login">
              <Button
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 font-medium gap-1.5"
              >
                <LogIn className="size-4" />
                Entrar
              </Button>
            </Link>
            <Link href="#contato">
              <Button
                size="sm"
                className="relative gradient-bg border-0 text-white font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Solicitar Projeto
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-96 bg-[#0a0a0a] border-white/10 p-0"
            >
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center" aria-label="LIPE.HOST">
                  <Image
                    src="/lipehost-logo-navbar.png"
                    alt="LIPE.HOST"
                    width={129}
                    height={32}
                    className="h-8 w-auto opacity-90"
                  />
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <X className="size-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col gap-1 p-6">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    {link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Login button — mobile */}
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 block px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors border border-white/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="size-4" />
                    Entrar / Registrar-se
                  </span>
                </Link>

                <Link href="#contato" onClick={() => setMobileOpen(false)} className="mt-3">
                  <Button className="w-full gradient-bg border-0 text-white font-semibold h-12">
                    Solicitar Projeto
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}
