import Joi from 'joi';

// Schémas de validation
const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required()
});

const createDirectChatSchema = Joi.object({
  user1_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  user2_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

const createGroupChatSchema = Joi.object({
  creator_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  participant_ids: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  group_name: Joi.string().min(1).max(100).required()
});

const sendMessageSchema = Joi.object({
  chat_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  sender_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  content: Joi.string().min(1).max(5000).required(),
  message_type: Joi.string().valid('text', 'image', 'file', 'emoji').optional()
});

const markAsReadSchema = Joi.object({
  user_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('online', 'offline', 'away').required()
});

// Fonctions de validation
export const validateCreateUser = (req, res, next) => {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateCreateDirectChat = (req, res, next) => {
  const { error } = createDirectChatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateCreateGroupChat = (req, res, next) => {
  const { error } = createGroupChatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateSendMessage = (req, res, next) => {
  const { error } = sendMessageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateMarkAsRead = (req, res, next) => {
  const { error } = markAsReadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

export const validateUpdateStatus = (req, res, next) => {
  const { error } = updateStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};