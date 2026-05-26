import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { translateAuthError } from '../lib/authErrors'

export default function Login() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(translateAuthError(error.message, i18n.language))
        } else {
            navigate('/')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="bg-primary flex flex-col items-center justify-center px-6 pt-16 pb-10">
                <img
                    src="/icon-512.png"
                    alt="Salu"
                    className="w-20 h-20 rounded-2xl mb-4 shadow-lg"
                />
                <h1 className="text-white text-3xl font-bold">Salu Market</h1>
                <p className="text-accent text-sm mt-1 text-center">
                    {t('tagline')}
                </p>
            </div>

            <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 flex flex-col gap-5">
                <h2 className="text-near-black text-xl font-bold">
                    {t('auth.login')}
                </h2>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-near-black text-sm font-medium">
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-light-bg rounded-xl px-4 py-3 text-near-black text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="exemple@gmail.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-near-black text-sm font-medium">
                            {t('auth.password')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-light-bg rounded-xl px-4 py-3 text-near-black text-sm outline-none focus:ring-2 focus:ring-primary w-full pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm"
                            >
                                {showPassword ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-primary text-white w-full rounded-xl py-3.5 font-semibold text-base disabled:opacity-60 mt-2"
                >
                    {loading ? t('common.loading') : t('auth.login')}
                </button>

                <p className="text-center text-sm text-muted">
                    Pas de compte ?{' '}
                    <Link to="/register" className="text-primary font-semibold">
                        {t('auth.register')}
                    </Link>
                </p>
            </div>
        </div>
    )
}