const ProfileAPI = {
    async getMyProfile() {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/profile/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching profile:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async updateMyProfile(data) {
        const token = Auth.getToken();
        if (!token) return { success: false, message: 'Not authenticated' };

        try {
            const response = await fetch(`${API_URL}/profile/me`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating profile:', error);
            return { success: false, message: 'Network error' };
        }
    },

    async getPublicProfile(id) {
        try {
            const response = await fetch(`${API_URL}/profile/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching public profile:', error);
            return { success: false, message: 'Network error' };
        }
    }
};

let currentProfileData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');

    const displaySection = document.getElementById('profile-display');
    const editSection = document.getElementById('profile-edit-form-container');
    const errorSection = document.getElementById('profile-error');

    // UI Elements
    const dispName = document.getElementById('display-name');
    const dispUsername = document.getElementById('display-username');
    const dispBio = document.getElementById('display-bio');
    const dispEmail = document.getElementById('display-email');
    const profileInitials = document.getElementById('profile-initials');
    const profileImageContainer = document.getElementById('profile-image-container');

    const ownerInfo = document.getElementById('owner-info');
    const ownerControls = document.getElementById('owner-controls');

    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');
    const editForm = document.getElementById('edit-profile-form');
    const msgContainer = document.getElementById('edit-message-container');

    let isOwner = false;

    // Load Profile
    if (!profileId) {
        // Viewing own profile
        Auth.requireAuth();
        isOwner = true;
        const res = await ProfileAPI.getMyProfile();
        
        if (res.success) {
            currentProfileData = res.profile;
            renderProfile(currentProfileData);
            ownerInfo.classList.remove('d-none');
            ownerControls.classList.remove('d-none');
        } else {
            displaySection.classList.add('d-none');
            errorSection.classList.remove('d-none');
            errorSection.textContent = res.message || 'Failed to load profile';
        }
    } else {
        // Viewing public profile
        const res = await ProfileAPI.getPublicProfile(profileId);
        
        if (res.success) {
            currentProfileData = res.profile;
            renderProfile(currentProfileData);
            
            // If the viewer is the owner, show owner controls
            const myUser = Auth.getUser();
            if (myUser && myUser.id === profileId) {
                isOwner = true;
                // Note: since this was a public fetch, email isn't there, 
                // but we can still show the edit button.
                ownerControls.classList.remove('d-none');
            }
        } else {
            displaySection.classList.add('d-none');
            errorSection.classList.remove('d-none');
            errorSection.textContent = res.message || 'Profile not found';
        }
    }

    function renderProfile(data) {
        dispName.textContent = data.full_name;
        dispUsername.textContent = data.username;
        dispBio.textContent = data.bio || 'No bio yet.';
        
        if (data.email) {
            dispEmail.textContent = data.email;
        }

        // Set initials
        const initial = data.full_name ? data.full_name.charAt(0).toUpperCase() : 'U';
        
        if (data.profile_image_url) {
            profileImageContainer.innerHTML = `<img src="${data.profile_image_url}" alt="Profile Image" class="rounded-circle" style="width: 150px; height: 150px; object-fit: cover;">`;
        } else {
            profileImageContainer.innerHTML = `<div class="profile-img-placeholder"><span>${initial}</span></div>`;
        }
    }

    // Edit flow
    if (editBtn) {
        editBtn.addEventListener('click', async () => {
            // Re-fetch my profile just to be sure we have latest and email
            if (!currentProfileData.email) {
                const res = await ProfileAPI.getMyProfile();
                if (res.success) currentProfileData = res.profile;
            }

            document.getElementById('edit-fullName').value = currentProfileData.full_name || '';
            document.getElementById('edit-username').value = currentProfileData.username || '';
            document.getElementById('edit-bio').value = currentProfileData.bio || '';
            document.getElementById('edit-email').value = currentProfileData.email || '';
            
            msgContainer.innerHTML = '';
            displaySection.classList.add('d-none');
            editSection.classList.remove('d-none');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editSection.classList.add('d-none');
            displaySection.classList.remove('d-none');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('edit-fullName').value.trim();
            const username = document.getElementById('edit-username').value.trim();
            const bio = document.getElementById('edit-bio').value.trim();
            const btn = document.getElementById('save-profile-btn');
            
            btn.disabled = true;
            btn.textContent = 'Saving...';
            msgContainer.innerHTML = '';

            const res = await ProfileAPI.updateMyProfile({ fullName, username, bio });
            
            if (res.success) {
                currentProfileData = res.profile;
                renderProfile(currentProfileData);
                
                // Show success message and swap back
                editSection.classList.add('d-none');
                displaySection.classList.remove('d-none');
                
                // Optionally show a toast or alert on the display section
                // ...
            } else {
                msgContainer.innerHTML = `<div class="alert alert-danger">${res.message}</div>`;
            }
            
            btn.disabled = false;
            btn.textContent = 'Save Changes';
        });
    }
});
