import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/authContext'
import imageCompression from 'browser-image-compression'

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

export default function PostListing() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('phones')
    const [quartier, setQuartier] = useState('')
    const [images, setImages] = useState([])
    const [previews, setPreviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleImagePick(e) {
        const files = Array.from(e.target.files).slice(0, 5)
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        }
        const compressed = await Promise.all(
            files.map(file => imageCompression(file, options))
        )
        setImages(compressed)
        const urls = compressed.map(f => URL.createObjectURL(f))
        setPreviews(urls)
    }

    async function handleSubmit() {
        if (!title || !price || !quartier) {
            setError('Veuillez remplir tous les champs obligatoires')
            return
        }
        setLoading(true)
        setError('')

        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .insert({
                user_id: user.id,
                title,
                description,
                price: parseFloat(price),
                category_slug: category,
                quartier,
                is_sold: false,
                is_flagged: false
            })
            .select()
            .single()

        if (listingError) {
            setError(listingError.message)
            setLoading(false)
            return
        }

        for (let i = 0; i < images.length; i++) {
            const file = images[i]
            const fileName = `${listing.id}/${Date.now()}_${i}.jpg`
            const { error: uploadError } = await supabase.storage
                .from('listing-images')
                .upload(fileName, file, { contentType: 'image/jpeg' })
            if (uploadError) continue
            const { data: urlData } = supabase.storage
                .from('listing-images')
                .getPublicUrl(fileName)
            await supabase
                .from('listing_images')
                .insert({ listing_id: listing.id, url: urlData.publicUrl, position: i })
        }

        setLoading(false)
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-light-bg pb-24">

            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-white text-xl">←</button>
                <h1 className="text-white font-semibold">{t('listing.post_listing')}</h1>
            </div>

            <div className="flex flex-col gap-3 p-4">

                {/* Photos first — more visual */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                    <label className="text-near-black font-semibold text-sm">
                        📷 {t('listing.photos')} (max 5)
                    </label>

                    {previews.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {previews.map((url, i) => (
                                <img
                                    key={i}
                                    src={url}
                                    alt={`preview ${i}`}
                                    className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                                />
                            ))}
                        </div>
                    )}

                    <label className="flex items-center justify-center gap-2 bg-light-bg border-2 border-dashed border-border rounded-xl py-5 cursor-pointer">
                        <span className="text-muted text-sm">
                            {previews.length > 0 ? `${previews.length} photo(s) sélectionnée(s)` : 'Appuyer pour ajouter des photos'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImagePick}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Title */}
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.title')} *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: iPhone 13 Pro Max 256GB"
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
                            placeholder="850000"
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
                        placeholder="Ex: Nganza, Muya, Bipemba..."
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
                        placeholder="Décrivez votre article, son état, ses caractéristiques..."
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

            {/* Submit */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-primary text-white w-full rounded-xl py-3.5 font-semibold text-base disabled:opacity-60"
                >
                    {loading ? t('common.loading') : '🛒 ' + t('listing.post_listing')}
                </button>
            </div>

        </div>
    )
}