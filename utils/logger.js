class Logger {
  static info(message, data = null) {
    console.log(`ℹ️  [INFO] ${message}`, data ? data : '');
  }

  static error(message, error = null) {
    console.error(`❌ [ERROR] ${message}`, error ? error : '');
  }

  static warn(message, data = null) {
    console.warn(`⚠️  [WARN] ${message}`, data ? data : '');
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, data ? data : '');
    }
  }

  static mqtt(message, data = null) {
    console.log(`📡 [MQTT] ${message}`, data ? data : '');
  }
}

export default Logger;