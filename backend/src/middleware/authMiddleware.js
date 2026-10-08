const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Missing or invalid authorization token'
            });
        }

        const token = authHeader.split(' ')[1];

        // Validate token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session'
            });
        }

        // Attach user to request
        req.user = data.user;
        next();

    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication'
        });
    }
};

module.exports = authMiddleware;
