const express = require('express');
const telemetryRouter = express.Router();
const db = require('../models');

telemetryRouter.get('/api/getStats', async (req, res) => {
    if(!req.session.userId) {
        return res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
    }

    const { shortUrl } = req.body;

    try {
        const result = await db.links.findOne({ where: { shortUrl: shortUrl } });
        views = result.views;

        res.status(200).json({
            status: 200,
            message: 'success',
            views: views
        })
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 404,
            message: 'Not found'
        })
    }
})