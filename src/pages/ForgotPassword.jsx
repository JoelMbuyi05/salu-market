import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    async function handleReset() {
        if (!email) {
            setError('Veuillez entrer votre email')
            return
        }
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) {
            setError(error.message)
        } else {
            setSent(true)
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
            </div>

            <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 flex flex-col gap-5">

                {sent ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-16 h-16 bg-badge-bg rounded-full flex items-center justify-center">
                            <span className="text-3xl">✉️</span>
                        </div>
                        <h2 className="text-near-black text-xl font-bold text-center">
                            Email envoyé !
                        </h2>
                        <p className="text-muted text-sm text-center leading-relaxed">
                            Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-primary text-white w-full rounded-xl py-3.5 font-semibold mt-4"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 className="text-near-black text-xl font-bold">
                                Mot de passe oublié
                            </h2>
                            <p className="text-muted text-sm mt-1">
                                Entrez votre email et nous vous enverrons un lien de réinitialisation.
                            </p>
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

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="bg-primary text-white w-full rounded-xl py-3.5 font-semibold disabled:opacity-60"
                        >
                            {loading ? t('common.loading') : 'Envoyer le lien'}
                        </button>

                        <p className="text-center text-sm text-muted">
                            <Link to="/login" className="text-primary font-semibold">
                                ← Retour à la connexion
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}