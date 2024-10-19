// server/routes.js
const express = require("express");
const { Worker } = require("worker_threads");
const {
    acquireLock,
    releaseLock,
    getLockTable,
} = require("./processes/lockManager");
const { logEvent, getLogBuffer } = require("./processes/logManager");
const { attendance } = require("./shared/attendance");
const { transactionBufferArray } = require("./shared/transactionBufferArray");
const { writeTransactions } = require("./processes/databaseWriter");
const router = express.Router();

// Handle banking transaction with lock management
router.post("/transaction", async (req, res) => {
    const { transactionId, amount, fromAccount, toAccount } = req.body;
    const transactionBuffer = req.app.locals.transactionBuffer; // Get the transaction buffer
    const logBuffer = req.app.locals.logBuffer; // Get the log buffer

    // Log transaction start
    await logEvent(logBuffer, `Transaction ${transactionId} started`, "info");

    // Try to acquire locks for both accounts
    const fromAccountLockAcquired = await acquireLock(
        fromAccount,
        transactionId
    );
    const toAccountLockAcquired = await acquireLock(toAccount, transactionId);
    if (!fromAccountLockAcquired || !toAccountLockAcquired) {
        // Release locks if acquired any
        releaseLock(fromAccount, transactionId);
        releaseLock(toAccount, transactionId);
        // log
        await logEvent(
            logBuffer,
            `Transaction ${transactionId} failed to acquire locks`,
            "warning"
        );
        return res.status(423).json({
            message:
                "One of the accounts is locked by another transaction, try again later.",
        });
    }

    // Log successful lock acquisition
    await logEvent(
        logBuffer,
        `Transaction ${transactionId} acquired locks for ${fromAccount} and ${toAccount}`,
        "info"
    );

    // Create a worker to handle the transaction
    const worker = new Worker("./server/processes/transactionWorker.js", {
        workerData: {
            transactionId,
            amount,
            fromAccount,
            toAccount,
            status: "processing",
            transactionBuffer, // Pass the buffer to the worker
        },
    });

    worker.on("message", async (message) => {
        // Log transaction completion
        await logEvent(
            logBuffer,
            `Transaction ${message.transactionId} completed`,
            "info"
        );

        // Release locks after the transaction is completed
        releaseLock(fromAccount, transactionId);
        releaseLock(toAccount, transactionId);

        //
        attendance.push(message.transactionId);
        console.log(attendance);
        transactionBufferArray.push(message.transaction);
        await writeTransactions(transactionBufferArray);
        //

        res.status(200).json({
            message: `Transaction ${message.transactionId} is ${message.status}`,
            status: message.status,
        });
    });

    worker.on("error", async (err) => {
        // Log transaction failure
        await logEvent(
            logBuffer,
            `Transaction ${transactionId} failed with error: ${err.message}`,
            "error"
        );

        // Release locks in case of error
        releaseLock(fromAccount, transactionId);
        releaseLock(toAccount, transactionId);

        res.status(500).json({
            error: "Transaction failed",
            details: err.message,
        });
    });
});

// Optional: Get lock table for debugging
router.get("/lock-table", (req, res) => {
    res.status(200).json(getLockTable());
});

// Get log buffer for debugging
router.get("/log-buffer", (req, res) => {
    const logBuffer = req.app.locals.logBuffer;
    res.status(200).json(getLogBuffer(logBuffer));
});

module.exports = router;
