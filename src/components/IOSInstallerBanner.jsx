import { useState, useEffect } from 'react'

export default function IOSInstallBanner() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            // detect iOS Safari
            const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
            // detect if already installed as PWA
            const isStandalone = window.navigator.standalone === true
            // only show if iOS and not already installed
            if (isIOS && !isStandalone) {
                setShow(true)
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    if (!show) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 z-50 flex items-start gap-3">
            <img
                src="/icon-192.png"
                alt="Salu"
                className="w-10 h-10 rounded-xl flex-shrink-0"
            />
            <div className="flex-1">
                <p className="text-near-black text-sm font-semibold">
                    Installer Salu
                </p>
                <p className="text-muted text-xs mt-0.5">
                    Appuyez sur <span className="font-semibold">□↑</span> puis "Sur l'écran d'accueil"
                </p>
            </div>
            <button
                onClick={() => setShow(false)}
                className="text-muted text-xl leading-none flex-shrink-0"
            >
                ×
            </button>
        </div>
    )
}