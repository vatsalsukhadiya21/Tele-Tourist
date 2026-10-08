const supabase = require('../config/supabase');

const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Basic validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and password are required'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Call Supabase Auth sign-up
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            session: data.session
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

const getMe = async (req, res) => {
    try {
        // User is attached to req by authMiddleware
        const user = req.user;
        
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.user_metadata?.full_name || 'Unknown'
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};
