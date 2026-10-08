## Project Name
Tele Tourist

## Purpose
A social travel platform where users discover destinations through real travelers' stories and share their own travel experiences.

## Approved Stack
Frontend:
HTML, CSS, Bootstrap, JavaScript, jQuery

Backend:
Node.js, Express.js

Database:
Supabase PostgreSQL

Image Storage:
Cloudinary

Version Control:
Git, GitHub

## Development Principles
- Keep code simple and readable.
- Use meaningful names.
- Avoid unnecessary abstractions.
- Do not introduce unnecessary technologies.
- Keep frontend and backend responsibilities separate.
- Do not put all backend logic into server.js.
- Write code that can be explained in a college viva.
- Preserve existing working functionality.
- Do not modify unrelated modules.

## Database Entities
The following entities have been designed in Supabase PostgreSQL:
- profiles
- categories
- stories
- story_images
- likes
- comments
- saved_stories

Note:
- Supabase PostgreSQL is the project's database.
- Cloudinary will store image files later.
- Database records will store Cloudinary URLs/public IDs.
- Authentication is handled by Supabase Auth.
- Node.js + Express provides our authentication API layer.
- Passwords are managed by Supabase and are not stored in the `profiles` table.
- Supabase access tokens are used to authorize protected backend requests.
- The User Profile system is implemented. Profile images will be supported in the Cloudinary phase.
- Travel Stories module is implemented (CRUD operations, ownership validation, categories).
- Cloudinary is used for travel story images. Images are stored in Cloudinary. `story_images` stores the Cloudinary URL and public ID. Cloudinary API secrets remain server-side.
- Explore / Discovery module is implemented (Public story discovery, search, category filtering).

## Future Features
The following features will be implemented in the future (they are NOT part of the initial foundation):
- Likes
- Comments
- Saved stories
- Search and filtering
