import { useNavigate } from 'react-router-dom'

// calculates how long ago a listing was posted
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

    // get first image or fallback to placeholder
    const imageUrl = listing.listing_images?.[0]?.url || 'https://placehold.co/400x300?text=Salu'

    return (
        <div
            onClick={() => navigate(`/listing/${listing.id}`)}
            className="bg-white rounded-xl overflow-hidden border border-border cursor-pointer active:scale-95 transition-transform"
        >
            {/* Image */}
            <div className="h-40 w-full">
                <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Info */}
            <div className="p-2 flex flex-col gap-1">
                {/* Title — line-clamp-2 cuts off at 2 lines with "..." */}
                <p className="text-sm font-semibold text-near-black line-clamp-2 leading-tight">
                    {listing.title}
                </p>

                {/* Price — toLocaleString adds commas: 850000 → 850,000 */}
                <p className="text-primary font-bold text-sm">
                    {listing.price.toLocaleString()} FC
                </p>

                {/* Location + time on same line */}
                <p className="text-muted text-xs">
                    {listing.quartier} · {timeAgo(listing.created_at)}
                </p>
            </div>
        </div>
    )
}