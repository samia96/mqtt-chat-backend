import { MessageModel } from '../models/messageModel.js';
import { ChatModel } from '../models/chatModel.js';
import { publishMessage } from '../services/mqttService.js';

export const sendMessage = async (req, res) => {
  try {
    const { chat_id, sender_id, content, message_type = 'text' } = req.body;

    // Validation
    if (!chat_id || !sender_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID, sender ID et contenu sont requis'
      });
    }

    // Vérifier que le chat existe
    const chat = await ChatModel.findById(chat_id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat introuvable'
      });
    }

    // Vérifier que l'utilisateur fait partie du chat
    if (!chat.participants.includes(sender_id)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à envoyer des messages dans ce chat'
      });
    }

    // Créer le message
    const message = await MessageModel.create({
      chat_id,
      sender_id,
      content,
      message_type
    });

    // Mettre à jour l'activité du chat
    await ChatModel.updateLastActivity(chat_id);

    // Publier le message via MQTT
    const mqttMessage = {
      id: message.id,
      chat_id: message.chat_id,
      sender_id: message.sender_id,
      sender: message.sender,
      content: message.content,
      message_type: message.message_type,
      created_at: message.created_at,
      read_by: message.read_by || []
    };

    await publishMessage(`chat/${chat.channel_id}/messages`, mqttMessage);

    res.status(201).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'ID du chat requis'
      });
    }

    const messages = await MessageModel.getChatMessages(chatId, limit, offset);

    res.status(200).json({
      success: true,
      data: messages.reverse() // Ordre chronologique
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { user_id } = req.body;

    if (!messageId || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Message ID et User ID sont requis'
      });
    }

    const updatedMessage = await MessageModel.markAsRead(messageId, user_id);

    // Publier l'accusé de lecture via MQTT
    const chat = await ChatModel.findById(updatedMessage.chat_id);
    await publishMessage(`chat/${chat.channel_id}/read-receipts`, {
      message_id: messageId,
      user_id: user_id,
      read_at: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      data: updatedMessage
    });

  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { user_id } = req.body;

    if (!chatId || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID et User ID sont requis'
      });
    }

    const result = await MessageModel.markChatMessagesAsRead(chatId, user_id);

    // Publier l'accusé de lecture global via MQTT
    const chat = await ChatModel.findById(chatId);
    await publishMessage(`chat/${chat.channel_id}/read-receipts`, {
      chat_id: chatId,
      user_id: user_id,
      read_all: true,
      read_at: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erreur lors du marquage du chat comme lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { chatId, userId } = req.params;

    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID et User ID sont requis'
      });
    }

    const unreadCount = await MessageModel.getUnreadCount(chatId, userId);

    res.status(200).json({
      success: true,
      data: { unread_count: unreadCount }
    });

  } catch (error) {
    console.error('Erreur lors du calcul des messages non lus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Handler pour les messages MQTT entrants
export const handleIncomingMessage = async (topic, data) => {
  try {
    console.log(`📨 Message MQTT reçu sur ${topic}:`, data);
    
    if (topic.includes('/read-receipts')) {
      // Traiter les accusés de lecture
      console.log('✅ Accusé de lecture traité:', data);
    } else if (topic.includes('/messages')) {
      // Traiter les messages entrants
      console.log('💬 Message traité:', data);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du traitement du message MQTT:', error);
  }
};