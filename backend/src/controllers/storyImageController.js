const supabase = require('../config/supabase');
const cloudinary = require('../config/cloudinary');

const uploadImages = async (req, res) => {
    // Array to track uploaded public_ids for rollback if something fails
    const uploadedPublicIds = [];

    try {
        const userId = req.user.id;
        const { id: storyId } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images provided' });
        }

        // 1. Verify story ownership
        const { data: story, error: findError } = await supabase
            .from('stories')
            .select('user_id')
            .eq('id', storyId)
            .single();

        if (findError || !story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        if (story.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not own this story' });
        }

        // 2. Upload each file to Cloudinary
        const cloudinaryUploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `tele-tourist/stories/${storyId}`
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const cloudinaryResults = await Promise.all(cloudinaryUploadPromises);

        // Track them in case database insertion fails
        cloudinaryResults.forEach(result => {
            uploadedPublicIds.push(result.public_id);
        });

        // 3. Get current max display_order
        const { data: currentImages, error: currentError } = await supabase
            .from('story_images')
            .select('display_order')
            .eq('story_id', storyId)
            .order('display_order', { ascending: false })
            .limit(1);

        let nextOrder = 1;
        if (!currentError && currentImages && currentImages.length > 0) {
            nextOrder = currentImages[0].display_order + 1;
        }

        // 4. Insert into Supabase
        const dbInsertPromises = cloudinaryResults.map((result) => {
            const insertData = {
                story_id: storyId,
                image_url: result.secure_url,
                cloudinary_public_id: result.public_id,
                display_order: nextOrder++
            };
            
            return supabase
                .from('story_images')
                .insert(insertData)
                .select()
                .single();
        });

        const dbResults = await Promise.all(dbInsertPromises);

        // Check if any db insertions failed
        const failedInsert = dbResults.find(res => res.error);
        if (failedInsert) {
            throw new Error('Database insertion failed for one or more images');
        }

        const successfullyInsertedImages = dbResults.map(res => res.data);

        return res.status(201).json({
            success: true,
            message: 'Images uploaded successfully',
            images: successfullyInsertedImages
        });

    } catch (err) {
        console.error('Upload images error:', err);

        // Cleanup: Delete assets from Cloudinary if upload partially succeeded but later failed
        if (uploadedPublicIds.length > 0) {
            try {
                await Promise.all(uploadedPublicIds.map(id => cloudinary.uploader.destroy(id)));
                console.log('Cleanup successful for:', uploadedPublicIds);
            } catch (cleanupErr) {
                console.error('Cleanup failed for some Cloudinary assets:', cleanupErr);
            }
        }

        return res.status(500).json({ success: false, message: 'An internal server error occurred during upload' });
    }
};

const deleteImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storyId, imageId } = req.params;

        // 1. Verify story ownership
        const { data: story, error: findError } = await supabase
            .from('stories')
            .select('user_id')
            .eq('id', storyId)
            .single();

        if (findError || !story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        if (story.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not own this story' });
        }

        // 2. Fetch the image to get cloudinary_public_id
        const { data: image, error: imageError } = await supabase
            .from('story_images')
            .select('cloudinary_public_id')
            .eq('id', imageId)
            .eq('story_id', storyId) // Ensure it belongs to the story
            .single();

        if (imageError || !image) {
            return res.status(404).json({ success: false, message: 'Image not found in this story' });
        }

        // 3. Delete from Cloudinary
        const cloudinaryResult = await cloudinary.uploader.destroy(image.cloudinary_public_id);
        
        // Cloudinary typically returns { result: 'ok' } or 'not found'
        if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
            console.error('Cloudinary destroy error:', cloudinaryResult);
            return res.status(500).json({ success: false, message: 'Failed to delete image from cloud storage' });
        }

        // 4. Delete from Supabase
        const { error: deleteError } = await supabase
            .from('story_images')
            .delete()
            .eq('id', imageId);

        if (deleteError) {
            return res.status(500).json({ success: false, message: 'Failed to delete image record' });
        }

        return res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (err) {
        console.error('Delete image error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

module.exports = {
    uploadImages,
    deleteImage
};
