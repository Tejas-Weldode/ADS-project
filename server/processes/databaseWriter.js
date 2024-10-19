// server/processes/databaseWriter.js
const Transaction = require('../../models/Transaction');

async function writeTransactions(transactionBuffer) {
    while (true) {
        if (transactionBuffer.length > 0) {
            const transactionsToWrite = transactionBuffer.splice(0, transactionBuffer.length);

            // Insert all transactions into the database
            try {
                await Transaction.insertMany(transactionsToWrite);
                console.log(`Successfully saved ${transactionsToWrite.length} transactions to the database.`);
            } catch (error) {
                console.error("Error saving transactions:", error.message);
            }
        }

        // Wait for a specific interval before checking the buffer again
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Check every 5 seconds
    }
}

module.exports = { writeTransactions };
