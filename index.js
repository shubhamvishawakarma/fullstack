require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Example import for user routes
const app = express();




// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.BASE_URL || 4000
// const dbUri = process.env.DB_URI;
// const uploadsDir = process.env.UPLOADS_DIR;

// Ensure the uploads directory exists
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Mongoose connect
mongoose.connect(`${process.env.DATABASE}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes); // Mount user routes under /api/users

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
