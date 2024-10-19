// server/processes/databaseWriter.js
const Transaction = require("../../models/Transaction");

async function writeTransactions(transactionBuffer) {
    console.log("transactionBuffer", transactionBuffer);
    // Check if there are transactions to write
    if (transactionBuffer.length > 1) {
        console.log("...trying");
        // Remove transactions from the buffer to write
        const transactionsToWrite = transactionBuffer.splice(
            0,
            transactionBuffer.length
        );

        try {
            // Insert all transactions into the database
            await Transaction.insertMany(transactionsToWrite);
            console.log(
                `Successfully saved ${transactionsToWrite.length} transactions to the database.`
            );

            return true;
        } catch (error) {
            console.error("Error saving transactions:", error.message);
            // You might want to re-push the transactions back to the buffer if the write fails
            transactionBuffer.push(...transactionsToWrite);
            return false;
        }
    }
}

module.exports = { writeTransactions };
