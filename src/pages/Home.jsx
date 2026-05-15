import ListingCard from '../components/ListingCard'

const fakeListings = [
    {
        id: '1',
        title: 'iPhone 13 Pro Max 256GB comme neuf',
        price: 850000,
        quartier: 'Nganza',
        category_slug: 'phones',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        listing_images: [{ url: 'https://placehold.co/400x300?text=iPhone', position: 0 }]
    },
    {
        id: '2',
        title: 'Canapé 3 places tissu gris',
        price: 320000,
        quartier: 'Muya',
        category_slug: 'furniture',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        listing_images: [{ url: 'https://placehold.co/400x300?text=Canape', position: 0 }]
    },
    {
        id: '3',
        title: 'Samsung Galaxy A54 neuf sous emballage',
        price: 480000,
        quartier: 'Bipemba',
        category_slug: 'phones',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        listing_images: [{ url: 'https://placehold.co/400x300?text=Samsung', position: 0 }]
    },
    {
        id: '4',
        title: 'Habits enfant 2-5 ans lot de 10 pièces',
        price: 45000,
        quartier: 'Dibindi',
        category_slug: 'clothes',
        created_at: new Date(Date.now() - 900000).toISOString(),
        listing_images: [{ url: 'https://placehold.co/400x300?text=Habits', position: 0 }]
    }
]

export default function Home() {
    return (
        <div className="min-h-screen bg-light-bg">
            {/* Header */}
            <div className="bg-primary px-4 py-3 sticky top-0 z-10">
                <h1 className="text-white font-bold text-xl">Salu</h1>
            </div>

            {/* Grid */}
            <div className="p-3 grid grid-cols-2 gap-3">
                {fakeListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </div>
    )
}