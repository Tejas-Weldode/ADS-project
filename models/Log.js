const mongoose = require("mongoose");

// Define the schema for a log entry
const logSchema = new mongoose.Schema(
    {
        timestamp: { type: Date, default: Date.now },
        message: { type: String, required: true },
        level: {
            type: String,
            enum: ["info", "warning", "error"], // Define log levels
            default: "info",
        },
    },
    { timestamps: true }
);

// Create the Log model
const Log = mongoose.model("Log", logSchema);

module.exports = { Log };
