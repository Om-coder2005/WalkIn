// --- CLOUD FUNCTION: index.js (Node.js) ---

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Initialize Firebase Admin SDK (it picks up credentials automatically when deployed)
admin.initializeApp();

/**
 * HTTP function to securely handle multipart file uploads and proxy them to Firebase Storage.
 * This avoids client-side CORS issues.
 */
exports.uploadProfilePicture = functions.https.onRequest(async (req, res) => {
    // Enable CORS for the Cloud Function (allows your frontend to talk to it)
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // Send response to CORS preflight request
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 1. Authentication: Verify the user's ID token
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(403).send('Unauthorized: No ID token provided.');
    }
    
    const idToken = req.headers.authorization.split('Bearer ')[1];
    let decodedToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(403).send('Unauthorized: Invalid ID token.');
    }
    
    const uid = decodedToken.uid;
    const bucket = admin.storage().bucket();
    
    // 2. File Parsing using Busboy
    const busboy = BusBoy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    const uploads = {};

    busboy.on('file', (fieldname, file, info) => {
        const { filename, encoding, mimeType } = info;
        // Basic image validation
        if (!mimeType.startsWith('image/')) {
            file.resume();
            return res.status(400).send('Invalid file type. Only images are allowed.');
        }

        // Create a temporary file path
        const filepath = path.join(tmpdir, `upload_${uid}_${Date.now()}.jpg`);
        uploads[fieldname] = { filepath, mimeType };
        
        // Pipe the file stream to the temporary file on the server
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', async () => {
        try {
            const fileData = uploads['image']; // Assumes the form field is named 'image'
            if (!fileData) {
                return res.status(400).send('No image file provided.');
            }
            
            // Define the final destination in Firebase Storage
            const destinationPath = `profile-images/${uid}/profile.jpg`; 
            
            // 3. Upload to Firebase Storage
            await bucket.upload(fileData.filepath, {
                destination: destinationPath,
                metadata: {
                    contentType: fileData.mimeType,
                    cacheControl: 'public, max-age=31536000',
                    metadata: {
                        uploadedBy: uid
                    }
                },
            });
            
            // 4. Get the public download URL (signed for long-term access)
            const [url] = await bucket.file(destinationPath).getSignedUrl({
                action: 'read',
                expires: '03-01-2500', 
            });

            // 5. Cleanup and Response
            fs.unlinkSync(fileData.filepath); // Delete temp file

            res.status(200).send({ url });
            
        } catch (error) {
            console.error('Error during file processing or upload:', error);
            res.status(500).send(`Server error: ${error.message}`);
        }
    });

    // Handle stream end
    busboy.end(req.rawBody);
});