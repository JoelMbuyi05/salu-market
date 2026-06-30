import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BottomNav from '../components/BottomNav'

const categories = [
    { slug: 'phones', labelKey: 'categories.phones', emoji: '📱', color: 'bg-blue-50' },
    { slug: 'clothes', labelKey: 'categories.clothes', emoji: '👗', color: 'bg-pink-50' },
    { slug: 'electronics', labelKey: 'categories.electronics', emoji: '💻', color: 'bg-purple-50' },
    { slug: 'food', labelKey: 'categories.food', emoji: '🍎', color: 'bg-red-50' },
    { slug: 'furniture', labelKey: 'categories.furniture', emoji: '🛋️', color: 'bg-yellow-50' },
    { slug: 'vehicles', labelKey: 'categories.vehicles', emoji: '🚗', color: 'bg-orange-50' },
    { slug: 'services', labelKey: 'categories.services', emoji: '🔧', color: 'bg-green-50' },
    { slug: 'other', labelKey: 'categories.other', emoji: '📦', color: 'bg-gray-50' },
]

export default function Categories() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-light-bg pb-24">

            {/* Header */}
            <div className="bg-primary px-4 py-4 sticky top-0 z-20">
                <h1 className="text-white font-bold text-xl text-center">Catégories</h1>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
                {categories.map(cat => (
                    <button
                        key={cat.slug}
                        onClick={() => navigate(`/?category=${cat.slug}`)}
                        className={`${cat.color} rounded-2xl p-6 flex flex-col items-center gap-3 active:scale-95 transition-transform`}
                    >
                        <span className="text-4xl">{cat.emoji}</span>
                        <span className="text-near-black font-semibold text-sm">
                            {t(cat.labelKey)}
                        </span>
                    </button>
                ))}
            </div>

            <BottomNav />
        </div>
    )
}