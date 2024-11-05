const express = require('express');
const path = require('path');
const { createUniqueLink } = require('../controllers/createUniqueLink');

const db = require('../models');
const generateQRCode = require('../controllers/createQR');
const { link } = require('fs');

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
        qrCode: process.env.ROOT_NAME+ "/media/qr/" + uniqueLink + ".png"
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

        console.log(linkInstance);
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

        link1 = result.url;

        result.views += 1;
        result.save();

        res.redirect(link1);
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status: 404,
            message: 'Not found'
        })
    }
})

module.exports = linkRouter