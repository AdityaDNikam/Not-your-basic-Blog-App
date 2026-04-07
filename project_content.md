# Project Content Documentation

## Tech Stack
- **Frontend**: React (with Vite), React Router
- **Backend**: Express (Node.js)
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT & basic Cookie-based strategy

## Folder Structure
- `server.js`: The entry point for the backend. It sets up the Express app, connects to MongoDB, and serves API endpoints along with the static frontend (if built).
- `models/`: Contains the Mongoose schemas and models (`User.js`, `Blog.js`).
- `.util`: Contains shared authentication and authorization middleware functions (`verifyAuth`, `verifyUserOwnership`, `verifyBlogOwnership`).
- `src/`: Contains the entire new React frontend application:
  - `components/`: Reusable React components (`Navbar.jsx`, `Modal.jsx`, forms, etc.)
  - `pages/`: Full page layouts (`Index.jsx`, `Dashboard.jsx`, `Profile.jsx`)
  - `api/`: Interceptors or baseline configs for data fetching (e.g., `axiosConfig.js`)
  - `styles/`: Clean segregated CSS styling (`index.css`, `dashboard.css`)
  - `main.jsx` & `App.jsx`: Frontend entry points and top-level routing setup.
- `public/`: Used for serving raw static assets and bundled frontend (when generating for production).
- `package.json`: Matures full-stack monorepo style build with unified dependencies.

## Key Features Built
- User Authentication (Signup & Login) using JWT stored across HTTP-only cookies.
- Creating, Editing, Listing, and Deleting Blogs mapped specifically to a User via UserIds in Mongoose documents.
- React Router managing protected routes (`/:username`, `/profile`).
