// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true },
    data: {
        amount: { type: Number, required: true },
        fromAccount: { type: String, required: true },
        toAccount: { type: String, required: true }
    },
    status: { type: String, default: 'processing' }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
