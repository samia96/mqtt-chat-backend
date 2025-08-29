import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  channel_id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['direct', 'group']
  },
  name: {
    type: String,
    required: function() {
      return this.type === 'group';
    },
    maxlength: 100
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  last_activity: {
    type: Date,
    default: Date.now
  },
  settings: {
    muted_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    archived_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

// Index pour les performances
chatSchema.index({ channel_id: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ last_activity: -1 });
chatSchema.index({ type: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export class ChatModel {
  static async createDirectChat(user1Id, user2Id) {
    const channelId = this.generateDirectChatId(user1Id, user2Id);
    
    // Vérifier si le chat existe déjà
    const existingChat = await Chat.findOne({ channel_id: channelId })
      .populate('participants', 'username email status');
    
    if (existingChat) {
      return existingChat;
    }

    const chat = new Chat({
      channel_id: channelId,
      type: 'direct',
      participants: [user1Id, user2Id],
      created_by: user1Id
    });

    const savedChat = await chat.save();
    return await savedChat.populate('participants', 'username email status');
  }

  static async createGroupChat(creatorId, participantIds, groupName) {
    const channelId = `group_${new mongoose.Types.ObjectId()}`;
    const allParticipants = [creatorId, ...participantIds];

    const chat = new Chat({
      channel_id: channelId,
      type: 'group',
      name: groupName,
      participants: allParticipants,
      created_by: creatorId
    });

    const savedChat = await chat.save();
    return await savedChat.populate([
      { path: 'participants', select: 'username email status' },
      { path: 'created_by', select: 'username email' }
    ]);
  }

  static generateDirectChatId(user1Id, user2Id) {
    // Trier les IDs pour garantir un channel_id cohérent
    const sortedIds = [user1Id.toString(), user2Id.toString()].sort();
    return `direct_${sortedIds[0]}_${sortedIds[1]}`;
  }

  static async findById(chatId) {
    return await Chat.findById(chatId)
      .populate('participants', 'username email status')
      .populate('created_by', 'username email');
  }

  static async findByChannelId(channelId) {
    return await Chat.findOne({ channel_id: channelId })
      .populate('participants', 'username email status');
  }

  static async getUserChats(userId) {
    return await Chat.find({ participants: userId })
      .populate('participants', 'username email status')
      .populate('created_by', 'username email')
      .sort({ last_activity: -1 });
  }

  static async updateLastActivity(chatId) {
    return await Chat.findByIdAndUpdate(
      chatId,
      { last_activity: new Date() },
      { new: true }
    );
  }

  static async addParticipant(chatId, userId) {
    return await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).populate('participants', 'username email status');
  }

  static async removeParticipant(chatId, userId) {
    return await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: userId } },
      { new: true }
    ).populate('participants', 'username email status');
  }

  static async muteChat(chatId, userId) {
    return await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { 'settings.muted_by': userId } },
      { new: true }
    );
  }

  static async unmuteChat(chatId, userId) {
    return await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { 'settings.muted_by': userId } },
      { new: true }
    );
  }
}

export default Chat;