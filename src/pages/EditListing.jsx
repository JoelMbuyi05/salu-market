import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/authContext'

const categories = [
    { slug: 'phones', labelKey: 'categories.phones' },
    { slug: 'clothes', labelKey: 'categories.clothes' },
    { slug: 'electronics', labelKey: 'categories.electronics' },
    { slug: 'food', labelKey: 'categories.food' },
    { slug: 'furniture', labelKey: 'categories.furniture' },
    { slug: 'vehicles', labelKey: 'categories.vehicles' },
    { slug: 'services', labelKey: 'categories.services' },
    { slug: 'other', labelKey: 'categories.other' },
]

export default function EditListing() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useAuth()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('phones')
    const [quartier, setQuartier] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    async function fetchListing() {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !data) {
            navigate('/')
            return
        }

        setTitle(data.title)
        setDescription(data.description || '')
        setPrice(data.price.toString())
        setCategory(data.category_slug)
        setQuartier(data.quartier)
        setLoading(false)
    }

    useEffect(() => {
        fetchListing()
    }, [id])

    async function handleSave() {
        if (!title || !price || !quartier) {
            setError('Veuillez remplir tous les champs obligatoires')
            return
        }

        setSaving(true)
        setError('')

        const { error } = await supabase
            .from('listings')
            .update({
                title,
                description,
                price: parseFloat(price),
                category_slug: category,
                quartier
            })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        navigate('/profile')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-light-bg pb-24">

            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-white text-xl">←</button>
                <h1 className="text-white font-semibold">{t('listing.edit')}</h1>
            </div>

            <div className="flex flex-col gap-3 p-4">

                {/* Title */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.title')} *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="bg-light-bg rounded-xl px-4 py-3 text-sm text-near-black outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Price */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.price')} (FC) *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="bg-light-bg rounded-xl px-4 py-3 text-sm text-near-black outline-none w-full focus:ring-2 focus:ring-primary"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">FC</span>
                    </div>
                </div>

                {/* Category */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.category')} *
                    </label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="bg-light-bg rounded-xl px-4 py-3 text-sm text-near-black outline-none"
                    >
                        {categories.map(cat => (
                            <option key={cat.slug} value={cat.slug}>
                                {t(cat.labelKey)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        📍 {t('listing.location')} *
                    </label>
                    <input
                        type="text"
                        value={quartier}
                        onChange={e => setQuartier(e.target.value)}
                        className="bg-light-bg rounded-xl px-4 py-3 text-sm text-near-black outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.description')}
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="bg-light-bg rounded-xl px-4 py-3 text-sm text-near-black outline-none resize-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                )}

            </div>

            {/* Save button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-white w-full rounded-xl py-3.5 font-semibold text-base disabled:opacity-60"
                >
                    {saving ? t('common.loading') : t('common.save')}
                </button>
            </div>

        </div>
    )
}