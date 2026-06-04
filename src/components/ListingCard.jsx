import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function timeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const minutes = Math.floor((now - date) / 60000)
    if (minutes < 60) return `il y a ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `il y a ${days}j`
}

export default function ListingCard({ listing }) {
    const navigate = useNavigate()
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    const rawUrl = listing.listing_images?.[0]?.url || null

    // use supabase image transformation for smaller thumbnails
    const imageUrl = rawUrl || null

    useEffect(() => {
        if (!imageUrl) return
        const timeout = setTimeout(() => {
            if (!imageLoaded) setImageError(true)
        }, 8000)
        return () => clearTimeout(timeout)
    }, [imageUrl, imageLoaded])

    return (
        <div
            onClick={() => navigate(`/listing/${listing.id}`)}
            className="bg-white rounded-xl overflow-hidden border border-border cursor-pointer active:scale-95 transition-transform"
        >
            <div className="h-40 w-full bg-light-bg relative overflow-hidden">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 bg-light-bg animate-pulse" />
                )}

                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={listing.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-light-bg flex items-center justify-center">
                        <span className="text-muted text-xs">Salu</span>
                    </div>
                )}
            </div>

            <div className="p-2 flex flex-col gap-1">
                <p className="text-sm font-semibold text-near-black line-clamp-2 leading-tight">
                    {listing.title}
                </p>
                <p className="text-primary font-bold text-sm">
                    {listing.price.toLocaleString()} FC
                </p>
                <p className="text-muted text-xs">
                    {listing.quartier} · {timeAgo(listing.created_at)}
                </p>
            </div>
        </div>
    )
}