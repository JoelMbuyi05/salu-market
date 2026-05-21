import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

export default function ListingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [listing, setListing] = useState(null)
    const [seller, setSeller] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentImage, setCurrentImage] = useState(0)

    // Swipe states
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)

    async function fetchListing() {

        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                listing_images (url, position)
            `)
            .eq('id', id)
            .single()

        if (error || !data) {
            navigate('/')
            return
        }

        data.listing_images.sort((a, b) => a.position - b.position)

        setListing(data)

        const { data: sellerData } = await supabase
            .from('users')
            .select('full_name, phone, quartier, avatar_url')
            .eq('id', data.user_id)
            .single()

        setSeller(sellerData)

        await supabase
            .from('listings')
            .update({
                view_count: (data.view_count || 0) + 1
            })
            .eq('id', id)

        setLoading(false)
    }

    useEffect(() => {
        setLoading(true)
        fetchListing()
    }, [id])

    // Swipe handlers
    function handleTouchStart(e) {
        setTouchStart(e.targetTouches[0].clientX)
    }

    function handleTouchMove(e) {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    function handleTouchEnd() {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd

        // Swipe left
        if (distance > 50 && currentImage < images.length - 1) {
            setCurrentImage(prev => prev + 1)
        }

        // Swipe right
        if (distance < -50 && currentImage > 0) {
            setCurrentImage(prev => prev - 1)
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    function buildWhatsAppLink() {
        if (!seller?.phone) return '#'

        const phone = seller.phone.replace(/\D/g, '')

        const message = encodeURIComponent(
            `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur Salu. Est-ce encore disponible ?`
        )

        return `https://wa.me/${phone}?text=${message}`
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!listing) return null

    const images = listing.listing_images || []
    const hasImages = images.length > 0

    return (
        <div className="min-h-screen bg-light-bg pb-24">

            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white text-xl leading-none"
                >
                    ←
                </button>

                <h1 className="text-white font-semibold text-base line-clamp-1">
                    {listing.title}
                </h1>
            </div>

            {/* Images */}
                <div className="bg-white">

                    <div
                        className="h-72 w-full overflow-hidden relative"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={
                                hasImages
                                    ? images[currentImage].url
                                    : 'https://placehold.co/400x300/f5f5f5/888787?text=Salu'
                            }
                            alt={listing.title}
                            className="w-full h-full object-cover"
                        />

                        {/* Image counter */}
                        {images.length > 1 && (
                            <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                                {currentImage + 1}/{images.length}
                            </div>
                        )}
                    </div>

                </div>

            {/* Listing info */}
            <div className="bg-white mt-2 px-4 py-4 flex flex-col gap-2">

                <h2 className="text-near-black font-bold text-lg leading-snug">
                    {listing.title}
                </h2>

                <p className="text-primary font-bold text-2xl">
                    {listing.price.toLocaleString()} FC
                </p>

                <p className="text-muted text-sm">
                    {listing.quartier} · {listing.category_slug}
                </p>

            </div>

            {/* Description */}
            {listing.description && (
                <div className="bg-white mt-2 px-4 py-4">

                    <h3 className="text-near-black font-semibold mb-2">
                        Description
                    </h3>

                    <p className="text-near-black text-sm leading-relaxed">
                        {listing.description}
                    </p>

                </div>
            )}

            {/* Seller card */}
            <div className="bg-white mt-2 px-4 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-badge-bg flex items-center justify-center">
                    {seller?.avatar_url ? (
                        <img
                            src={seller.avatar_url}
                            alt={seller.full_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-primary font-bold text-sm">
                            {seller?.full_name?.[0]?.toUpperCase() || '?'}
                        </span>
                    )}
                </div>

                <div>
                    <p className="text-near-black font-semibold text-sm">
                        {seller?.full_name || 'Vendeur'}
                    </p>

                    <p className="text-muted text-xs">
                        {seller?.quartier || ''}
                    </p>
                </div>
            </div>

            {/* WhatsApp button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border">

                <a
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-whatsapp text-white w-full rounded-lg py-3 font-semibold"
                >
                    <span>📱</span>

                    <span>
                        {t('listing.contact_seller')} via WhatsApp
                    </span>
                </a>

            </div>

        </div>
    )
}