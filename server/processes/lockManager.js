// server/processes/lockManager.js
const locks = new Map();
const lockTable = []; // Array to store lock information

function acquireLock(accountId, transactionId) {
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

    // Check if the account is already locked
    if (locks.has(accountId)) {
        return false; // Lock is already held by another transaction
    }

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

    return true;
}

function releaseLock(accountId, transactionId) {
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
}

function getLockTable() {
    return lockTable;
}

module.exports = { acquireLock, releaseLock, getLockTable };
