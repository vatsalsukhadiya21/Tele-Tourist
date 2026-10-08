# Project Structure

This document explains the organization of the Tele Tourist codebase. It is designed to be simple and easy to understand for college vivas.

## Top-Level Directories

- `frontend/`: Contains all client-side code, including HTML, CSS, JavaScript, and static assets like images. It handles the user interface and presentation.
- `backend/`: Contains the Node.js and Express server, which acts as the API to communicate with the database and handle business logic.
- `docs/`: Contains project documentation to help developers understand the architecture and guidelines.
  - `database/schema.sql`: Contains the complete database creation SQL for Supabase PostgreSQL.

## Backend Folders

Inside `backend/src/`, the server logic is divided into specific folders based on responsibility:

- `config/`: Configuration-related code (e.g., database connection setup).
  - `supabase.js`: Initializes and exports the Supabase client.
- `controllers/`: Request handling and business logic. Each controller manages a specific feature (like user auth or stories) and maps to routes.
- `middleware/`: Reusable Express middleware (e.g., functions that run before a request reaches the controller, like checking authentication).
- `routes/`: API route definitions. This is where URLs are mapped to specific controller functions.
- `services/`: Reusable business or service logic that can be shared across controllers.
- `utils/`: Helper functions and utilities used throughout the backend code.

## Authentication Components

- `backend/src/routes/authRoutes.js`: Maps authentication endpoints (`/register`, `/login`, `/me`) to the controller logic.
- `backend/src/middleware/authMiddleware.js`: Protects backend routes by validating the Supabase access token in the `Authorization` header.
- `frontend/js/auth.js`: A central frontend service for handling login, registration, session storage, and authenticated API requests.
- `frontend/dashboard.html`: A simple protected test page that verifies a user is authenticated before showing content.

## Profile Components

- `backend/src/routes/profileRoutes.js`: Maps profile endpoints (`GET /me`, `PUT /me`, `GET /:id`) to controller logic.
- `backend/src/controllers/profileController.js`: Handles profile retrieval, updates, validation, and username uniqueness checking.
- `frontend/js/profile.js`: Frontend logic for fetching, displaying, and editing user profiles.
- `frontend/profile.html`: The user interface for both private and public profile viewing and editing.

## Story Components

- `backend/src/routes/storyRoutes.js`: Maps story endpoints for CRUD operations.
- `backend/src/controllers/storyController.js`: Handles creating, retrieving, updating, deleting stories and enforcing ownership securely.
- `frontend/js/stories.js`: Frontend API wrapper and logic for story-related features.
- `frontend/create-story.html`: Interface for writing and editing stories.
- `frontend/story.html`: Displays the details of a single story and author information.
- `frontend/my-stories.html`: A dashboard showing all stories authored by the logged-in user.
