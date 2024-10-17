// server/routes.js
const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Simulate a banking transaction
router.post('/transaction', async (req, res) => {
    const { transactionId, amount, fromAccount, toAccount } = req.body;

    try {
        // Simulate a transaction process (simplified for testing)
        const newTransaction = new Transaction({
            transactionId,
            data: { amount, fromAccount, toAccount },
            status: 'processing'
        });

        await newTransaction.save();

        res.status(200).json({
            message: `Transaction ${transactionId} is processing`,
            transaction: newTransaction
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process transaction' });
    }
});

module.exports = router;
