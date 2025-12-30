require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'minio-editor-secret-key', 

    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 

}));

app.use('/api/auth', authRoutes);
app.use('/api/minio', fileRoutes);

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/selection');
    }
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/selection', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/selection.html'));
});

app.get('/editor', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/editor.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

