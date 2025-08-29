import { UserModel } from '../models/userModel.js';

export const createUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Validation
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username et email sont requis'
      });
    }

    // Vérifier l'unicité
    const [existingUsername, existingEmail] = await Promise.all([
      UserModel.findByUsername(username),
      UserModel.findByEmail(email)
    ]);

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Ce nom d\'utilisateur existe déjà'
      });
    }

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Cet email existe déjà'
      });
    }

    const user = await UserModel.create({ username, email });

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    // Gestion des erreurs MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Ce ${field} existe déjà`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll();

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis'
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const updateUserLastSeen = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis'
      });
    }

    const user = await UserModel.updateLastSeen(userId);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: 'User ID et status sont requis'
      });
    }

    const user = await UserModel.updateStatus(userId, status);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const users = await UserModel.getOnlineUsers();

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs en ligne:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};