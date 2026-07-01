import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'
import BottomNav from '../components/BottomNav'

const categoryNames = {
    phones: 'Téléphones',
    clothes: 'Mode',
    electronics: 'Électronique',
    food: 'Alimentation',
    furniture: 'Maison',
    vehicles: 'Véhicules',
    services: 'Services',
    other: 'Autres',
}

const sortOptions = [
    { value: 'recent', label: 'Plus récent' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
]

export default function CategoryListings() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [count, setCount] = useState(0)
    const [sort, setSort] = useState('recent')
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const bottomRef = useRef(null)
    const PAGE_SIZE = 20

    async function fetchCategoryListings(pageNumber, sortBy) {
        setLoading(true)
        const from = pageNumber * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        let query = supabase
            .from('listings')
            .select(`
                id, title, price, quartier, category_slug, created_at,
                listing_images (url, position)
            `, { count: 'exact' })
            .eq('category_slug', slug)
            .eq('is_sold', false)
            .eq('is_flagged', false)
            .range(from, to)

        if (sortBy === 'recent') query = query.order('created_at', { ascending: false })
        if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
        if (sortBy === 'price_desc') query = query.order('price', { ascending: false })

        const { data, error, count: total } = await query

        if (error) { console.error(error); setLoading(false); return }
        if (total !== null) setCount(total)
        if (data.length < PAGE_SIZE) setHasMore(false)
        setListings(prev => pageNumber === 0 ? data : [...prev, ...data])
        setLoading(false)
    }

    useEffect(() => {
        setPage(0)
        setHasMore(true)
        setListings([])
        fetchCategoryListings(0, sort)
    }, [slug, sort])

    useEffect(() => {
        if (page === 0) return
        fetchCategoryListings(page, sort)
    }, [page])

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

    function handleSortChange(newSort) {
        setSort(newSort)
        setPage(0)
        setHasMore(true)
        setListings([])
    }

    return (
        <div className="min-h-screen bg-light-bg pb-24">

            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white text-xl leading-none"
                >
                    ←
                </button>
                <div className="flex-1">
                    <h1 className="text-white font-bold text-lg">
                        {categoryNames[slug] || slug}
                    </h1>
                    <p className="text-accent text-xs">
                        {count} annonce{count !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Sort filters */}
            <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-border">
                {sortOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            sort === option.value
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-near-black border-border'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Listings */}
            <div className="p-4">
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

                {!loading && listings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <p className="text-near-black font-semibold">
                            Aucune annonce dans cette catégorie
                        </p>
                        <p className="text-muted text-sm">
                            Soyez le premier à publier !
                        </p>
                        <button
                            onClick={() => navigate('/post')}
                            className="mt-2 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold"
                        >
                            Publier une annonce
                        </button>
                    </div>
                )}
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

            <BottomNav />
        </div>
    )
}