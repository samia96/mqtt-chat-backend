import express from 'express';
import {
  sendMessage,
  getChatMessages,
  markMessageAsRead,
  markChatAsRead,
  getUnreadCount
} from '../controllers/messageController.js';
import { validateSendMessage, validateMarkAsRead } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route POST /api/messages
 * @desc Envoyer un message dans un chat
 * @body { chat_id: string, sender_id: string, content: string, message_type?: string }
 */
router.post('/', validateSendMessage, sendMessage);

/**
 * @route GET /api/messages/chat/:chatId
 * @desc Récupérer les messages d'un chat
 * @param chatId - ID du chat
 * @query limit - Nombre de messages à récupérer (défaut: 50)
 * @query offset - Décalage pour la pagination (défaut: 0)
 */
router.get('/chat/:chatId', getChatMessages);

/**
 * @route PUT /api/messages/:messageId/read
 * @desc Marquer un message comme lu
 * @param messageId - ID du message
 * @body { user_id: string }
 */
router.put('/:messageId/read', validateMarkAsRead, markMessageAsRead);

/**
 * @route PUT /api/messages/chat/:chatId/read
 * @desc Marquer tous les messages d'un chat comme lus
 * @param chatId - ID du chat
 * @body { user_id: string }
 */
router.put('/chat/:chatId/read', validateMarkAsRead, markChatAsRead);

/**
 * @route GET /api/messages/chat/:chatId/unread/:userId
 * @desc Obtenir le nombre de messages non lus dans un chat pour un utilisateur
 * @param chatId - ID du chat
 * @param userId - ID de l'utilisateur
 */
router.get('/chat/:chatId/unread/:userId', getUnreadCount);

export default router;