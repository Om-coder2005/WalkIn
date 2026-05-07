const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// 1. CORS Configuration
app.use(cors({ 
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'] 
}));

// 2. Define Storage Paths (These must be created by the system/user)
const profileUploadDir = path.join(__dirname, 'uploads/profile-images');
const docUploadDir = path.join(__dirname, 'uploads/application-docs');

// Create base uploads directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// 3. Multer Storage Configuration (saves to the local disk)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destination = profileUploadDir; 

        // Logic to switch destination based on CV upload marker
        if (req.body.userId && req.body.userId.includes('-doc-')) {
            destination = docUploadDir; 
        }

        // CRITICAL: Ensure the specific destination directory exists
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }

        cb(null, destination); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename using the userId and a timestamp
        const userId = req.body.userId || 'unknown';
        const fileExtension = path.extname(file.originalname);
        cb(null, `${userId}-${Date.now()}${fileExtension}`);
    }
});

// Multer upload middleware: expects the form field name 'profileImage'
const upload = multer({ storage: storage }).single('profileImage');

// 4. API Endpoint: POST /api/upload-profile-image
app.post('/api/upload-profile-image', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error("Upload error:", err);
            return res.status(500).json({ message: 'File upload failed on the server.' });
        }

        if (!req.file) {
             return res.status(400).json({ message: 'No file was uploaded.' });
        }

        // Determine the correct public URL based on the storage path
        let publicPath = 'profile-images'; 
        if (req.file.destination === docUploadDir) {
            publicPath = 'application-docs';
        }
        
        const publicImageUrl = `http://localhost:${port}/uploads/${publicPath}/${req.file.filename}`;

        console.log(`File uploaded successfully to: ${publicImageUrl}`);
        
        // Respond with the public URL
        res.status(200).json({
            message: 'File uploaded successfully.',
            url: publicImageUrl
        });
    });
});

// 5. Static File Serving (Must be defined after the endpoint, but essential)
// This allows both /uploads/profile-images and /uploads/application-docs to be accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Start Server
app.listen(port, () => {
    console.log(`Custom upload server running at http://localhost:${port}`);
});