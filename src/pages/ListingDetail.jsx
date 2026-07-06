import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authContext'
import { trackListingView, trackWhatsAppContact } from '../lib/analytics'
import BottomNav from '../components/BottomNav'

export default function ListingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { user } = useAuth()

    const [listing, setListing] = useState(null)
    const [seller, setSeller] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentImage, setCurrentImage] = useState(0)
    const [isSaved, setIsSaved] = useState(false)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [reportLoading, setReportLoading] = useState(false)
    const [reportDone, setReportDone] = useState(false)

    async function fetchListing() {
        const { data, error } = await supabase
            .from('listings')
            .select(`*, listing_images (url, position)`)
            .eq('id', id)
            .single()

        if (error || !data) {
            navigate('/')
            return
        }

        data.listing_images.sort((a, b) => a.position - b.position)
        setListing(data)
        trackListingView(data.id, data.title)

        const { data: sellerData } = await supabase
            .from('users')
            .select('full_name, phone, quartier, avatar_url')
            .eq('id', data.user_id)
            .single()

        setSeller(sellerData)

        await supabase
            .from('listings')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', id)

        setLoading(false)
    }

    async function checkIfSaved() {
        if (!user) return
        const { data } = await supabase
            .from('favourites')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .single()
        setIsSaved(!!data)
    }

    async function toggleSave() {
        if (!user) {
            navigate('/login')
            return
        }
        if (isSaved) {
            await supabase
                .from('favourites')
                .delete()
                .eq('user_id', user.id)
                .eq('listing_id', id)
            setIsSaved(false)
        } else {
            await supabase
                .from('favourites')
                .insert({ user_id: user.id, listing_id: id })
            setIsSaved(true)
        }
    }

    async function handleShare() {
        const url = window.location.href
        const text = `${listing.title} — ${listing.price.toLocaleString()} FC\nVoir sur Salu Market : ${url}`

        if (navigator.share) {
            // native share sheet on mobile
            await navigator.share({
                title: listing.title,
                text: `${listing.title} — ${listing.price.toLocaleString()} FC`,
                url: url
            })
        } else {
            // fallback — copy to clipboard
            await navigator.clipboard.writeText(text)
            alert('Lien copié !')
        }
    }
    async function handleReport() {
        if (!user) {
            navigate('/login')
            return
        }
        if (!reportReason.trim()) return
        setReportLoading(true)

        const { error } = await supabase
            .from('reports')
            .insert({
                user_id: user.id,
                listing_id: id,
                reason: reportReason
            })

        if (!error) {
            // flag the listing
            await supabase
                .from('listings')
                .update({ is_flagged: true })
                .eq('id', id)
            setReportDone(true)
        }

        setReportLoading(false)
    }

    useEffect(() => {
        fetchListing()
        checkIfSaved()
    }, [id])

    function buildWhatsAppLink() {
        if (!seller?.phone) return '#'
        // remove everything except digits
        const phone = seller.phone.replace(/\D/g, '')
        // if starts with 0, replace with 243 (DRC country code)
        const formattedPhone = phone.startsWith('0') 
            ? '243' + phone.slice(1) 
            : phone
        const message = encodeURIComponent(
            `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur Salu. Est-ce encore disponible ?`
        )
        return `https://wa.me/${formattedPhone}?text=${message}`
    }

    function handleTouchStart(e) {
        setTouchStart(e.targetTouches[0].clientX)
    }

    function handleTouchMove(e) {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    function handleTouchEnd() {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        if (distance > 50 && currentImage < images.length - 1) {
            setCurrentImage(prev => prev + 1)
        }
        if (distance < -50 && currentImage > 0) {
            setCurrentImage(prev => prev - 1)
        }
        setTouchStart(null)
        setTouchEnd(null)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!listing) return null

    const images = listing.listing_images
    const hasImages = images.length > 0

    const reportReasons = [
        'Arnaque / Faux article',
        'Mauvaise catégorie',
        'Article déjà vendu',
        'Contenu inapproprié',
        'Prix abusif',
        'Autre'
    ]

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
                <h1 className="text-white font-semibold text-base line-clamp-1 flex-1">
                    {listing.title}
                </h1>
                {/* share + report with space */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleShare}
                        className="text-white opacity-80 p-1"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            if (!user) { navigate('/login'); return }
                            setShowReportModal(true)
                        }}
                        className="text-white opacity-60 p-1"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                    </button>
                </div>
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
                        src={hasImages ? images[currentImage].url : 'https://placehold.co/400x300/f5f5f5/888787?text=Salu'}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    {images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                            {currentImage + 1}/{images.length}
                        </div>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="flex justify-center gap-2 py-2 bg-white">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImage(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    i === currentImage ? 'bg-primary' : 'bg-border'
                                }`}
                            />
                        ))}
                    </div>
                )}
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
                    📍 {listing.quartier} · {listing.category_slug}
                </p>
            </div>

            {/* Description */}
            {listing.description && (
                <div className="bg-white mt-2 px-4 py-4">
                    <h3 className="text-near-black font-semibold mb-2">Description</h3>
                    <p className="text-near-black text-sm leading-relaxed">
                        {listing.description}
                    </p>
                </div>
            )}

            {/* Seller card */}
            <div className="bg-white mt-2 px-4 py-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-badge-bg flex items-center justify-center flex-shrink-0">
                    {seller?.avatar_url ? (
                        <img
                            src={seller.avatar_url}
                            alt={seller.full_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-primary font-bold text-lg">
                            {seller?.full_name?.[0]?.toUpperCase() || '?'}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-near-black font-semibold text-sm">
                        {seller?.full_name || 'Vendeur'}
                    </p>
                </div>
            </div>

            {/* spacer for fixed buttons */}
            <div className="h-44" />

            {/* Bottom buttons */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-border flex gap-3">
                {user?.id !== listing.user_id ? (
                    <>
                        <button
                            onClick={toggleSave}
                            className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 flex-shrink-0 ${
                                isSaved
                                    ? 'bg-badge-bg border-primary'
                                    : 'bg-white border-border'
                            }`}
                        >
                            {isSaved ? '❤️' : '🤍'}
                        </button>

                        <a
                            href={buildWhatsAppLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackWhatsAppContact(listing.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-whatsapp text-white rounded-xl py-3 font-semibold"
                        >
                            <span>{t('listing.contact_seller')} via WhatsApp</span>
                        </a>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 bg-light-bg text-muted rounded-xl py-3 font-semibold">
                        <span>Votre annonce</span>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-2xl p-6 flex flex-col gap-4">
                        {reportDone ? (
                            <div className="text-center py-6">
                                <p className="text-2xl mb-2">✅</p>
                                <p className="text-near-black font-semibold">Signalement envoyé</p>
                                <p className="text-muted text-sm mt-1">Merci, nous allons examiner cette annonce.</p>
                                <button
                                    onClick={() => {
                                        setShowReportModal(false)
                                        setReportDone(false)
                                        setReportReason('')
                                    }}
                                    className="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-near-black font-bold text-lg">
                                        {t('listing.report')}
                                    </h3>
                                    <button
                                        onClick={() => setShowReportModal(false)}
                                        className="text-muted text-2xl leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                <p className="text-muted text-sm">
                                    Pourquoi signalez-vous cette annonce ?
                                </p>

                                <div className="flex flex-col gap-2">
                                    {reportReasons.map(reason => (
                                        <button
                                            key={reason}
                                            onClick={() => setReportReason(reason)}
                                            className={`text-left px-4 py-3 rounded-xl border text-sm ${
                                                reportReason === reason
                                                    ? 'border-primary bg-badge-bg text-primary font-semibold'
                                                    : 'border-border text-near-black'
                                            }`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleReport}
                                    disabled={!reportReason || reportLoading}
                                    className="bg-red-500 text-white w-full rounded-xl py-3 font-semibold disabled:opacity-40"
                                >
                                    {reportLoading ? 'Envoi...' : 'Envoyer le signalement'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    )
}