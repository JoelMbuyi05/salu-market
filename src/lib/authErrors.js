export function translateAuthError(message, language = 'fr') {
    // normalize language — fr-FR, fr-CD, fr-BE all become 'fr'
    const lang = language?.startsWith('fr') ? 'fr' : 
                 language?.startsWith('en') ? 'en' : 'fr'

    const errors = {
        fr: {
            'Invalid login credentials': 'Email ou mot de passe incorrect',
            'Email not confirmed': 'Email non confirmé',
            'User already registered': 'Un compte existe déjà avec cet email',
            'Password should be at least 6 characters': 'Le mot de passe doit avoir au moins 6 caractères',
            'Unable to validate email address: invalid format': 'Format d\'email invalide',
            'Email rate limit exceeded': 'Trop de tentatives, réessayez plus tard',
            'Anonymous sign-ins are disabled': 'Veuillez remplir tous les champs',
            'signup_disabled': 'Les inscriptions sont désactivées',
            'User not found': 'Utilisateur introuvable',
            'Password is too short': 'Le mot de passe est trop court',
            'Load failed': 'Connexion impossible. Vérifiez votre internet.',
            'Failed to fetch': 'Connexion impossible. Vérifiez votre internet.',
            'NetworkError': 'Erreur réseau. Vérifiez votre connexion.',
            'fetch failed': 'Connexion impossible. Vérifiez votre internet.',
            'over_email_send_rate_limit': 'Trop de tentatives. Réessayez plus tard.',
            'Email link is invalid or has expired': 'Le lien a expiré. Demandez un nouveau.',
            'Token has expired or is invalid': 'Session expirée. Reconnectez-vous.',
            'User not allowed': 'Action non autorisée.',
            'Signups not allowed for this instance': 'Les inscriptions sont désactivées.',
        },
        en: {
            'Invalid login credentials': 'Incorrect email or password',
            'Email not confirmed': 'Email not confirmed',
            'User already registered': 'An account already exists with this email',
            'Password should be at least 6 characters': 'Password must be at least 6 characters',
            'Unable to validate email address: invalid format': 'Invalid email format',
            'Email rate limit exceeded': 'Too many attempts, please try again later',
            'Anonymous sign-ins are disabled': 'Please fill in all fields',
            'Password is too short': 'Password is too short',
            'Load failed': 'Connection failed. Check your internet.',
            'Failed to fetch': 'Connection failed. Check your internet.',
            'NetworkError': 'Network error. Check your connection.',
            'fetch failed': 'Connection failed. Check your internet.',
            'over_email_send_rate_limit': 'Too many attempts. Try again later.',
            'Email link is invalid or has expired': 'Link expired. Request a new one.',
            'Token has expired or is invalid': 'Session expired. Please log in again.',
            'User not allowed': 'Action not allowed.',
            'Signups not allowed for this instance': 'Signups are disabled.',
        }
    }

    return errors[lang]?.[message] || 
           errors[lang]?.[message?.split(':')[0]?.trim()] ||
           (lang === 'fr' ? 'Une erreur est survenue. Réessayez.' : 'An error occurred. Please try again.')
}