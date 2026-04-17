'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem('wedoo-pwa-dismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Clean up on unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('wedoo-pwa-dismissed', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-lg px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-800 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 dark:from-rose-950/50 dark:via-pink-950/50 dark:to-rose-950/50 shadow-xl shadow-rose-500/10 p-4">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-200/30 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-tr-full pointer-events-none" />

          <div className="relative flex items-center gap-4">
            {/* App Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">Install Wedoo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Get the full experience — add to your home screen for quick access</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleInstall}
                className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
