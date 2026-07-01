import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'
import BottomNav from '../components/BottomNav'
import { useDebounce } from '../hooks/useDebounce'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authContext'
import { trackSearch } from '../lib/analytics'

const PAGE_SIZE = 20

async function fetchListings(pageNumber, setListings, setHasMore, setLoading, category, search) {
    setLoading(true)
    const from = pageNumber * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
        .from('listings')
        .select(`
            id, title, price, quartier, category_slug, created_at,
            listing_images (url, position)
        `)
        .eq('is_sold', false)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (category && category !== 'all') {
        query = query.eq('category_slug', category)
    }

    if (search.trim()) {
        const term = search.trim().toLowerCase()
        query = query.or(`title.ilike.%${term}%,quartier.ilike.%${term}%`)
    }

    const { data, error } = await query
    if (error) { console.error(error); setLoading(false); return }
    if (data.length < PAGE_SIZE) setHasMore(false)
    setListings(prev => pageNumber === 0 ? data : [...prev, ...data])
    setLoading(false)
}

const categoryIcons = [
    { slug: 'phones', label: 'Téléphones'},
    { slug: 'clothes', label: 'Habits'},
    { slug: 'electronics', label: 'Electronique'},
    { slug: 'food', label: 'Aliment'},
    { slug: 'furniture', label: 'Meubles'},
    { slug: 'vehicles', label: 'Véhicules'},
    { slug: 'services', label: 'Services'},
    { slug: 'other', label: 'Autres'},
]

export default function Home() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()

    const [category, setCategory] = useState('all')
    const [listings, setListings] = useState([])
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [search, setSearch] = useState('')
    const [scrolled, setScrolled] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [hasNewListings, setHasNewListings] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [newListings, setNewListings] = useState([])

    const debouncedSearch = useDebounce(search, 500)
    const bottomRef = useRef(null)

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const cat = params.get('category')
        if (cat) setCategory(cat)
    }, [location.search])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        checkNewListings()
    }, [])

    async function checkNewListings() {
        const lastVisit = localStorage.getItem('last_visit')
        const now = new Date().toISOString()

        if (lastVisit) {
            const { data } = await supabase
                .from('listings')
                .select('id, title, price, quartier, created_at, listing_images(url)')
                .eq('is_sold', false)
                .eq('is_flagged', false)
                .gt('created_at', lastVisit)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data && data.length > 0) {
                setHasNewListings(true)
                setNewListings(data)
            }
        }

        localStorage.setItem('last_visit', now)
    }

    function handleBellClick() {
        setShowNotifications(!showNotifications)
        setHasNewListings(false)
    }

    useEffect(() => {
        fetchListings(0, setListings, setHasMore, setLoading, category, debouncedSearch)
    }, [])

    useEffect(() => {
        if (page === 0) return
        fetchListings(page, setListings, setHasMore, setLoading, category, debouncedSearch)
    }, [page])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch.trim()) trackSearch(debouncedSearch)
            setPage(0)
            setHasMore(true)
            setListings([])
            fetchListings(0, setListings, setHasMore, setLoading, category, debouncedSearch)
        }, 0)
        return () => clearTimeout(timer)
    }, [debouncedSearch])

    function handleCategorySelect(slug) {
        setCategory(slug)
        setPage(0)
        setHasMore(true)
        setListings([])
        fetchListings(0, setListings, setHasMore, setLoading, slug, debouncedSearch)
    }

    useEffect(() => {
        if (!hasMore || loading) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setPage(prev => prev + 1)
            },
            { threshold: 0.1 }
        )
        if (bottomRef.current) observer.observe(bottomRef.current)
        return () => observer.disconnect()
    }, [hasMore, loading])

    return (
        <div className="min-h-screen bg-light-bg pb-24">

            {/* Header */}
            <div
                className={`sticky top-0 z-20 transition-all duration-300 ${
                    scrolled ? 'bg-primary/95 backdrop-blur-xl shadow-lg' : 'bg-primary'
                }`}
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="px-4 py-3">
                    {showSearch ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setShowSearch(false); setSearch('') }}
                                className="text-white text-xl"
                            >
                                ←
                            </button>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('search.placeholder')}
                                className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-near-black outline-none"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                {/* logo + title */}
                                <div className="flex items-center gap-2">
                                    <img src="/icon-512.png" alt="Salu" className="h-7 w-7 rounded-lg" />
                                    <span className="text-white font-bold text-lg">Salu Market</span>
                                </div>

                                {/* notification bell */}
                                <button 
                                    onClick={handleBellClick}
                                    className="text-white p-1 relative"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {hasNewListings && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>
                            </div>

                            {/* search bar */}
                            <button
                                onClick={() => setShowSearch(true)}
                                className="w-full bg-white rounded-full px-4 py-2.5 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-muted text-sm">{t('search.placeholder')}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Notifications dropdown */}
            {showNotifications && (
                <div className="fixed top-20 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-border z-30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <p className="text-near-black font-bold text-sm">Nouvelles annonces</p>
                        <button
                            onClick={() => setShowNotifications(false)}
                            className="text-muted text-lg"
                        >
                            ✕
                        </button>
                    </div>

                    {newListings.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-muted text-sm">Aucune nouvelle annonce</p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {newListings.map(listing => (
                                <button
                                    key={listing.id}
                                    onClick={() => {
                                        navigate(`/listing/${listing.id}`)
                                        setShowNotifications(false)
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-light-bg w-full text-left border-b border-border last:border-0"
                                >
                                    <img
                                        src={listing.listing_images?.[0]?.url || 'https://placehold.co/48x48/f5f5f5/888?text=S'}
                                        alt={listing.title}
                                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-near-black text-sm font-semibold line-clamp-1">
                                            {listing.title}
                                        </p>
                                        <p className="text-primary text-sm font-bold">
                                            {listing.price?.toLocaleString()} FC
                                        </p>
                                        <p className="text-muted text-xs">{listing.quartier}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setShowNotifications(false)
                            setCategory('all')
                            setPage(0)
                            setHasMore(true)
                            setListings([])
                            fetchListings(0, setListings, setHasMore, setLoading, 'all', '')
                        }}
                        className="w-full py-3 text-primary text-sm font-semibold border-t border-border"
                    >
                        Voir toutes les annonces
                    </button>
                </div>
            )}

            {/* Hero Banner */}
            {!search && category === 'all' && (
                <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-primary relative h-36">
                    <div className="absolute inset-0 p-5 flex flex-col justify-center">
                        <p className="text-white font-bold text-lg leading-tight">
                            Tout ce dont tu as besoin,{' '}
                            <span className="text-accent">tout près</span>{' '}
                            de chez toi.
                        </p>
                        <button
                            onClick={() => navigate('/post')}
                            className="mt-3 bg-white text-primary text-xs font-bold px-4 py-2 rounded-full w-fit"
                        >
                            Publier une annonce →
                        </button>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/10 rounded-full translate-y-6" />
                </div>
            )}

            {/* Category icons — SVG no emojis */}
            {!search && (
                <div className="mt-4 px-4">
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
                        {categoryIcons.map(cat => {
                            const isActive = category === cat.slug
                            return (
                                <button
                                    key={cat.slug}
                                    onClick={() => handleCategorySelect(cat.slug)}
                                    className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition-all whitespace-nowrap ${
                                        isActive 
                                        ? 'bg-primary text-white border-primary shadow-md' 
                                        : 'bg-white text-near-black border-gray-300 hover:border-primary hvover:text-primary'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Listings */}
            <div className="mt-4 px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-near-black font-bold text-base">
                        {search ? `Résultats pour "${search}"` :
                         category === 'all' ? 'Annonces récentes' :
                         categoryIcons.find(c => c.slug === category)?.label || category}
                    </h2>
                </div>

                {loading && listings.length === 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {listings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            </div>

            {loading && listings.length > 0 && (
                <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {hasMore && <div ref={bottomRef} className="h-10" />}

            {!hasMore && listings.length > 0 && (
                <p className="text-center text-muted text-sm py-6">
                    Plus d'annonces à afficher
                </p>
            )}

            {!loading && listings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <p className="text-near-black font-semibold">Aucune annonce pour le moment</p>
                    <p className="text-muted text-sm">Soyez le premier à publier !</p>
                </div>
            )}

            <BottomNav />
        </div>
    )
}