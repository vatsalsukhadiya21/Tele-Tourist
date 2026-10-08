const multer = require('multer');

// Configure multer storage
// We'll use memory storage because we upload directly to Cloudinary via the SDK
const storage = multer.memoryStorage();

// File validation
const fileFilter = (req, file, cb) => {
    // Only accept JPEG, PNG, WEBP
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG and WEBP images are allowed'), false);
    }
};

// 5 MB limit per file
const limits = {
    fileSize: 5 * 1024 * 1024,
    files: 10 // Max 10 files per request
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

// Middleware to handle Multer errors cleanly
const uploadMiddleware = (req, res, next) => {
    const uploadArray = upload.array('images', 10);
    
    uploadArray(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g., file too large, too many files)
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            // An unknown error occurred (e.g., invalid file type from fileFilter)
            return res.status(400).json({ success: false, message: err.message });
        }
        
        // Everything went fine
        next();
    });
};

module.exports = uploadMiddleware;
