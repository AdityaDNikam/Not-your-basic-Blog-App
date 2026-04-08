# Codebase Overview (Backend & Configuration)

This document breaks down the current architecture and primary components of the Basic CRUD application, focusing on the backend and project configuration. We are currently bypassing React specific folders (`src/`, `frontend/`, etc.).

## 1. Project Configuration Infrastructure
- **`package.json`**: 
  - Uses ES Modules (`"type": "module"`), meaning native modern `import/export` syntax is used throughout the backend instead of legacy `require()`.
  - Defines the core dependency tree (Express, Mongoose, Vite, React) and the scripts needed to execute the application (e.g. `npm run dev:backend`).
- **`vite.config.js`**: 
  - Sets up the React plugins, but critically implements a **development proxy**.
  - Any frontend queries originating from your Vite server that route to `/api`, `/login_user`, `/create_profile`, or `/logout` are automatically caught and rerouted to `http://localhost:3000` (the backend server). This elegantly dodges Cross-Origin (CORS) faults locally during development.
- **`.env`**: Stores sensitive or environment-specific values like `PORT`, `MONGODB_URI`, and `JWT_SECRET`.

## 2. Server Pipeline & Routing (`server.js`)
The brain and main entry point for the backend logic, constructed using **Express**. 
- **Global Middlewares**: Requests pass through JSON/Urlencoded parsers, generic static file serving (`public`), `cookieParser` (to fetch JSON Web Tokens and parse secure cookies automatically), and `cors` (allowing credentials sharing and Vite proxy bridging).
- **Core Endpoints Setup**:
  - **Auth Flows**: `/create_profile` (Signup & JWT cookie assignment), `/login_user` (Login validation & sets cookies), and `/logout` (cookie termination).
  - **Blogs Sub-API**: A full spectrum of CRUD endpoints prefixed with `/api/blogs`. Fully secured using Custom Authentication and Verification middlewares.
  - **Users Sub-API**: Account management endpoints prefixed with `/api/users`.

## 3. Database Relational Modeling (`models/`)
Utilizes **Mongoose** to implement an Object Data Modeling (ODM) layer bridging your Express Server architecture to the MongoDB Datastore:
- **`User.js`**: Defines the user table schema. 
  - **Fields**: `name`, `username`, `email` (regex validated for structure), `password` (min length enforced), `number` (regex validated), `userId`, and `photo` properties.
  - **Security Infrastructure**: Injects a Mongoose `pre('save')` hook. Whenever a document is saved, the application automatically catches plain passwords, generates a `bcryptjs` salt, and stores a one-way secure hash instead. 
  - Defines a `comparePassword` instance method to streamline authentication checks on login.
- **`Blog.js`**: Defines the user posts.
  - **Fields**: `Blog_header`, `Blog_msg`, `related_url`, and the critical `user_id`.
  - The `user_id` is defined explicitly as a `mongoose.Schema.Types.ObjectId`, meaning under the hood it intrinsically maps and links to exactly one author stored in your User Schema table.

## 4. Custom Interceptor Middlewares (`utils.js`)
A centralized tool-hub managing logical gateways and handling authorizations before requests are allowed to proceed to their designated endpoints:
- **`verifyAuth`**: Stands as the gatekeeper for restricted locations. It extracts the `authToken` from HTTP request cookies, deploys `jsonwebtoken` (`jwt.verify()`) to decrypt and ensure no tampering occurred, and verifies the user exists in the system before authorizing movement.
- **`verifyUserOwnership`**: Blocks rogue actors/edits. By comparing the `id` of the URL parameter with the verified internal identity retrieved from the token, it categorically refuses any user from editing or scrubbing other users' profiles via API requests.
- **`verifyBlogOwnership`**: Fetches the targeted blog from the database based on the URL ID and scrutinizes the blog's `user_id` author marking. If it does not strictly match the logged-in user launching the request, they are booted out securely.

## Summary 
The backend has stabilized around a standard **MVC-lite** (Model-View-Controller) structure emphasizing REST principles. With the newly updated secure password workflows and unified file formatting logic, the backend acts as an impenetrable, fully operational REST API ready exclusively to serve your React frontend component architectures.
