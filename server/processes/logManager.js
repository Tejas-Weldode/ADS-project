// server/processes/logManager.js
const { Log } = require("../../models/Log");

async function logEvent(logBuffer, message, level = "info") {
    const logEntry = {
        timestamp: new Date(),
        message,
        level, // 'info', 'warning', 'error', etc.
    };

    logBuffer.push(logEntry);

    // Log Writer Process
    if (logBuffer.length > 10) {
        console.log("...trying to write logs")
        // Take all logs out of the buffer
        const logsToWrite = logBuffer.splice(0, logBuffer.length);
        try {
            // Insert the logs into the database
            await Log.insertMany(logsToWrite);
            console.log(
                `Successfully saved ${logsToWrite.length} logs to the database.`
            );
        } catch (error) {
            console.error("Error saving logs to the database:", error.message);

            // Optional: Push logs back to the buffer if saving fails
            logBuffer.push(...logsToWrite);
        }
    }
}

function getLogBuffer(logBuffer) {
    return logBuffer; // Return the logs for debugging or inspection
}

module.exports = { logEvent, getLogBuffer };
