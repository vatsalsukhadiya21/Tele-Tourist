const supabase = require('../config/supabase');

const getExploreStories = async (req, res) => {
    try {
        const search = req.query.search || '';
        const category = req.query.category || '';
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        let selectQuery = `
            id, title, description, location, created_at,
            category:categories!inner(id, name),
            author:profiles(id, full_name, username, profile_image_url),
            images:story_images(image_url, display_order)
        `;

        let query = supabase
            .from('stories')
            .select(selectQuery)
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
        }

        if (category && category !== 'All') {
            query = query.eq('categories.name', category);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) {
            console.error('Explore query error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch explore stories' });
        }

        // Process data to map cover_image
        const stories = data.map(story => {
            let cover_image = null;
            if (story.images && story.images.length > 0) {
                // sort by display_order ascending
                story.images.sort((a, b) => a.display_order - b.display_order);
                cover_image = story.images[0];
            }
            
            // Delete the full images array to save bandwidth if we only need cover_image
            delete story.images;

            return {
                ...story,
                cover_image
            };
        });

        return res.status(200).json({ success: true, stories });

    } catch (err) {
        console.error('Get explore stories error:', err);
        return res.status(500).json({ success: false, message: 'An internal server error occurred' });
    }
};

module.exports = {
    getExploreStories
};
