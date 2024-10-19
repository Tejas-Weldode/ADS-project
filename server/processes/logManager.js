// server/processes/logManager.js

function logEvent(logBuffer, message, level = "info") {
    const logEntry = {
        timestamp: new Date(),
        message,
        level, // 'info', 'warning', 'error', etc.
    };

    logBuffer.push(logEntry);

    // Optional: Limit log buffer size (e.g., 1000 entries) to prevent overflow
    if (logBuffer.length > 1000) {
        logBuffer.shift(); // Remove the oldest entry if the buffer is full
    }
}

function getLogBuffer(logBuffer) {
    return logBuffer; // Return the logs for debugging or inspection
}

module.exports = { logEvent, getLogBuffer };
