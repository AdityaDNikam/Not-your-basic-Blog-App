# Project Open Ends & Bugs

## 1. File Structure Duplication (React Migration Leftovers)
**Issue:** During the migration from EJS/Vanilla HTML to React, some outdated files have been left behind. The `views/` directory and `index.js` in the root folder are now completely redundant since the new architecture is fully established in the `src/` directory.
**Action:** Delete the `views/` directory and `index.js` (root).

## 2. Empty Vite Configuration
**Issue:** `vite.config.js` is currently completely empty. This will cause the Vite dev server and build processes to fail since they do not have the basic React plugin included. It also lacks a proxy setup to communicate securely with your backend over `localhost:3000`.
**Action:** Populate `vite.config.js` with standard configuration, importing `defineConfig` and the React plugin.

## 3. Redirect Route Errors in Login and Signup
**Issue:** In `src/pages/Index.jsx`, upon successful initialization of auth, the process hardcodes the redirect to `/dashboard` via `window.location.href = '/dashboard';`. However, the API returns the exact path the navigation must shift to (`/:username`). This mismatch affects login and routing logic.
**Action:** Update `src/pages/Index.jsx` to respect the server-defined redirect path by executing `window.location.href = redirectPath;`.

## 4. Main.js Misreferenced Import
**Issue:** `src/main.jsx` improperly imports its API configuration natively over an invalid path (`import '../api/axiosConfig'`). Since both are essentially scoped inside `src/`, this will throw an error.
**Action:** Adjust the import inside `src/main.jsx` to `./api/axiosConfig`.

## 5. API Axios Defaults
**Issue:** `src/api/axiosConfig.js` specifies `import.meta.env.PROD ? 'http://localhost:3000' : ''`. To prevent cross-origin issues during local development, the vite config requires proxying, and the axios code should continue pointing natively securely or reliably connect.
**Action:** Will verify and let the vite proxy manage API routes smoothly, thus eliminating any explicit ports from the frontend queries.
