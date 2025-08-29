import mongoose from 'mongoose';

const readReceiptSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  chat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file', 'emoji'],
    default: 'text'
  },
  read_by: [readReceiptSchema],
  edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour les performances
messageSchema.index({ chat_id: 1, createdAt: -1 });
messageSchema.index({ sender_id: 1 });
messageSchema.index({ 'read_by.user_id': 1 });

const Message = mongoose.model('Message', messageSchema);

export class MessageModel {
  static async create(messageData) {
    const message = new Message(messageData);
    const savedMessage = await message.save();
    
    return await savedMessage.populate([
      { path: 'sender_id', select: 'username email' },
      { path: 'chat_id', select: 'channel_id type participants' }
    ]);
  }

  static async getChatMessages(chatId, limit = 50, offset = 0) {
    return await Message.find({ chat_id: chatId })
      .populate('sender_id', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  }

  static async markAsRead(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message introuvable');
    }

    // Vérifier si déjà lu
    const alreadyRead = message.read_by.some(
      receipt => receipt.user_id.toString() === userId.toString()
    );

    if (!alreadyRead) {
      message.read_by.push({
        user_id: userId,
        read_at: new Date()
      });
      await message.save();
    }

    return await message.populate('sender_id', 'username email');
  }

  static async markChatMessagesAsRead(chatId, userId, beforeTimestamp = null) {
    const query = {
      chat_id: chatId,
      sender_id: { $ne: userId }, // Ne pas marquer ses propres messages
      'read_by.user_id': { $ne: userId } // Pas déjà lu
    };

    if (beforeTimestamp) {
      query.createdAt = { $lte: new Date(beforeTimestamp) };
    }

    const messages = await Message.find(query);
    
    let updatedCount = 0;
    for (const message of messages) {
      message.read_by.push({
        user_id: userId,
        read_at: new Date()
      });
      await message.save();
      updatedCount++;
    }

    return { success: true, updated_count: updatedCount };
  }

  static async getUnreadCount(chatId, userId) {
    return await Message.countDocuments({
      chat_id: chatId,
      sender_id: { $ne: userId },
      'read_by.user_id': { $ne: userId }
    });
  }

  static async getMessageById(messageId) {
    return await Message.findById(messageId)
      .populate('sender_id', 'username email')
      .populate('chat_id', 'channel_id type participants');
  }

  static async deleteMessage(messageId) {
    return await Message.findByIdAndDelete(messageId);
  }

  static async editMessage(messageId, newContent) {
    return await Message.findByIdAndUpdate(
      messageId,
      { 
        content: newContent,
        edited: true,
        edited_at: new Date()
      },
      { new: true }
    ).populate('sender_id', 'username email');
  }
}

export default Message;