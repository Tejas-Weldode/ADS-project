// server/app.js (Updated)
const mongoose = require('mongoose');
const express = require('express');
const routes = require('./routes');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/transactionDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
