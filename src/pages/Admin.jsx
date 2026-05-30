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
    const [allUsers, setAllUsers] = useState([])
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
        // flagged listings
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

        // reports
        const { data: allReports } = await supabase
            .from('reports')
            .select(`
                id, reason, created_at,
                listings (id, title),
                users (full_name)
            `)
            .order('created_at', { ascending: false })
        setReports(allReports || [])

        // all listings
        const { data: listings } = await supabase
            .from('listings')
            .select('id, title, price, is_sold, is_flagged, view_count, created_at')
            .order('created_at', { ascending: false })
            .limit(50)
        setAllListings(listings || [])

        // all users
        const { data: users } = await supabase
            .from('users')
            .select('id, full_name, phone, quartier, created_at, is_admin')
            .order('created_at', { ascending: false })
        setAllUsers(users || [])

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

        setStats({ totalUsers, totalListings, soldListings, flaggedCount })
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

    async function handleBanUser(userId) {
        if (!window.confirm('Bannir cet utilisateur ? Il ne pourra plus se connecter.')) return

        // ban in auth.users via SQL function
        const { error } = await supabase.rpc('ban_user', { target_user_id: userId })

        if (error) {
            // fallback — update banned_until directly
            await supabase
                .from('users')
                .update({ is_banned: true })
                .eq('id', userId)
        }

        setAllUsers(prev =>
            prev.map(u => u.id === userId ? { ...u, is_banned: true } : u)
        )
        alert('Utilisateur banni avec succès.')
    }

    async function handleUnbanUser(userId) {
        await supabase.rpc('unban_user', { target_user_id: userId })
        setAllUsers(prev =>
            prev.map(u => u.id === userId ? { ...u, is_banned: false } : u)
        )
        alert('Utilisateur débanni.')
    }

    async function handleDeleteUser(userId) {
        if (!window.confirm('Supprimer cet utilisateur complètement ? Cette action est irréversible.')) return

        // delete their listings first
        await supabase.from('listings').delete().eq('user_id', userId)

        // delete their profile
        await supabase.from('users').delete().eq('id', userId)

        setAllUsers(prev => prev.filter(u => u.id !== userId))
        alert('Utilisateur supprimé. Il peut se réinscrire avec le même email.')
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
                    <button onClick={() => navigate('/')} className="text-white text-xl">←</button>
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
            <div className="flex border-b border-border mx-4 bg-white rounded-t-2xl overflow-x-auto">
                {[
                    { key: 'flagged', label: `🚩 Signalés (${flaggedListings.length})` },
                    { key: 'reports', label: `📋 Rapports (${reports.length})` },
                    { key: 'all', label: `📦 Annonces` },
                    { key: 'users', label: `👥 Utilisateurs (${allUsers.length})` },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-shrink-0 px-3 py-3 text-xs font-semibold ${
                            activeTab === tab.key
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
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

                {/* Users tab */}
                {activeTab === 'users' && (
                    <>
                        {allUsers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted">Aucun utilisateur</p>
                            </div>
                        )}
                        {allUsers.map(u => (
                            <div key={u.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-badge-bg flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary font-bold">
                                            {u.full_name?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-near-black font-semibold text-sm">
                                                {u.full_name || 'Sans nom'}
                                            </p>
                                            {u.is_admin && (
                                                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                                    Admin
                                                </span>
                                            )}
                                            {u.is_banned && (
                                                <span className="bg-red-100 text-red-500 text-xs px-2 py-0.5 rounded-full">
                                                    Banni
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted text-xs">{u.phone}</p>
                                        <p className="text-muted text-xs">
                                            Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>

                                {/* action buttons — don't show for yourself */}
                                {u.id !== user.id && !u.is_admin && (
                                    <div className="flex gap-2">
                                        {u.is_banned ? (
                                            <button
                                                onClick={() => handleUnbanUser(u.id)}
                                                className="flex-1 py-2 rounded-xl border border-primary text-primary text-xs font-semibold"
                                            >
                                                ✓ Débannir
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBanUser(u.id)}
                                                className="flex-1 py-2 rounded-xl border border-orange-400 text-orange-400 text-xs font-semibold"
                                            >
                                                🚫 Bannir
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold"
                                        >
                                            🗑 Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

            </div>
        </div>
    )
}