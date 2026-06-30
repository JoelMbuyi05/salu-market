import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BottomNav from '../components/BottomNav'

const categories = [
    {
        slug: 'phones', labelKey: 'categories.phones', color: 'bg-blue-50',
        icon: <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    },
    {
        slug: 'clothes', labelKey: 'categories.clothes', color: 'bg-pink-50',
        icon: <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7l-4 4 4 4M17 7l4 4-4 4M14 3l-4 18" /></svg>
    },
    {
        slug: 'electronics', labelKey: 'categories.electronics', color: 'bg-purple-50',
        icon: <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    {
        slug: 'food', labelKey: 'categories.food', color: 'bg-red-50',
        icon: <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    },
    {
        slug: 'furniture', labelKey: 'categories.furniture', color: 'bg-yellow-50',
        icon: <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
        slug: 'vehicles', labelKey: 'categories.vehicles', color: 'bg-orange-50',
        icon: <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zM13 8h4l3 5v3h-7V8z" /></svg>
    },
    {
        slug: 'services', labelKey: 'categories.services', color: 'bg-green-50',
        icon: <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    {
        slug: 'other', labelKey: 'categories.other', color: 'bg-gray-50',
        icon: <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
    },
]

export default function Categories() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-light-bg pb-24">
            <div className="bg-primary px-4 py-4 sticky top-0 z-20">
                <h1 className="text-white font-bold text-xl text-center">Catégories</h1>
            </div>

            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(cat => (
                    <button
                        key={cat.slug}
                        onClick={() => navigate(`/?category=${cat.slug}`)}
                        className={`${cat.color} rounded-2xl p-6 flex flex-col items-center gap-3 active:scale-95 transition-transform`}
                    >
                        {cat.icon}
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