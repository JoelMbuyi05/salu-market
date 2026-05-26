import { useState, useEffect } from 'react'

export default function SplashScreen({ onFinish }) {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)
    const [scaleIn, setScaleIn] = useState(false)

    useEffect(() => {
        // trigger scale in animation immediately
        const scaleTimer = setTimeout(() => {
            setScaleIn(true)
        }, 100)

        // start fade out after 1.8 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, 1800)

        // remove completely after fade animation
        const removeTimer = setTimeout(() => {
            setVisible(false)
            onFinish()
        }, 2300)

        return () => {
            clearTimeout(scaleTimer)
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
            {/* logo + name */}
            <div
                className="flex flex-col items-center gap-4"
                style={{
                    transform: scaleIn ? 'scale(1)' : 'scale(0.7)',
                    opacity: scaleIn ? 1 : 0,
                    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease'
                }}
            >
                <img
                    src="/icon-512.png"
                    alt="Salu Market"
                    className="w-24 h-24 rounded-2xl shadow-2xl"
                />
                <h1
                    className="text-white font-bold"
                    style={{ fontSize: '28px', letterSpacing: '0.5px' }}
                >
                    Salu Market
                </h1>
            </div>

            {/* loading dots */}
            <div
                className="absolute bottom-16 flex gap-2"
                style={{
                    opacity: scaleIn ? 1 : 0,
                    transition: 'opacity 0.4s ease 0.4s'
                }}
            >
                <div
                    className="w-2 h-2 bg-white rounded-full"
                    style={{ animation: 'bounce 1s infinite', opacity: 0.6 }}
                />
                <div
                    className="w-2 h-2 bg-white rounded-full"
                    style={{ animation: 'bounce 1s infinite 0.2s', opacity: 0.6 }}
                />
                <div
                    className="w-2 h-2 bg-white rounded-full"
                    style={{ animation: 'bounce 1s infinite 0.4s', opacity: 0.6 }}
                />
            </div>
        </div>
    )
}