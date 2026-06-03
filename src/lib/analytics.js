// track any event to Google Analytics
export function trackEvent(eventName, params = {}) {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', eventName, params)
    }
}

// specific events
export function trackSignUp() {
    trackEvent('sign_up', { method: 'email' })
}

export function trackLogin() {
    trackEvent('login', { method: 'email' })
}

export function trackListingView(listingId, title) {
    trackEvent('view_item', {
        item_id: listingId,
        item_name: title
    })
}

export function trackListingPost(category) {
    trackEvent('post_listing', { category })
}

export function trackWhatsAppContact(listingId) {
    trackEvent('whatsapp_contact', { listing_id: listingId })
}

export function trackSearch(searchTerm) {
    trackEvent('search', { search_term: searchTerm })
}

export function trackFavourite(listingId) {
    trackEvent('add_to_wishlist', { item_id: listingId })
}