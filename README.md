# Tele Tourist

A social travel platform where users discover destinations through real travelers' stories and share their own travel experiences.

## Purpose
To connect travelers and allow them to share their experiences and discover new places.

## Technology Stack
- **Frontend**: HTML, CSS, Bootstrap, JavaScript, jQuery
- **Backend**: Node.js, Express.js
- **Database**: Supabase PostgreSQL
- **Image Storage**: Cloudinary
- **Version Control**: Git, GitHub

## Current Project Status
- Basic project structure established.
- Frontend foundation created (Home, Login, Register UI).
- Backend foundation initialized with a health-check route.
- **Note**: Authentication, database, and business logic are not yet implemented.

## Folder Structure
```
tele-tourist/
├── frontend/          # Client-side HTML, CSS, JS, and assets
├── backend/           # Node.js + Express server
└── docs/              # Project documentation
```

## How to Run Frontend
1. Navigate to the `frontend` directory.
2. Open `index.html` in your web browser.

## How to Run Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment variables and configure Supabase:
   ```bash
   cp .env.example .env
   ```
   (Make sure to add your `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env`)
4. Start the server:
   ```bash
   npm start
   ```
5. Check if the server is running by visiting: `http://localhost:5000/api/health`
6. Check if the database connection is working by visiting: `http://localhost:5000/api/health/db`

## Database Setup
1. Create a [Supabase](https://supabase.com/) project.
2. Go to the SQL Editor in your Supabase dashboard and run the entire contents of `docs/database/schema.sql`.
3. Add your Supabase project URL and anon key to the local `.env` file in the `backend/` directory.
4. Start the backend server and test `http://localhost:5000/api/health/db`.

## How to Test Authentication
1. Follow the Database Setup above.
2. Start the backend (`npm start` in `backend/`).
3. Open `frontend/register.html` in your browser.
4. Fill out the form to register a new user. The backend creates a Supabase Auth user and a trigger creates the profile.
5. Open `frontend/login.html` and log in with your credentials.
6. Once logged in, you should be redirected to the protected profile page.

## Profile System
- **View Profile**: Visit `frontend/profile.html` to see your profile details (including email).
- **Edit Profile**: Click 'Edit Profile' on your profile page to update your name, username, and bio. The system enforces username uniqueness.
- **Public Profile**: Visit `frontend/profile.html?id=<user_id>` to view another user's public profile (email is hidden for privacy).

## Travel Stories
- **Create Story**: Navigate to `frontend/create-story.html` to publish a new travel story with a category and location.
- **My Stories**: View and manage all your stories at `frontend/my-stories.html`.
- **Story Details**: Read a full story at `frontend/story.html?id=<story_id>`. Edit and Delete buttons are visible if you are the author.

## Explore / Discovery
- **Explore Page**: Visit `frontend/explore.html` to discover all public travel stories.
- **API**: `GET /api/explore/stories` supports query parameters: `search`, `category`, `limit`, and `offset`.

### Cloudinary Setup
1. Create a Cloudinary account.
2. Obtain Cloud Name, API Key, API Secret.
3. Put credentials in `backend/.env`.
4. Never commit `.env`.
