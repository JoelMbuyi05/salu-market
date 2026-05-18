import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/authContext'
import ListingCard from '../components/ListingCard'

export default function Profile() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [profile, setProfile] = useState(null)
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)

    async function fetchProfile() {
        const { data } = await supabase
            .from('users')
            .select('full_name, phone, quartier')
            .eq('id', user.id)
            .single()
        setProfile(data)
    }

    async function fetchMyListings() {
        const { data } = await supabase
            .from('listings')
            .select(`
                id, title, price, quartier, category_slug,
                created_at, is_sold, view_count,
                listing_images (url, position)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        setListings(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchProfile()
        fetchMyListings()
    }, [])

    async function handleMarkSold(listingId, currentStatus) {
        await supabase
            .from('listings')
            .update({ is_sold: !currentStatus })
            .eq('id', listingId)

        setListings(prev =>
            prev.map(l =>
                l.id === listingId ? { ...l, is_sold: !currentStatus } : l
            )
        )
    }

    async function handleDelete(listingId) {
        if (!window.confirm('Supprimer cette annonce ?')) return

        await supabase
            .from('listings')
            .delete()
            .eq('id', listingId)

        setListings(prev => prev.filter(l => l.id !== listingId))
    }

    async function handleLogout() {
        navigate('/')
        await supabase.auth.signOut()
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
            <div className="bg-primary px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white text-xl leading-none"
                    >
                        ←
                    </button>
                    <h1 className="text-white font-bold text-xl">{t('profile.my_listings')}</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-white text-sm opacity-80"
                >
                    {t('auth.logout')}
                </button>
            </div>

            {/* Profile card */}
            <div className="bg-white mx-4 mt-4 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-badge-bg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-xl">
                        {profile?.full_name?.[0]?.toUpperCase() || '?'}
                    </span>
                </div>
                <div>
                    <p className="text-near-black font-bold">
                        {profile?.full_name || 'Vendeur'}
                    </p>
                    <p className="text-muted text-sm">{profile?.phone}</p>
                    <p className="text-muted text-sm">{profile?.quartier}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="mx-4 mt-3 bg-white rounded-xl p-4 flex justify-around">
                <div className="text-center">
                    <p className="text-primary font-bold text-xl">{listings.length}</p>
                    <p className="text-muted text-xs">Annonces</p>
                </div>
                <div className="text-center">
                    <p className="text-primary font-bold text-xl">
                        {listings.filter(l => l.is_sold).length}
                    </p>
                    <p className="text-muted text-xs">Vendus</p>
                </div>
                <div className="text-center">
                    <p className="text-primary font-bold text-xl">
                        {listings.reduce((sum, l) => sum + (l.view_count || 0), 0)}
                    </p>
                    <p className="text-muted text-xs">Vues totales</p>
                </div>
            </div>

            {/* Listings */}
            <div className="px-4 mt-4">
                <h2 className="text-near-black font-semibold mb-3">Mes annonces</h2>

                {listings.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted">Vous n'avez pas encore d'annonces</p>
                        <button
                            onClick={() => navigate('/post')}
                            className="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold"
                        >
                            + {t('listing.post_listing')}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {listings.map(listing => (
                        <div key={listing.id} className="flex flex-col gap-2">
                            <ListingCard listing={listing} />

                            {listing.is_sold && (
                                <span className="bg-badge-bg text-badge-text text-xs font-semibold px-2 py-1 rounded-full text-center">
                                    {t('listing.sold')}
                                </span>
                            )}

                            <p className="text-muted text-xs text-center">
                                👁 {listing.view_count || 0} vues
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleMarkSold(listing.id, listing.is_sold)}
                                    className="flex-1 text-xs py-1 rounded-lg border border-primary text-primary font-medium"
                                >
                                    {listing.is_sold ? 'Remettre en vente' : t('listing.mark_sold')}
                                </button>
                                <button
                                    onClick={() => handleDelete(listing.id)}
                                    className="flex-1 text-xs py-1 rounded-lg border border-red-400 text-red-400 font-medium"
                                >
                                    {t('listing.delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}