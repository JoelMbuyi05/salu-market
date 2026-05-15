import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/ListingCard'
import CategoryChips from '../components/CategoryChips'

const PAGE_SIZE = 20

async function fetchListings(pageNumber, setListings, setHasMore, setLoading, category) {
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

    // only filter if not "all"
    if (category !== 'all') {
        query = query.eq('category_slug', category)
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

    const [category, setCategory] = useState('all')

    const [listings, setListings] = useState([])
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const bottomRef = useRef(null)

    function handleCategorySelect(slug) {
      setCategory(slug)
      setPage(0)
      setHasMore(true)
      setListings([])
      fetchListings(0, setListings, setHasMore, setLoading, slug)
    }

    useEffect(() => {
        fetchListings(0, setListings, setHasMore, setLoading, category)
    }, [])

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
        if (page === 0) return
        fetchListings(page, setListings, setHasMore, setLoading, category)
    }, [page])

    return (
        <div className="min-h-screen bg-light-bg">
            <div className="bg-primary px-4 py-3 sticky top-0 z-10">
                <h1 className="text-white font-bold text-xl">Salu</h1>
            </div>

            {/* sticky chips below header */}
            <div className="sticky top-12 z-10 shadow-sm">
                <CategoryChips selected={category} onSelect={handleCategorySelect} />
            </div>

            <div className="p-3 grid grid-cols-2 gap-3">
                {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>

            {loading && (
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