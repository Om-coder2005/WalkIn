const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// 1. CORS Configuration
app.use(cors({ 
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'] 
}));

// 2. Define Storage Paths
const UPLOADS_BASE = path.join(__dirname, 'uploads');
const PROFILE_IMAGES_DIR = path.join(UPLOADS_BASE, 'profile-images');
const APPLICATION_DOCS_DIR = path.join(UPLOADS_BASE, 'application-docs');

// Ensure base directories exist
[UPLOADS_BASE, PROFILE_IMAGES_DIR, APPLICATION_DOCS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// 3. Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destination = PROFILE_IMAGES_DIR; 

        // Logic to switch destination based on CV upload marker
        // Note: userId must be sent BEFORE the file in the multipart form
        if (req.body.userId && req.body.userId.includes('-doc-')) {
            destination = APPLICATION_DOCS_DIR; 
        }

        cb(null, destination); 
    },
    filename: (req, file, cb) => {
        const userId = req.body.userId || 'unknown';
        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${userId}-${uniqueSuffix}${fileExtension}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('profileImage');

// 4. API Endpoints
app.post('/api/upload-profile-image', (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            console.error("General upload error:", err);
            return res.status(500).json({ message: 'Server error during file upload.' });
        }

        if (!req.file) {
             return res.status(400).json({ message: 'No file was uploaded.' });
        }

        const subfolder = req.file.destination === APPLICATION_DOCS_DIR ? 'application-docs' : 'profile-images';
        const publicImageUrl = `http://localhost:${port}/uploads/${subfolder}/${req.file.filename}`;

        console.log(`File uploaded successfully: ${req.file.filename}`);
        
        res.status(200).json({
            message: 'File uploaded successfully.',
            url: publicImageUrl
        });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// 5. Static File Serving
app.use('/uploads', express.static(UPLOADS_BASE));

// 6. Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 7. Start Server
app.listen(port, () => {
    console.log(`WalkIn Upload Server running at http://localhost:${port}`);
});