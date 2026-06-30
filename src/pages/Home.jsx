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

    if (error) {
        console.error(error)
        setLoading(false)
        return
    }

    if (data.length < PAGE_SIZE) setHasMore(false)
    setListings(prev => pageNumber === 0 ? data : [...prev, ...data])
    setLoading(false)
}

const categoryIcons = [
    { slug: 'all', label: 'Tout', emoji: '🛍️' },
    { slug: 'food', label: 'Aliment.', emoji: '🍎' },
    { slug: 'furniture', label: 'Maison', emoji: '🛋️' },
    { slug: 'clothes', label: 'Mode', emoji: '👗' },
    { slug: 'electronics', label: 'Electron.', emoji: '💻' },
    { slug: 'phones', label: 'Téléphones', emoji: '📱' },
    { slug: 'vehicles', label: 'Véhicules', emoji: '🚗' },
    { slug: 'services', label: 'Services', emoji: '🔧' },
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

    const debouncedSearch = useDebounce(search, 500)
    const bottomRef = useRef(null)

    // read category from URL params
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
                        // search mode
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
                        // normal mode
                        <>
                            <div className="flex items-center justify-between mb-1">
                                {/* hamburger */}
                                <button className="text-white p-1">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                {/* logo + title center */}
                                <div className="flex items-center gap-2">
                                    <img src="/icon-512.png" alt="Salu" className="h-7 w-7 rounded-lg" />
                                    <span className="text-white font-bold text-lg">Salu Market</span>
                                </div>

                                {/* notification bell */}
                                <button className="text-white p-1">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>
                            </div>

                            {/* location */}
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                <span className="text-accent text-xs font-medium">Mbuji-Mayi</span>
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

            {/* Hero Banner */}
            {!search && category === 'all' && (
                <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-primary relative h-36">
                    <div className="absolute inset-0 p-4 flex flex-col justify-center">
                        <p className="text-white font-bold text-lg leading-tight">
                            Tout ce dont tu as besoin,{' '}
                            <span className="text-accent">tout près</span>{' '}
                            de chez toi.
                        </p>
                        <p className="text-white/70 text-xs mt-1">
                            Mbuji-Mayi · RDC
                        </p>
                    </div>
                    {/* decorative circle */}
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/10 rounded-full translate-y-6" />
                </div>
            )}

            {/* Category icons */}
            {!search && (
                <div className="mt-4 px-4">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                        {categoryIcons.map(cat => (
                            <button
                                key={cat.slug}
                                onClick={() => handleCategorySelect(cat.slug)}
                                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                                    category === cat.slug
                                        ? 'bg-primary shadow-lg scale-110'
                                        : 'bg-white shadow-sm'
                                }`}>
                                    {cat.emoji}
                                </div>
                                <span className={`text-xs font-medium ${
                                    category === cat.slug ? 'text-primary' : 'text-muted'
                                }`}>
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Listings section */}
            <div className="mt-4 px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-near-black font-bold text-base">
                        {search ? `Résultats pour "${search}"` :
                         category === 'all' ? 'Annonces récentes' :
                         `${categoryIcons.find(c => c.slug === category)?.label || category}`}
                    </h2>
                </div>

                {loading && listings.length === 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
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