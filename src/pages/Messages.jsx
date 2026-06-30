import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/authContext'
import BottomNav from '../components/BottomNav'

export default function Messages() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [contacted, setContacted] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContacted()
    }, [])

    async function fetchContacted() {
        // fetch listings user has saved as proxy for "contacted"
        const { data } = await supabase
            .from('favourites')
            .select(`
                listing_id,
                created_at,
                listings (
                    id, title, price, quartier,
                    listing_images (url, position),
                    users (full_name, phone, avatar_url)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        setContacted(data?.map(f => f.listings).filter(Boolean) || [])
        setLoading(false)
    }

    function buildWhatsAppLink(phone, title) {
        if (!phone) return '#'
        const cleaned = phone.replace(/\D/g, '')
        const formatted = cleaned.startsWith('0') ? '243' + cleaned.slice(1) : cleaned
        const message = encodeURIComponent(
            `Bonjour, je suis intéressé(e) par votre annonce "${title}" sur Salu Market. Est-ce encore disponible ?`
        )
        return `https://wa.me/${formatted}?text=${message}`
    }

    return (
        <div className="min-h-screen bg-light-bg pb-24">

            {/* Header */}
            <div className="bg-primary px-4 py-4 sticky top-0 z-20">
                <h1 className="text-white font-bold text-xl text-center">Messages</h1>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {!loading && contacted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
                    <div className="w-16 h-16 bg-badge-bg rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2z" />
                        </svg>
                    </div>
                    <p className="text-near-black font-semibold text-center">
                        Aucune conversation
                    </p>
                    <p className="text-muted text-sm text-center">
                        Les annonces que vous contactez via WhatsApp apparaîtront ici
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold mt-2"
                    >
                        Parcourir les annonces
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-0">
                {contacted.map(listing => (
                    <div
                        key={listing.id}
                        className="bg-white px-4 py-3 flex items-center gap-3 border-b border-border"
                    >
                        {/* listing image */}
                        <img
                            src={listing.listing_images?.[0]?.url || 'https://placehold.co/60x60/f5f5f5/888?text=?'}
                            alt={listing.title}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />

                        {/* info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-near-black font-semibold text-sm line-clamp-1">
                                {listing.title}
                            </p>
                            <p className="text-primary text-sm font-bold">
                                {listing.price?.toLocaleString()} FC
                            </p>
                            <p className="text-muted text-xs">
                                Vendeur: {listing.users?.full_name || 'Vendeur'}
                            </p>
                        </div>

                        {/* whatsapp button */}
                        <a
                            href={buildWhatsAppLink(listing.users?.phone, listing.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-whatsapp text-white text-xs font-semibold px-3 py-2 rounded-xl flex-shrink-0"
                        >
                            WhatsApp
                        </a>
                    </div>
                ))}
            </div>

            <BottomNav />
        </div>
    )
}