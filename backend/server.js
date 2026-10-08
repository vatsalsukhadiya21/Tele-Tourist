const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./src/config/supabase');

const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const storyRoutes = require('./src/routes/storyRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const exploreRoutes = require('./src/routes/exploreRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/explore', exploreRoutes);

// Basic health-check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Tele Tourist backend is running'
    });
});

// Database health-check route
app.get('/api/health/db', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({
            success: false,
            message: 'Supabase client is not configured'
        });
    }

    try {
        // Minimal safe query to verify connection
        const { error } = await supabase.from('categories').select('id').limit(1);
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Supabase connection is working'
        });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to connect to Supabase database',
            error: err.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
