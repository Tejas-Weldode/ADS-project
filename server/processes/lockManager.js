// server/processes/lockManager.js
const { Lock } = require("../../models/Lock");
const { lockTable } = require("../shared/lockTable");

const locks = new Map();

async function acquireLock(
    accountId,
    transactionId,
    maxRetries = 3,
    retryDelay = 1000
) {
    const requestedAt = new Date();

    // Record the lock request
    lockTable.push({
        transactionId,
        accountId,
        lockStatus: "requested",
        requestedAt,
        acquiredAt: null,
        releasedAt: null,
    });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        // Check if the account is already locked
        if (!locks.has(accountId)) {
            const acquiredAt = new Date();
            locks.set(accountId, true); // Acquire the lock

            // Update the lock table when the lock is acquired
            const lockRecord = lockTable.find(
                (entry) =>
                    entry.transactionId === transactionId &&
                    entry.accountId === accountId &&
                    entry.lockStatus === "requested"
            );
            if (lockRecord) {
                lockRecord.lockStatus = "locked";
                lockRecord.acquiredAt = acquiredAt;
            }

            saveLockTable();
            return true; // Lock successfully acquired
        }

        // If the lock is not acquired, wait for the specified retryDelay before the next attempt
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    await saveLockTable();
    return false; // Failed to acquire lock after retries
}

async function releaseLock(accountId, transactionId) {
    const releasedAt = new Date();

    // Remove the lock from the active locks
    locks.delete(accountId);

    // Update the lock table when the lock is released
    const lockRecord = lockTable.find(
        (entry) =>
            entry.transactionId === transactionId &&
            entry.accountId === accountId &&
            entry.lockStatus === "locked"
    );
    if (lockRecord) {
        lockRecord.lockStatus = "released";
        lockRecord.releasedAt = releasedAt;
    }

    await saveLockTable();
}

function getLockTable() {
    return lockTable;
}

// Save the lock table to the database
async function saveLockTable() {
    try {
        if (lockTable.length > 3) {
            await Lock.insertMany(lockTable);
            console.log(
                `Successfully saved ${lockTable.length} lock entries to the database.`
            );
        }
    } catch (error) {
        console.error("Error saving locks to the database:", error.message);
    }
}

module.exports = { acquireLock, releaseLock, getLockTable };
