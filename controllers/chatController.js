import { ChatModel } from '../models/chatModel.js';
import { UserModel } from '../models/userModel.js';
import { subscribeToChat } from '../services/mqttService.js';

export const createDirectChat = async (req, res) => {
  try {
    const { user1_id, user2_id } = req.body;

    // Validation
    if (!user1_id || !user2_id) {
      return res.status(400).json({
        success: false,
        message: 'Les IDs des utilisateurs sont requis'
      });
    }

    if (user1_id === user2_id) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de créer un chat avec soi-même'
      });
    }

    // Vérifier que les utilisateurs existent
    const [user1, user2] = await Promise.all([
      UserModel.findById(user1_id),
      UserModel.findById(user2_id)
    ]);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: 'Un ou plusieurs utilisateurs introuvables'
      });
    }

    // Créer ou récupérer le chat
    const chat = await ChatModel.createDirectChat(user1_id, user2_id);

    // S'abonner au canal MQTT
    subscribeToChat(chat.channel_id);

    res.status(201).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('Erreur lors de la création du chat direct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { creator_id, participant_ids, group_name } = req.body;

    // Validation
    if (!creator_id || !participant_ids || !Array.isArray(participant_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Creator ID et liste des participants requis'
      });
    }

    if (participant_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un participant est requis'
      });
    }

    // Vérifier que tous les utilisateurs existent
    const allUserIds = [creator_id, ...participant_ids];
    const users = await Promise.all(
      allUserIds.map(id => UserModel.findById(id))
    );

    if (users.some(user => !user)) {
      return res.status(404).json({
        success: false,
        message: 'Un ou plusieurs utilisateurs introuvables'
      });
    }

    // Créer le chat de groupe
    const chat = await ChatModel.createGroupChat(creator_id, participant_ids, group_name);

    // S'abonner au canal MQTT
    subscribeToChat(chat.channel_id);

    res.status(201).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('Erreur lors de la création du chat de groupe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur requis'
      });
    }

    const chats = await ChatModel.getUserChats(userId);

    res.status(200).json({
      success: true,
      data: chats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des chats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'ID du chat requis'
      });
    }

    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat introuvable'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};