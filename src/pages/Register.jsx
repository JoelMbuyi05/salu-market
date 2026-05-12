import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function Register() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleRegister() {
    setLoading(true)
    setError('')
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    })

    if (error) {
        setError(error.message)
        setLoading(false)
        return
    }

    // manually insert into users table
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone
        })

    if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
    }

    navigate('/')
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
                        Nom complet
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-light-bg border border-border rounded-lg px-4 py-3 text-near-black text-sm outline-none focus:border-primary"
                        placeholder="Jean Mukeba"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-near-black text-sm font-medium">
                        {t('auth.phone')}
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-light-bg border border-border rounded-lg px-4 py-3 text-near-black text-sm outline-none focus:border-primary"
                        placeholder="+243XXXXXXXXX"
                    />
                </div>

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
                    onClick={handleRegister}
                    disabled={loading}
                    className="bg-primary text-white w-full rounded-lg py-3 font-semibold mt-2 disabled:opacity-60"
                >
                    {loading ? t('common.loading') : t('auth.register')}
                </button>

                <p className="text-center text-sm text-muted mt-4">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary font-medium">
                        {t('auth.login')}
                    </Link>
                </p>

            </div>
        </div>
    )
}