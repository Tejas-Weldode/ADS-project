// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true },
    data: { type: Object, required: true },
    status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
