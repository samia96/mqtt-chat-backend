import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  last_seen: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  }
}, {
  timestamps: true
});

// Index pour les performances
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

export class UserModel {
  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async findById(id) {
    return await User.findById(id);
  }

  static async findByUsername(username) {
    return await User.findOne({ username });
  }

  static async findByEmail(email) {
    return await User.findOne({ email });
  }

  static async getAll() {
    return await User.find({}).sort({ username: 1 });
  }

  static async updateLastSeen(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { last_seen: new Date() },
      { new: true }
    );
  }

  static async updateStatus(userId, status) {
    return await User.findByIdAndUpdate(
      userId,
      { status, last_seen: new Date() },
      { new: true }
    );
  }

  static async getOnlineUsers() {
    return await User.find({ status: 'online' }).sort({ username: 1 });
  }

  static async delete(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

export default User;