const supabase = require('../config/supabase');

// Helper for validation
const validateStory = (title, description, location, categoryId) => {
    if (!title || title.trim().length === 0) return 'Story title is required';
    if (title.length > 255) return 'Story title is too long';
    if (!description || description.trim().length === 0) return 'Story description is required';
    if (!location || location.trim().length === 0) return 'Location is required';
    if (location.length > 255) return 'Location is too long';
    if (!categoryId) return 'Category is required';
    return null;
};

const createStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, location, categoryId } = req.body;

        const validationError = validateStory(title, description, location, categoryId);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        // Verify category exists
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('id', categoryId)
            .single();

        if (catError || !category) {
            return res.status(400).json({ success: false, message: 'Invalid category selected' });
        }

        // Create story
        const { data, error } = await supabase
            .from('stories')
            .insert({
                user_id: userId,
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                category_id: categoryId
            })
            .select()
            .single();

        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to create story' });
        }

        return res.status(201).json({
            success: true,
            message: 'Story created successfully',
            story: data
        });

    } catch (err) {
        console.error('Create story error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

const getStory = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('stories')
            .select(`
                id, title, description, location, created_at, updated_at,
                category:categories(id, name),
                author:profiles(id, full_name, username, profile_image_url),
                images:story_images(id, image_url, display_order, cloudinary_public_id)
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }
        
        // Sort images correctly
        if (data.images && data.images.length > 0) {
            data.images.sort((a, b) => a.display_order - b.display_order);
        }

        return res.status(200).json({ success: true, story: data });
    } catch (err) {
        console.error('Get story error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

const getMyStories = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('stories')
            .select(`
                id, title, description, location, created_at, updated_at,
                category:categories(id, name)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to fetch stories' });
        }

        return res.status(200).json({ success: true, stories: data });
    } catch (err) {
        console.error('Get my stories error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

const updateStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, description, location, categoryId } = req.body;

        const validationError = validateStory(title, description, location, categoryId);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        // Verify ownership
        const { data: story, error: findError } = await supabase
            .from('stories')
            .select('user_id')
            .eq('id', id)
            .single();

        if (findError || !story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        if (story.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not own this story' });
        }

        // Verify category exists
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('id', categoryId)
            .single();

        if (catError || !category) {
            return res.status(400).json({ success: false, message: 'Invalid category selected' });
        }

        // Update
        const { data: updatedStory, error: updateError } = await supabase
            .from('stories')
            .update({
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                category_id: categoryId,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(500).json({ success: false, message: 'Failed to update story' });
        }

        return res.status(200).json({
            success: true,
            message: 'Story updated successfully',
            story: updatedStory
        });

    } catch (err) {
        console.error('Update story error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

const deleteStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Verify ownership
        const { data: story, error: findError } = await supabase
            .from('stories')
            .select('user_id')
            .eq('id', id)
            .single();

        if (findError || !story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        if (story.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not own this story' });
        }

        // Delete
        const { error: deleteError } = await supabase
            .from('stories')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return res.status(500).json({ success: false, message: 'Failed to delete story' });
        }

        return res.status(200).json({
            success: true,
            message: 'Story deleted successfully'
        });

    } catch (err) {
        console.error('Delete story error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

const getCategories = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name');

        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
        }

        return res.status(200).json({ success: true, categories: data });
    } catch (err) {
        console.error('Get categories error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

module.exports = {
    createStory,
    getStory,
    getMyStories,
    updateStory,
    deleteStory,
    getCategories
};
