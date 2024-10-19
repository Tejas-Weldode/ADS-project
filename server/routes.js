// server/routes.js
const express = require("express");
const { Worker } = require("worker_threads");
const {
    acquireLock,
    releaseLock,
    getLockTable,
} = require("./processes/lockManager");
const router = express.Router();

// Handle banking transaction with lock management
router.post("/transaction", (req, res) => {
    const { transactionId, amount, fromAccount, toAccount } = req.body;
    const transactionBuffer = req.app.locals.transactionBuffer; // Get the transaction buffer

    // Try to acquire locks for both accounts
    if (
        !acquireLock(fromAccount, transactionId) ||
        !acquireLock(toAccount, transactionId)
    ) {
        return res.status(423).json({
            message:
                "One of the accounts is locked by another transaction, try again later.",
        });
    }

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

    worker.on("message", (message) => {
        // Release locks after the transaction is completed
        releaseLock(fromAccount, transactionId);
        releaseLock(toAccount, transactionId);

        res.status(200).json({
            message: `Transaction ${message.transactionId} is ${message.status}`,
            status: message.status,
        });
    });

    worker.on("error", (err) => {
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

module.exports = router;
