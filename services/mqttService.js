import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { handleIncomingMessage } from '../controllers/messageController.js';

dotenv.config();

let mqttClient = null;

export async function initializeMQTT() {
  return new Promise((resolve, reject) => {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    const clientId = process.env.MQTT_CLIENT_ID || 'chat-backend';

    mqttClient = mqtt.connect(brokerUrl, {
      clientId: clientId + '_' + Math.random().toString(16).substr(2, 8),
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    mqttClient.on('connect', () => {
      console.log('📡 Connecté au broker MQTT');
      
      // S'abonner aux topics globaux
      mqttClient.subscribe('chat/+/messages', (err) => {
        if (!err) {
          console.log('✅ Abonné aux messages de chat');
        } else {
          console.error('❌ Erreur d\'abonnement aux messages:', err);
        }
      });

      mqttClient.subscribe('chat/+/read-receipts', (err) => {
        if (!err) {
          console.log('✅ Abonné aux accusés de lecture');
        } else {
          console.error('❌ Erreur d\'abonnement aux accusés de lecture:', err);
        }
      });

      resolve(mqttClient);
    });

    mqttClient.on('error', (error) => {
      console.error('❌ Erreur MQTT:', error);
      reject(error);
    });

    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        await handleIncomingMessage(topic, data);
      } catch (error) {
        console.error('❌ Erreur lors du traitement du message MQTT:', error);
      }
    });

    mqttClient.on('disconnect', () => {
      console.log('📡 Déconnecté du broker MQTT');
    });
  });
}

export function publishMessage(topic, message) {
  if (!mqttClient) {
    throw new Error('Client MQTT non initialisé');
  }

  return new Promise((resolve, reject) => {
    mqttClient.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function subscribeToChat(chatId) {
  if (!mqttClient) {
    throw new Error('Client MQTT non initialisé');
  }

  const topic = `chat/${chatId}/messages`;
  mqttClient.subscribe(topic, (err) => {
    if (err) {
      console.error(`❌ Erreur d'abonnement au chat ${chatId}:`, err);
    } else {
      console.log(`✅ Abonné au chat ${chatId}`);
    }
  });
}

export function getMqttClient() {
  return mqttClient;
}