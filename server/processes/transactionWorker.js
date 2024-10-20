// server/processes/transactionWorker.js
const { parentPort, workerData } = require("worker_threads");
const { logEvent } = require("./logManager"); // Import logEvent

const run = () => {
    try {
        const transactionBuffer = workerData.transactionBuffer; // Get buffer from worker data

        // Push the transaction to the buffer
        transactionBuffer.push({
            transactionId: workerData.transactionId,
            data: {
                amount: workerData.amount,
                fromAccount: workerData.fromAccount,
                toAccount: workerData.toAccount,
            },
            status: workerData.status,
            createdAt: new Date(), // Timestamp
        });

        // Simulate processing delay
        setTimeout(() => {
            parentPort.postMessage({
                status: "completed",
                transactionId: workerData.transactionId,
                transaction: transactionBuffer[0],
            });
        }, 5000);
    } catch (error) {
        logEvent(
            logBuffer,
            `Error processing transaction ${workerData.transactionId}: ${error.message}`,
            "error"
        );
        parentPort.postMessage({ status: "error", message: error.message });
    }
};

run();
