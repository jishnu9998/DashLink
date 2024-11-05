const path = require("path");
const fs = require("fs");
const express = require("express");

const fileServer = express.Router();


fileServer.get('/media/qr/:filename', (req, res, next) => {
    // Serve static files from public folder and return 404 if not found

    fileName = req.params.filename + ".png";

    if (!fs.existsSync(path.dirname(path.dirname(__dirname)) + '/public/' + fileName)) {
        return res.status(404).json({
            status: 404,
            message: 'File not found'
        })
    }
    res.sendFile(path.dirname(path.dirname(__dirname)) + '/public/' + fileName);
    next();
})

module.exports = fileServer;
