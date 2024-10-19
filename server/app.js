// server/app.js
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const { writeTransactions } = require('./processes/databaseWriter'); // Import database writer

const app = express();
app.use(express.json());

// Create in-memory buffers for transactions and logs
const transactionBuffer = [];
const logBuffer = [];

// Set buffers as app locals so they can be accessed in other files
app.locals.transactionBuffer = transactionBuffer;
app.locals.logBuffer = logBuffer;

// MongoDB connection
mongoose
    .connect("mongodb://127.0.0.1:27017/transactionDB")
    .then(() => {
        console.log("MongoDB connected. Starting database writer...");
        writeTransactions(transactionBuffer); // Start the database writer
    })
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
