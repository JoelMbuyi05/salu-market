export function translateAuthError(message, language = 'fr') {
    const errors = {

        fr: {
            'Invalid login credentials': 'Email ou mot de passe incorrect',
            'Email not confirmed': 'Email non confirmé',
            'User already registered': 'Un compte existe déjà avec cet email',
            'Password should be at least 6 characters': 'Le mot de passe doit avoir au moins 6 caractères',
            'Unable to validate email address: invalid format': 'Format d\'email invalide',
            'Email rate limit exceeded': 'Trop de tentatives, réessayez plus tard',
            'Invalid email or password': 'Email ou mot de passe incorrect',
            'signup_disabled': 'Les inscriptions sont désactivées',
            'User not found': 'Utilisateur introuvable',
        },
        en: {
                'Invalid login credentials': 'Incorrect email or password',
                'Email not confirmed': 'Email not confirmed',
                'User already registered': 'An account already exists with this email',
                'Password should be at least 6 characters': 'Password must be at least 6 characters',
                'Unable to validate email address: invalid format': 'Invalid email format',
                'Email rate limit exceeded': 'Too many attempts, please try again later',
        }
    }
    return errors[language]?.[message] || message
}