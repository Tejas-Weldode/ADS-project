// server/processes/lockManager.js
const locks = new Map();

function acquireLock(accountId) {
    if (locks.has(accountId)) {
        return false; // Lock is already held by another transaction
    }

    locks.set(accountId, true); // Acquire the lock
    return true;
}

function releaseLock(accountId) {
    locks.delete(accountId); // Release the lock
}

module.exports = { acquireLock, releaseLock };
