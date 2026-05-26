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
    const [favourites, setFavourites] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('listings')
    const [isAdmin, setIsAdmin] = useState(false)

    async function fetchProfile() {
        const { data } = await supabase
            .from('users')
            .select('full_name, phone, quartier, avatar_url, is_admin')
            .eq('id', user.id)
            .single()
        setProfile(data)
        setIsAdmin(data?.is_admin || false)
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

    async function fetchFavourites() {
        const { data } = await supabase
            .from('favourites')
            .select(`
                listing_id,
                listings (
                    id, title, price, quartier, category_slug,
                    created_at, is_sold,
                    listing_images (url, position)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setFavourites(data?.map(f => f.listings).filter(Boolean) || [])
    }

    useEffect(() => {
        fetchProfile()
        fetchMyListings()
        fetchFavourites()
    }, [])

    async function handleAvatarUpload(e) {
        const file = e.target.files[0]
        if (!file) return
        const fileName = `${user.id}/avatar.jpg`
        await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true, contentType: 'image/jpeg' })
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
        await supabase
            .from('users')
            .update({ avatar_url: data.publicUrl })
            .eq('id', user.id)
        setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }))
    }

    async function handleRemoveAvatar() {
        if (!window.confirm('Supprimer votre photo de profil ?')) return

        // delete from storage
        await supabase.storage
            .from('avatars')
            .remove([`${user.id}/avatar.jpg`])

        // set avatar_url to null in users table
        await supabase
            .from('users')
            .update({ avatar_url: null })
            .eq('id', user.id)

        setProfile(prev => ({ ...prev, avatar_url: null }))
    }

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
                    <h1 className="text-white font-bold text-lg">Mon Profil</h1>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="text-white text-sm opacity-80 border border-white border-opacity-30 px-2 py-1 rounded-lg"
                        >
                            ⚙️ Admin
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-white text-sm opacity-80"
                    >
                        {t('auth.logout')}
                    </button>
                </div>
            </div>

            {/* Profile card */}
            <div className="bg-white mx-4 mt-4 rounded-2xl p-4 flex items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-badge-bg flex items-center justify-center flex-shrink-0">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-primary font-bold text-2xl">
                                {profile?.full_name?.[0]?.toUpperCase() || '?'}
                            </span>
                        )}
                    </div>

                    {/* change photo button */}
                    <label className="absolute bottom-0 right-0 bg-primary rounded-full w-5 h-5 flex items-center justify-center cursor-pointer">
                        <span className="text-white text-xs">+</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* remove photo button — only show if has avatar */}
                {profile?.avatar_url && (
                    <button
                        onClick={handleRemoveAvatar}
                        className="text-red-400 text-xs mt-1"
                    >
                        Supprimer la photo
                    </button>
                )}
                <div>
                    <p className="text-near-black font-bold text-base">
                        {profile?.full_name || 'Vendeur'}
                    </p>
                    <p className="text-muted text-sm">{profile?.phone}</p>
                    <p className="text-muted text-sm">{profile?.quartier}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="mx-4 mt-3 bg-white rounded-2xl p-4 flex justify-around">
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

            {/* Tabs */}
            <div className="flex border-b border-border mx-4 mt-4 bg-white rounded-t-2xl">
                <button
                    onClick={() => setActiveTab('listings')}
                    className={`flex-1 py-3 text-sm font-semibold ${
                        activeTab === 'listings'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted'
                    }`}
                >
                    {t('profile.my_listings')} ({listings.length})
                </button>
                <button
                    onClick={() => setActiveTab('favourites')}
                    className={`flex-1 py-3 text-sm font-semibold ${
                        activeTab === 'favourites'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted'
                    }`}
                >
                    ❤️ {t('profile.favorites')} ({favourites.length})
                </button>
            </div>

            {/* Content */}
            <div className="px-4 mt-4">

                {activeTab === 'listings' && (
                    <>
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
                                            className="flex-1 text-xs py-1.5 rounded-lg border border-primary text-primary font-medium"
                                        >
                                            {listing.is_sold ? 'Remettre en vente' : t('listing.mark_sold')}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(listing.id)}
                                            className="flex-1 text-xs py-1.5 rounded-lg border border-red-400 text-red-400 font-medium"
                                        >
                                            {t('listing.delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'favourites' && (
                    <>
                        {favourites.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted">Aucun favori pour le moment</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold"
                                >
                                    Parcourir les annonces
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            {favourites.map(listing => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}