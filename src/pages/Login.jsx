import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function Login() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
        } else {
            navigate('/')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">

            <div className="bg-primary px-4 py-8 text-center">
                <h1 className="text-white text-3xl font-bold">Salu</h1>
                <p className="text-accent text-sm mt-1">
                    Achetez et vendez à Mbuji-Mayi
                </p>
            </div>

            <div className="flex flex-col gap-4 px-6 mt-8">

                <div className="flex flex-col gap-1">
                    <label className="text-near-black text-sm font-medium">
                        {t('auth.email')}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-light-bg border border-border rounded-lg px-4 py-3 text-near-black text-sm outline-none focus:border-primary"
                        placeholder="exemple@gmail.com"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-near-black text-sm font-medium">
                        {t('auth.password')}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-light-bg border border-border rounded-lg px-4 py-3 text-near-black text-sm outline-none focus:border-primary"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-primary text-white w-full rounded-lg py-3 font-semibold mt-2 disabled:opacity-60"
                >
                    {loading ? t('common.loading') : t('auth.login')}
                </button>

                <p className="text-center text-sm text-muted mt-4">
                    Pas de compte ?{' '}
                    <Link to="/register" className="text-primary font-medium">
                        {t('auth.register')}
                    </Link>
                </p>

            </div>
        </div>
    )
}