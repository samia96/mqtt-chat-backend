# Documentation API - Chat Backend MQTT

## Base URL
```
http://localhost:3000/api
```

## Configuration requise

### MongoDB
Assurez-vous d'avoir MongoDB installé et en cours d'exécution :
```bash
# Installation sur Ubuntu/Debian
sudo apt-get install mongodb

# Démarrage du service
sudo systemctl start mongodb

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Broker MQTT
Installez et démarrez un broker MQTT (ex: Mosquitto) :
```bash
# Installation sur Ubuntu/Debian
sudo apt-get install mosquitto mosquitto-clients

# Démarrage du service
sudo systemctl start mosquitto

# Ou avec Docker
docker run -d -p 1883:1883 --name mosquitto eclipse-mosquitto
```

## Endpoints

### Utilisateurs

#### Créer un utilisateur
```http
POST /users
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com"
}
```

#### Récupérer tous les utilisateurs
```http
GET /users
```

#### Récupérer les utilisateurs en ligne
```http
GET /users/online
```

#### Récupérer un utilisateur
```http
GET /users/:userId
```

#### Mettre à jour le statut d'un utilisateur
```http
PUT /users/:userId/status
Content-Type: application/json

{
  "status": "online" // "online", "offline", "away"
}
```

### Chats

#### Créer un chat direct
```http
POST /chats/direct
Content-Type: application/json

{
  "user1_id": "uuid-user-1",
  "user2_id": "uuid-user-2"
}
```

#### Créer un chat de groupe
```http
POST /chats/group
Content-Type: application/json

{
  "creator_id": "uuid-creator",
  "participant_ids": ["uuid-user-1", "uuid-user-2"],
  "group_name": "Mon Groupe" // requis pour les groupes
}
```

#### Récupérer les chats d'un utilisateur
```http
GET /chats/user/:userId
```

### Messages

#### Envoyer un message
```http
POST /messages
Content-Type: application/json

{
  "chat_id": "uuid-chat",
  "sender_id": "uuid-sender",
  "content": "Hello world!",
  "message_type": "text" // optionnel
}
```

#### Récupérer les messages d'un chat
```http
GET /messages/chat/:chatId?limit=50&offset=0
```

#### Marquer un message comme lu
```http
PUT /messages/:messageId/read
Content-Type: application/json

{
  "user_id": "uuid-user"
}
```

#### Marquer tous les messages d'un chat comme lus
```http
PUT /messages/chat/:chatId/read
Content-Type: application/json

{
  "user_id": "uuid-user"
}
```

## Topics MQTT

### Messages
- **Topic**: `chat/{channel_id}/messages`
- **Payload**: Message complet avec metadata

### Accusés de lecture
- **Topic**: `chat/{channel_id}/read-receipts`
- **Payload**: Information de lecture

## Structure des données

### Utilisateur
```json
{
  "_id": "ObjectId",
  "username": "johndoe",
  "email": "john@example.com",
  "status": "online",
  "last_seen": "2025-01-27T10:00:00Z",
  "createdAt": "2025-01-27T09:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z"
}
```

### Chat
```json
{
  "_id": "ObjectId",
  "channel_id": "direct_user1_user2",
  "type": "direct",
  "name": null,
  "participants": ["ObjectId1", "ObjectId2"],
  "created_by": "ObjectId1",
  "last_activity": "2025-01-27T10:00:00Z",
  "settings": {
    "muted_by": [],
    "archived_by": []
  },
  "createdAt": "2025-01-27T09:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z"
}
```

### Message MQTT
```json
{
  "_id": "ObjectId",
  "chat_id": "ObjectId",
  "sender_id": "ObjectId", 
  "sender": {
    "_id": "ObjectId",
    "username": "johndoe"
  },
  "content": "Hello!",
  "message_type": "text",
  "createdAt": "2025-01-27T10:00:00Z",
  "read_by": [
    {
      "user_id": "ObjectId",
      "read_at": "2025-01-27T10:01:00Z"
    }
  ]
}