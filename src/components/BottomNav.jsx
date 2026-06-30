import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authContext'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const { t } = useTranslation()

    const active = (path) => location.pathname === path

    function handlePost() {
        if (!user) {
            navigate('/login')
            return
        }
        navigate('/post')
    }

    function handleProfile() {
        if (!user) {
            navigate('/login')
            return
        }
        navigate('/profile')
    }

    function handleMessages() {
        if (!user) {
            navigate('/login')
            return
        }
        navigate('/messages')
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex items-center justify-around px-2 py-2">

                {/* Accueil */}
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-0.5 px-3 py-1"
                >
                    <svg className={`w-6 h-6 ${active('/') ? 'text-primary' : 'text-muted'}`} fill={active('/') ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className={`text-xs font-medium ${active('/') ? 'text-primary' : 'text-muted'}`}>
                        Accueil
                    </span>
                </button>

                {/* Catégories */}
                <button
                    onClick={() => navigate('/categories')}
                    className="flex flex-col items-center gap-0.5 px-3 py-1"
                >
                    <svg className={`w-6 h-6 ${active('/categories') ? 'text-primary' : 'text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className={`text-xs font-medium ${active('/categories') ? 'text-primary' : 'text-muted'}`}>
                        Catégories
                    </span>
                </button>

                {/* Vendre — center big button */}
                <button
                    onClick={handlePost}
                    className="flex flex-col items-center gap-0.5 px-3 py-1"
                >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg -mt-5">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-primary mt-0.5">
                        Vendre
                    </span>
                </button>

                {/* Messages */}
                <button
                    onClick={handleMessages}
                    className="flex flex-col items-center gap-0.5 px-3 py-1"
                >
                    <svg className={`w-6 h-6 ${active('/messages') ? 'text-primary' : 'text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2z" />
                    </svg>
                    <span className={`text-xs font-medium ${active('/messages') ? 'text-primary' : 'text-muted'}`}>
                        Messages
                    </span>
                </button>

                {/* Profil */}
                <button
                    onClick={handleProfile}
                    className="flex flex-col items-center gap-0.5 px-3 py-1"
                >
                    <svg className={`w-6 h-6 ${active('/profile') ? 'text-primary' : 'text-muted'}`} fill={active('/profile') ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className={`text-xs font-medium ${active('/profile') ? 'text-primary' : 'text-muted'}`}>
                        Profil
                    </span>
                </button>

            </div>
        </div>
    )
}