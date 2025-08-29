import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mqtt-chat';

export async function connectDatabase() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    return false;
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('✅ Déconnexion de MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
  }
}

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('📦 Mongoose connecté à MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Erreur de connexion Mongoose:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('📦 Mongoose déconnecté de MongoDB');
});

// Fermeture propre lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});