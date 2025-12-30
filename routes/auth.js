const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        try {
            const users = JSON.parse(data);
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                req.session.user = user;
                req.session.save();
                return res.json({ success: true });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (parseError) {
            console.error(parseError);
            return res.status(500).json({ success: false, message: 'Error parsing user data' });
        }
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;