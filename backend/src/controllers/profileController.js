const supabase = require('../config/supabase');

const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, username, bio, profile_image_url, email, created_at')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            profile: data
        });

    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, username, bio } = req.body;

        if (!fullName || !username) {
            return res.status(400).json({
                success: false,
                message: 'Full name and username are required'
            });
        }

        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
            });
        }

        // Check if username is already taken by someone else
        const { data: existingUser, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .neq('id', userId)
            .single();
            
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username is already taken'
            });
        }

        // Proceed to update
        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                username: username,
                bio: bio || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select('id, full_name, username, bio, profile_image_url, email, created_at')
            .single();

        if (error) {
            // Handle unique violation just in case of race condition
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: data
        });

    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, username, bio, profile_image_url') // Email intentionally omitted
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            profile: data
        });

    } catch (err) {
        console.error('Get public profile error:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getPublicProfile
};
