const mongoose = require("mongoose");

// Define the lock schema
const lockSchema = new mongoose.Schema({
    transactionId: { type: String, required: true },
    accountId: { type: String, required: true },
    lockStatus: { type: String, required: true }, // 'requested', 'locked', 'released'
    requestedAt: { type: Date, required: true },
    acquiredAt: { type: Date },
    releasedAt: { type: Date },
});

// Create the Lock model
const Lock = mongoose.model("Lock", lockSchema);

module.exports = { Lock };
