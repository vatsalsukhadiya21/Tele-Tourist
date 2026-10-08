const API_URL = 'http://localhost:5000/api';

/**
 * Common Authentication operations
 */
const Auth = {
    // Save session data to local storage
    setSession(session) {
        if (!session) return;
        localStorage.setItem('tt_access_token', session.access_token);
        localStorage.setItem('tt_refresh_token', session.refresh_token);
        // Sometimes Supabase returns user inside session, we can save user info as well
        if (session.user) {
            localStorage.setItem('tt_user', JSON.stringify(session.user));
        }
    },

    // Get current access token
    getToken() {
        return localStorage.getItem('tt_access_token');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },

    // Get basic user info from storage
    getUser() {
        const userStr = localStorage.getItem('tt_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    // Clear local session data
    clearSession() {
        localStorage.removeItem('tt_access_token');
        localStorage.removeItem('tt_refresh_token');
        localStorage.removeItem('tt_user');
    },

    // Perform logout
    logout() {
        this.clearSession();
        window.location.href = 'login.html';
    },

    // Register a new user
    async register(fullName, email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, message: 'Network error or server unavailable' };
        }
    },

    // Login a user
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success && data.session) {
                this.setSession(data.session);
            }
            
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, message: 'Network error or server unavailable' };
        }
    },

    // Fetch current user from server
    async fetchMe() {
        const token = this.getToken();
        if (!token) return { success: false, message: 'No token' };

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Fetch me failed:', error);
            return { success: false, message: 'Network error or server unavailable' };
        }
    },

    // Protect routes that require auth
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    },

    // Update navigation UI based on auth state
    updateNav() {
        const authLinks = document.getElementById('auth-links');
        if (!authLinks) return;

        if (this.isAuthenticated()) {
            authLinks.innerHTML = `
                <li class="nav-item"><a class="nav-link" href="create-story.html">Create Story</a></li>
                <li class="nav-item"><a class="nav-link" href="my-stories.html">My Stories</a></li>
                <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
                <li class="nav-item"><a class="nav-link" href="#" id="logout-btn">Logout</a></li>
            `;
            
            // Attach logout event
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        } else {
            authLinks.innerHTML = `
                <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
                <li class="nav-item"><a class="nav-link" href="register.html">Sign Up</a></li>
            `;
        }
    }
};

// Initialize UI state on document load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();
});
