import express from 'express';
import {
  createDirectChat,
  createGroupChat,
  getUserChats,
  getChatById
} from '../controllers/chatController.js';
import { validateCreateDirectChat, validateCreateGroupChat } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route POST /api/chats/direct
 * @desc Créer un chat direct entre deux utilisateurs
 * @body { user1_id: string, user2_id: string }
 */
router.post('/direct', validateCreateDirectChat, createDirectChat);

/**
 * @route POST /api/chats/group
 * @desc Créer un chat de groupe
 * @body { creator_id: string, participant_ids: string[], group_name?: string }
 */
router.post('/group', validateCreateGroupChat, createGroupChat);

/**
 * @route GET /api/chats/user/:userId
 * @desc Récupérer tous les chats d'un utilisateur
 * @param userId - ID de l'utilisateur
 */
router.get('/user/:userId', getUserChats);

/**
 * @route GET /api/chats/:chatId
 * @desc Récupérer un chat par son ID
 * @param chatId - ID du chat
 */
router.get('/:chatId', getChatById);

export default router;