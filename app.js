const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./src/models');
const authRouter = require('./src/routes/auth');
const linkRouter = require('./src/routes/linkRouter');
const authenticate = require('./src/middleware/authenticate');
const staticFiles = require('./src/routes/fileServe');
const errorHandler = require('./src/middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Sync database
db.sequelize.sync();

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'Hey There Human, this is DashLink.'
    });
});

app.use('/', authRouter);
app.use('/', linkRouter);
app.use('/',staticFiles);

// Authentication middleware
app.use(authenticate);

// Error Middleware
app.use(errorHandler.notFound);
app.use(errorHandler.serverError);


// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
