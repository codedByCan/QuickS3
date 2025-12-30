const express = require('express');
const router = express.Router();
const Minio = require('minio');

if (!process.env.MINIO_ENDPOINT) {
    require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
}

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USESSL === 'true',
    accessKey: process.env.MINIO_ACCESS,
    secretKey: process.env.MINIO_SECRET
});

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

router.use(requireAuth);

router.get('/buckets', async (req, res) => {
    try {
        const buckets = await minioClient.listBuckets();
        res.json(buckets);
    } catch (err) {
        console.error('Error listing buckets:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/files/:bucket', (req, res) => {
    const bucket = req.params.bucket;
    const prefix = req.query.prefix || '';
    const stream = minioClient.listObjectsV2(bucket, prefix, true);
    const files = [];

    stream.on('data', obj => files.push(obj));
    stream.on('error', err => {
        console.error('Error listing files:', err);
        res.status(500).json({ error: err.message });
    });
    stream.on('end', () => res.json(files));
});

router.get('/folders/:bucket', (req, res) => {
    const bucket = req.params.bucket;
    const prefix = req.query.prefix || '';
    const stream = minioClient.listObjectsV2(bucket, prefix, false, '/'); 
    const folders = [];

    stream.on('data', obj => {
        if (obj.prefix) folders.push(obj.prefix);
    });
    stream.on('error', err => {
        console.error('Error listing folders:', err);
        res.status(500).json({ error: err.message });
    });
    stream.on('end', () => res.json(folders));
});

router.get('/file/:bucket', async (req, res) => {
    const bucket = req.params.bucket;
    const filename = req.query.name;

    try {
        const dataStream = await minioClient.getObject(bucket, filename);
        let content = '';
        dataStream.on('data', chunk => content += chunk);
        dataStream.on('end', () => res.send(content));
        dataStream.on('error', err => {
            console.error('Error reading file stream:', err);
            res.status(500).json({ error: err.message });
        });
    } catch (err) {
        console.error('Error getting object:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/file/:bucket', async (req, res) => {
    const bucket = req.params.bucket;
    const { name, content } = req.body;

    try {
        await minioClient.putObject(bucket, name, content);
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving file:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/file/:bucket', async (req, res) => {
    const bucket = req.params.bucket;
    const filename = req.query.name;

    try {
        await minioClient.removeObject(bucket, filename);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/rename/:bucket', async (req, res) => {
    const bucket = req.params.bucket;
    const { oldName, newName } = req.body;

    try {
        const conds = new Minio.CopyConditions();
        await minioClient.copyObject(bucket, newName, `/${bucket}/${oldName}`, conds);
        await minioClient.removeObject(bucket, oldName);
        res.json({ success: true });
    } catch (err) {
        console.error('Error renaming file:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;