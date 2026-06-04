import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { translateAuthError } from '../lib/authErrors'
import { trackSignUp } from '../lib/analytics'

export default function Register() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleRegister() {
       setLoading(true)
        setError('')
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
            setError(translateAuthError(error.message, i18n.language))
            setLoading(false)
            return
        }
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: data.user.id,
                full_name: fullName,
                phone: phone
            })
        if (profileError) {
            setError(translateAuthError(profileError.message))
            setLoading(false)
            return
        }
        navigate('/')
        trackSignUp()
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="bg-primary flex flex-col items-center justify-center px-6 pt-12 pb-10">
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

            <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 flex flex-col gap-5 pb-10">
                <h2 className="text-near-black text-xl font-bold">
                    {t('auth.register')}
                </h2>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-near-black text-sm font-medium">
                            Nom complet
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-light-bg rounded-xl px-4 py-3 text-near-black text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Jean Mukeba"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-near-black text-sm font-medium">
                            {t('auth.phone')}
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-light-bg rounded-xl px-4 py-3 text-near-black text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="+243XXXXXXXXX"
                        />
                    </div>

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
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
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
                    onClick={handleRegister}
                    disabled={loading}
                    className="bg-primary text-white w-full rounded-xl py-3.5 font-semibold text-base disabled:opacity-60"
                >
                    {loading ? t('common.loading') : t('auth.register')}
                </button>

                <p className="text-center text-sm text-muted">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary font-semibold">
                        {t('auth.login')}
                    </Link>
                </p>
            </div>
        </div>
    )
}