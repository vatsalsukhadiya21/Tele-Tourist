const StoryAPI = {
    async getCategories() {
        try {
            const response = await fetch(`${API_URL}/categories`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async createStory(data) {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/stories`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating story:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async getStory(id) {
        try {
            const response = await fetch(`${API_URL}/stories/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching story:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async getMyStories() {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/stories/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching my stories:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async updateStory(id, data) {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/stories/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating story:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async deleteStory(id) {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/stories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting story:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async uploadImages(storyId, formData) {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/stories/${storyId}/images`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData // Don't set Content-Type header when sending FormData
            });
            return await response.json();
        } catch (error) {
            console.error('Error uploading images:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async deleteStoryImage(storyId, imageId) {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/stories/${storyId}/images/${imageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting image:', error);
            return { success: false, message: 'Network error' };
        }
    }
};

// Common UI Helper for formatting dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
