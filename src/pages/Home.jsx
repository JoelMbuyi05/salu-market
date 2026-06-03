import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import CategoryChips from '../components/CategoryChips'
import { useDebounce } from '../hooks/useDebounce'
import { useTranslation } from 'react-i18next'
import SkeletonCard from '../components/SkeletonCard'
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

    if (category !== 'all') {
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

export default function Home() {

    const { user } = useAuth()
    
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [category, setCategory] = useState('all')
    const [listings, setListings] = useState([])
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [search, setSearch] = useState('')
    const [scrolled, setScrolled] = useState(false)

    const debouncedSearch = useDebounce(search, 500)
    const bottomRef = useRef(null)

    useEffect(() => {
        fetchListings(0, setListings, setHasMore, setLoading, category, debouncedSearch)
    }, [])

    useEffect(() => {
        if (page === 0) return
        fetchListings(page, setListings, setHasMore, setLoading, category, debouncedSearch)
    }, [page])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch.trim()) {
                trackSearch(debouncedSearch)
            }
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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)

        return () => { 
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div>
            {/* header — only this stays sticky */}
            <div className={`sticky top-0 z-20 px-4 py-3 transition-all duration-300 ${
                    scrolled
                        ? 'bg-primary/70 backdrop-blur-xl border-b border-white/10'
                        : 'bg-primary'
                }`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <img
                            src="/icon-512.png"
                            alt="Salu"
                            className="h-8 w-8 rounded-lg"
                        />
                        <span className="text-white font-bold text-lg">Salu Market</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="text-white text-sm opacity-80"
                                >
                                    {t('nav.profile')}
                                </button>
                                <button
                                    onClick={() => navigate('/post')}
                                    className="bg-white text-primary text-sm font-semibold px-3 py-1 rounded-full"
                                >
                                    +
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-white text-primary text-sm font-semibold px-3 py-1 rounded-full"
                            >
                                {t('auth.login')}
                            </button>
                        )}
                    </div>
                </div>

                {/* search */}
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="w-full bg-white rounded-full px-4 py-2 text-sm text-near-black outline-none pr-8"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-lg leading-none"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>
            {/* not sticky, scrolls with page */}
            <div className="bg-white border-b border-border">
                <CategoryChips selected={category} onSelect={handleCategorySelect} />
            </div>

            <div className="p-3 grid grid-cols-2 gap-3">
                {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>

            {loading && listings.length === 0 && (
                <div className="p-3 grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

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
        </div>
    )
}