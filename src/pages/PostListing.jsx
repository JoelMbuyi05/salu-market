import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function PostListing() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState('phones')
    const [quartier, setQuartier] = useState('')
    const [images, setImages] = useState([]) // array of File objects
    const [previews, setPreviews] = useState([]) // array of local URLs for preview
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // when user picks images, create local preview URLs
    function handleImagePick(e) {
        const files = Array.from(e.target.files).slice(0, 5) // max 5 images
        setImages(files)
        const urls = files.map(f => URL.createObjectURL(f))
        setPreviews(urls)
    }

    async function handleSubmit() {
        if (!title || !price || !quartier) {
            setError('Veuillez remplir tous les champs obligatoires')
            return
        }

        setLoading(true)
        setError('')

        // 1. insert listing row first to get the id
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

        // 2. upload images to Supabase Storage
        for (let i = 0; i < images.length; i++) {
            const file = images[i]
            const fileName = `${listing.id}/${Date.now()}_${i}.jpg`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('listing-images')
                .upload(fileName, file, { contentType: 'image/jpeg' })

            if (uploadError) {
                console.error('Image upload error:', uploadError)
                continue // skip failed image, don't block the whole submission
            }

            // get public URL
            const { data: urlData } = supabase.storage
                .from('listing-images')
                .getPublicUrl(fileName)

            // insert into listing_images table
            await supabase
                .from('listing_images')
                .insert({
                    listing_id: listing.id,
                    url: urlData.publicUrl,
                    position: i
                })
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

                {/* Title */}
                <div className="bg-white rounded-xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.title')} *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: iPhone 13 Pro Max 256GB"
                        className="bg-light-bg rounded-lg px-3 py-2 text-sm text-near-black outline-none focus:border focus:border-primary"
                    />
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.description')}
                    </label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Décrivez votre article..."
                        rows={4}
                        className="bg-light-bg rounded-lg px-3 py-2 text-sm text-near-black outline-none resize-none"
                    />
                </div>

                {/* Price */}
                <div className="bg-white rounded-xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.price')} (FC) *
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="Ex: 850000"
                        className="bg-light-bg rounded-lg px-3 py-2 text-sm text-near-black outline-none"
                    />
                </div>

                {/* Category */}
                <div className="bg-white rounded-xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.category')} *
                    </label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="bg-light-bg rounded-lg px-3 py-2 text-sm text-near-black outline-none"
                    >
                        {categories.map(cat => (
                            <option key={cat.slug} value={cat.slug}>
                                {t(cat.labelKey)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quartier */}
                <div className="bg-white rounded-xl p-4 flex flex-col gap-2">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.location')} *
                    </label>
                    <input
                        type="text"
                        value={quartier}
                        onChange={e => setQuartier(e.target.value)}
                        placeholder="Ex: Nganza, Muya, Bipemba..."
                        className="bg-light-bg rounded-lg px-3 py-2 text-sm text-near-black outline-none"
                    />
                </div>

                {/* Photos */}
                <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
                    <label className="text-near-black font-semibold text-sm">
                        {t('listing.photos')} (max 5)
                    </label>

                    {/* image previews */}
                    {previews.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {previews.map((url, i) => (
                                <img
                                    key={i}
                                    src={url}
                                    alt={`preview ${i}`}
                                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                />
                            ))}
                        </div>
                    )}

                    <label className="flex items-center justify-center gap-2 bg-light-bg border border-dashed border-border rounded-lg py-4 cursor-pointer">
                        <span className="text-muted text-sm">📷 Choisir des photos</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImagePick}
                            className="hidden"
                        />
                    </label>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

            </div>

            {/* Submit button fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-primary text-white w-full rounded-lg py-3 font-semibold disabled:opacity-60"
                >
                    {loading ? t('common.loading') : t('listing.post_listing')}
                </button>
            </div>

        </div>
    )
}