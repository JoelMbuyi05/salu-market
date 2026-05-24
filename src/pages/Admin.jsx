import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/authContext'

export default function Admin() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTab, setActiveTab] = useState('flagged')
    const [flaggedListings, setFlaggedListings] = useState([])
    const [reports, setReports] = useState([])
    const [allListings, setAllListings] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)

    async function checkAdmin() {
        const { data } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (!data?.is_admin) {
            navigate('/')
            return
        }
        setIsAdmin(true)
        fetchData()
    }

    async function fetchData() {
        // fetch flagged listings
        const { data: flagged } = await supabase
            .from('listings')
            .select(`
                id, title, price, quartier, category_slug,
                created_at, is_flagged, view_count,
                listing_images (url, position),
                users (full_name, phone)
            `)
            .eq('is_flagged', true)
            .order('created_at', { ascending: false })

        setFlaggedListings(flagged || [])

        // fetch all reports
        const { data: allReports } = await supabase
            .from('reports')
            .select(`
                id, reason, created_at,
                listings (id, title),
                users (full_name)
            `)
            .order('created_at', { ascending: false })

        setReports(allReports || [])

        // fetch all listings for overview
        const { data: listings } = await supabase
            .from('listings')
            .select('id, title, price, is_sold, is_flagged, view_count, created_at')
            .order('created_at', { ascending: false })
            .limit(50)

        setAllListings(listings || [])

        // stats
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })

        const { count: totalListings } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })

        const { count: soldListings } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('is_sold', true)

        const { count: flaggedCount } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('is_flagged', true)

        setStats({
            totalUsers,
            totalListings,
            soldListings,
            flaggedCount
        })

        setLoading(false)
    }

    async function handleDeleteListing(listingId) {
        if (!window.confirm('Supprimer cette annonce définitivement ?')) return
        await supabase.from('listings').delete().eq('id', listingId)
        setFlaggedListings(prev => prev.filter(l => l.id !== listingId))
        setAllListings(prev => prev.filter(l => l.id !== listingId))
    }

    async function handleUnflag(listingId) {
        await supabase
            .from('listings')
            .update({ is_flagged: false })
            .eq('id', listingId)
        setFlaggedListings(prev => prev.filter(l => l.id !== listingId))
    }

    useEffect(() => {
        checkAdmin()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!isAdmin) return null

    return (
        <div className="min-h-screen bg-light-bg pb-10">

            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white text-xl"
                    >
                        ←
                    </button>
                    <h1 className="text-white font-bold text-lg">Admin</h1>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 p-4">
                <div className="bg-white rounded-2xl p-4 text-center">
                    <p className="text-primary font-bold text-2xl">{stats.totalUsers || 0}</p>
                    <p className="text-muted text-xs mt-1">Utilisateurs</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center">
                    <p className="text-primary font-bold text-2xl">{stats.totalListings || 0}</p>
                    <p className="text-muted text-xs mt-1">Annonces totales</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center">
                    <p className="text-primary font-bold text-2xl">{stats.soldListings || 0}</p>
                    <p className="text-muted text-xs mt-1">Vendus</p>
                </div>
                <div className="bg-white rounded-2xl p-4 text-center">
                    <p className="text-red-500 font-bold text-2xl">{stats.flaggedCount || 0}</p>
                    <p className="text-muted text-xs mt-1">Signalés</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mx-4 bg-white rounded-t-2xl">
                <button
                    onClick={() => setActiveTab('flagged')}
                    className={`flex-1 py-3 text-sm font-semibold ${
                        activeTab === 'flagged'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted'
                    }`}
                >
                    🚩 Signalés ({flaggedListings.length})
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex-1 py-3 text-sm font-semibold ${
                        activeTab === 'reports'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted'
                    }`}
                >
                    📋 Rapports ({reports.length})
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-3 text-sm font-semibold ${
                        activeTab === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted'
                    }`}
                >
                    📦 Tout
                </button>
            </div>

            <div className="px-4 mt-3 flex flex-col gap-3">

                {/* Flagged listings */}
                {activeTab === 'flagged' && (
                    <>
                        {flaggedListings.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted">Aucune annonce signalée</p>
                            </div>
                        )}
                        {flaggedListings.map(listing => (
                            <div key={listing.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <img
                                        src={listing.listing_images?.[0]?.url || 'https://placehold.co/80x80/f5f5f5/888?text=?'}
                                        alt={listing.title}
                                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <p className="text-near-black font-semibold text-sm line-clamp-1">
                                            {listing.title}
                                        </p>
                                        <p className="text-primary text-sm font-bold">
                                            {listing.price?.toLocaleString()} FC
                                        </p>
                                        <p className="text-muted text-xs">
                                            {listing.users?.full_name} · {listing.quartier}
                                        </p>
                                        <p className="text-muted text-xs">
                                            👁 {listing.view_count || 0} vues
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUnflag(listing.id)}
                                        className="flex-1 py-2 rounded-xl border border-primary text-primary text-xs font-semibold"
                                    >
                                        ✓ Approuver
                                    </button>
                                    <button
                                        onClick={() => handleDeleteListing(listing.id)}
                                        className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold"
                                    >
                                        🗑 Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Reports */}
                {activeTab === 'reports' && (
                    <>
                        {reports.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted">Aucun signalement</p>
                            </div>
                        )}
                        {reports.map(report => (
                            <div key={report.id} className="bg-white rounded-2xl p-4 flex flex-col gap-1">
                                <p className="text-near-black font-semibold text-sm">
                                    {report.listings?.title || 'Annonce supprimée'}
                                </p>
                                <p className="text-red-500 text-xs font-medium">
                                    🚩 {report.reason}
                                </p>
                                <p className="text-muted text-xs">
                                    Signalé par {report.users?.full_name} · {new Date(report.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        ))}
                    </>
                )}

                {/* All listings */}
                {activeTab === 'all' && (
                    <>
                        {allListings.map(listing => (
                            <div key={listing.id} className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-near-black text-sm font-semibold line-clamp-1">
                                        {listing.title}
                                    </p>
                                    <p className="text-muted text-xs">
                                        {listing.price?.toLocaleString()} FC · 👁 {listing.view_count || 0}
                                        {listing.is_sold && ' · ✅ Vendu'}
                                        {listing.is_flagged && ' · 🚩 Signalé'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteListing(listing.id)}
                                    className="text-red-400 text-sm ml-3"
                                >
                                    🗑
                                </button>
                            </div>
                        ))}
                    </>
                )}

            </div>
        </div>
    )
}