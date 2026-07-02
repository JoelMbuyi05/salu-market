import { useState, useEffect } from 'react'

export default function IOSInstallBanner() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
            const isStandalone = window.navigator.standalone === true
            if (isIOS && !isStandalone) {
                setShow(true)
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [])

    if (!show) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 bg-white border border-border rounded-2xl px-4 py-3 z-50 flex items-center gap-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="flex-1">
                <p className="text-near-black text-sm font-semibold">
                    Installer Salu Market
                </p>
                <p className="text-muted text-xs mt-0.5">
                    Appuyez sur{' '}
                    <span className="font-semibold">↑</span>
                    {' '}puis "Sur l'écran d'accueil"
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