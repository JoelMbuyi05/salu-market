import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        // start fade out after 1.5 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, 1500)

        // remove completely after fade animation (0.5s)
        const removeTimer = setTimeout(() => {
            setVisible(false)
            onFinish()
        }, 2000)

        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(removeTimer)
        }
    }, [])

    if (!visible) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ backgroundColor: '#1a6b3c' }}
        >
            {/* logo */}
            <div className={`flex flex-col items-center gap-4 transition-transform duration-500 ${
                fadeOut ? 'scale-95' : 'scale-100'
            }`}>
                <img
                    src="/icon-512.png"
                    alt="Salu Market"
                    className="w-24 h-24 rounded-2xl shadow-2xl"
                    style={{
                        animation: 'pulse 1.5s ease-in-out'
                    }}
                />
                <div className="text-center">
                    <h1 className="text-white text-3xl font-bold">Salu Market</h1>
                    <p className="text-green-300 text-sm mt-1">
                        Achète, vends. Simplement en un clic.
                    </p>
                </div>
            </div>

            {/* loading dots at bottom */}
            <div className="absolute bottom-16 flex gap-2">
                <div className="w-2 h-2 bg-white rounded-full opacity-60"
                    style={{ animation: 'bounce 1s infinite' }} />
                <div className="w-2 h-2 bg-white rounded-full opacity-60"
                    style={{ animation: 'bounce 1s infinite 0.2s' }} />
                <div className="w-2 h-2 bg-white rounded-full opacity-60"
                    style={{ animation: 'bounce 1s infinite 0.4s' }} />
            </div>
        </div>
    )
}