// Middleware d'authentification basique
// TODO: Implémenter JWT ou utiliser Supabase Auth

export const requireAuth = (req, res, next) => {
  // Pour le moment, on passe l'authentification
  // En production, vérifier le JWT ou la session Supabase
  next();
};

export const extractUserId = (req, res, next) => {
  // Extraire l'ID utilisateur du token JWT ou de la session
  // Pour le moment, on utilise un header personnalisé
  const userId = req.headers['x-user-id'];
  
  if (userId) {
    req.userId = userId;
  }
  
  next();
};