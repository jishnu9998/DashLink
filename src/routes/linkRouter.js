const express = require('express');
const path = require('path');
const { createUniqueLink } = require('../controllers/createUniqueLink');

const db = require('../models');
const generateQRCode = require('../controllers/createQR');

const linkRouter = express.Router();

linkRouter.post('/api/generateLink', (req, res, next) => {
    const { link } = req.body;

    if(!req.session.userId) {
        return res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
    }
    
    if (!link) {
        return res.status(400).json({
            status: 400,
            message: 'Link cannot be empty'
        })
    }  

    if (!link.startsWith('https://') && !link.startsWith('http://')) {
        return res.status(400).json({
            status: 400,
            message: 'Link must start with http:// or https://'
        })
    }

    const uniqueLink = createUniqueLink();

    db.links.create({
        creator_id: req.session.userId, 
        url: link, 
        shortUrl: uniqueLink
    })

    generateQRCode(uniqueLink);
    res.status(200).json({
        status: 200,
        message: 'endpoints created successfully',
        origin: link,
        link: process.env.ROOT_NAME+ "/" + uniqueLink,
        qrCode: process.env.ROOT_NAME+ "/media/qr/" + uniqueLink 
    })
})

linkRouter.delete('/api/deleteLink', (req, res, next) => {
    if(!req.session.userId) {
        return res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
    }
    const { shortUrl } = req.body;
    try {
        db.links.destroy({
            where: {
                shortUrl: shortUrl
            }
        })

        // Remove the file named shortUrl.png from ../controllers/public folder

        require('fs').unlinkSync(path.dirname(path.dirname(__dirname)) +'/public/' + shortUrl + '.png');

        res.status(200).json({
            status: 200,
            message: 'endpoint deleted successfully'
        })
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 404,
            message: 'Not found'
        })
    }
    
})

linkRouter.patch('/api/editLink', async (req, res, next) => {
    if(!req.session.userId) {
        return res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
    }

    try {
        const { shortUrl, newUrl } = req.body;

        console.log(shortUrl, newUrl);
        if(newUrl === undefined) {
            return res.status(400).json({
                status: 400,
                message: "New Url not provided"
            })
        }
        const linkInstance = await db.links.findOne({
            where: {
                shortUrl: shortUrl
            }
        })

        linkInstance.url = newUrl;
        linkInstance.save();

        res.status(200).json({
            status: 200,
            message: "Link has been updated sucessfully"
        });
    } catch(err) {
        next(err);
    }
})

linkRouter.get('/:shortUrl', async (req, res) => {
    try {
        result = await db.links.findOne({
            where: {
                shortUrl: req.params.shortUrl
            }
        })

        link = result.url;

        result.views += 1;
        result.save();

        res.redirect(link);
    } catch (err) {
        res.status(404).json({
            status: 404,
            message: 'Not found'
        })
    }
})

linkRouter.get('/api/getStats', async (req, res, next) => {

    if(!req.session.userId) {
        return res.status(401).json({
            status: 401,
            message: 'Unauthorized'
        })
    }

    const { shortUrl } = req.body;

    if(!shortUrl) {
        res.status(400).json({
            status: 400,
            message: "ShortUrl not entered"
        })
    }

    try {
        const linkInstance = await db.links.findOne({
            where: {
                shortUrl: shortUrl
            }
        })
        
        const user = await db.users.findOne({
            where: {
                id: linkInstance.creator_id
            }
        })

        res.status(200).json({
            status: 200,
            creator_name: user.username,
            shortUrl: shortUrl,
            pointsAt: linkInstance.url,
            views: linkInstance.views,
            createdAt: Date(linkInstance.created_at),
            updatedAt: Date(linkInstance.updated_at)
        })
        
    } catch (err) {
        res.status(404).json({
            status: 404,
            message: "not found"
        })
    }

})

module.exports = linkRouter