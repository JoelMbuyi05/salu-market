import { useTranslation } from 'react-i18next'

const categories = [
    { slug: 'all', labelKey: 'categories.all' },
    { slug: 'phones', labelKey: 'categories.phones' },
    { slug: 'clothes', labelKey: 'categories.clothes' },
    { slug: 'electronics', labelKey: 'categories.electronics' },
    { slug: 'food', labelKey: 'categories.food' },
    { slug: 'furniture', labelKey: 'categories.furniture' },
    { slug: 'vehicles', labelKey: 'categories.vehicles' },
    { slug: 'services', labelKey: 'categories.services' },
    { slug: 'other', labelKey: 'categories.other' },
]

export default function CategoryChips({ selected, onSelect }) {
    const { t } = useTranslation()

    return (
        <div className="flex gap-2 overflow-x-auto px-3 py-2 bg-white scrollbar-hide">
            {categories.map(cat => (
                <button
                    key={cat.slug}
                    onClick={() => onSelect(cat.slug)}
                    className={`
                        flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium border transition-colors
                        ${selected === cat.slug
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-near-black border-border'
                        }
                    `}
                >
                    {t(cat.labelKey)}
                </button>
            ))}
        </div>
    )
}