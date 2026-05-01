/**
 * Logger Utility
 * Centralized logging for the application
 */

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

class Logger {
  static formatLog(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...data,
    });
  }

  static writeLog(level, message, data = {}) {
    const logEntry = this.formatLog(level, message, data);
    console.log(logEntry);

    // Also write to file in production
    if (process.env.NODE_ENV === 'production') {
      try {
        fs.appendFileSync(logFile, logEntry + '\n');
      } catch (err) {
        console.error('Failed to write log file:', err);
      }
    }
  }

  static info(message, data = {}) {
    this.writeLog('INFO', message, data);
  }

  static error(message, data = {}) {
    this.writeLog('ERROR', message, data);
  }

  static warn(message, data = {}) {
    this.writeLog('WARN', message, data);
  }

  static debug(message, data = {}) {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog('DEBUG', message, data);
    }
  }
}

module.exports = Logger;
