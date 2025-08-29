export const errorHandler = (error, req, res, next) => {
  console.error('❌ Erreur:', error);

  // Erreur Supabase
  if (error.code && error.message) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }

  // Erreur de validation Joi
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  // Erreur MQTT
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Service MQTT temporairement indisponible'
    });
  }

  // Erreur générique
  return res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
};