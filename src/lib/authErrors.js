export function translateAuthError(message) {
    const errors = {
        'Invalid login credentials': 'Email ou mot de passe incorrect',
        'Email not confirmed': 'Email non confirmé',
        'User already registered': 'Un compte existe déjà avec cet email',
        'Password should be at least 6 characters': 'Le mot de passe doit avoir au moins 6 caractères',
        'Unable to validate email address: invalid format': 'Format d\'email invalide',
        'Email rate limit exceeded': 'Trop de tentatives, réessayez plus tard',
        'Invalid email or password': 'Email ou mot de passe incorrect',
        'signup_disabled': 'Les inscriptions sont désactivées',
        'User not found': 'Utilisateur introuvable',
    }
    return errors[message] || message
}