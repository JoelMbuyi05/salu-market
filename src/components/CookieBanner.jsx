import { useState, useEffect } from 'react'

export default function CookieBanner() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const accepted = localStorage.getItem('cookies_accepted')
        if (!accepted) {
            setTimeout(() => setShow(true), 2000)
        }
    }, [])

    function accept() {
        localStorage.setItem('cookies_accepted', 'true')
        setShow(false)
    }

    function decline() {
        localStorage.setItem('cookies_accepted', 'false')
        setShow(false)
    }

    if (!show) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-near-black text-white rounded-2xl p-4 z-40 shadow-2xl">
            <p className="text-sm font-semibold mb-1">Cookies</p>
            <p className="text-xs text-gray-300 leading-relaxed">
                Salu Market utilise des cookies pour améliorer votre expérience et analyser le trafic anonymement.
            </p>
            <div className="flex gap-2 mt-3">
                <button
                    onClick={accept}
                    className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-semibold"
                >
                    Accepter
                </button>
                <button
                    onClick={decline}
                    className="flex-1 bg-white bg-opacity-20 text-white rounded-xl py-2 text-sm font-semibold"
                >
                    Refuser
                </button>
            </div>
        </div>
    )
}