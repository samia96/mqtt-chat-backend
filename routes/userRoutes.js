import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUserLastSeen,
  updateUserStatus,
  getOnlineUsers
} from '../controllers/userController.js';
import { validateCreateUser } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route POST /api/users
 * @desc Créer un nouvel utilisateur
 * @body { username: string, email: string }
 */
router.post('/', validateCreateUser, createUser);

/**
 * @route GET /api/users
 * @desc Récupérer tous les utilisateurs
 */
router.get('/', getUsers);

/**
 * @route GET /users/online
 * @desc Récupérer tous les utilisateurs en ligne
 */
router.get('/online', getOnlineUsers);

/**
 * @route GET /api/users/:userId
 * @desc Récupérer un utilisateur par son ID
 * @param userId - ID de l'utilisateur
 */
router.get('/:userId', getUserById);

/**
 * @route PUT /api/users/:userId/last-seen
 * @desc Mettre à jour la dernière connexion d'un utilisateur
 * @param userId - ID de l'utilisateur
 */
router.put('/:userId/last-seen', updateUserLastSeen);

/**
 * @route PUT /users/:userId/status
 * @desc Mettre à jour le statut d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @body { status: "online" | "offline" | "away" }
 */
router.put('/:userId/status', updateUserStatus);

export default router;