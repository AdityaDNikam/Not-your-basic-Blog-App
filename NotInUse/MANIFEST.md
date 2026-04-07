# NotInUse MANIFEST

The following files were moved to NotInUse/ because they are no longer used after the React conversion. They were previously used by EJS views or as static assets for EJS pages.

## views/
- dashboard.ejs — replaced by src/pages/Dashboard.jsx
- index.ejs — replaced by src/pages/Index.jsx
- create-account.ejs — replaced by src/components/CreateAccountForm.jsx
- login.ejs — replaced by src/components/LoginForm.jsx

## public/
- Any CSS/JS files in public/css/ that were only used by EJS (none found in this scan, but folder created for future archiving)

## Notes
- Dashboard.css, Dashboard.jsx, index.jsx remain in views/ for now as they are part of the React migration or are referenced in the new codebase.
- All EJS view engine and EJS routes have been removed from server.js.
- No static CSS/JS in public/ was found to be EJS-only, but the NotInUse/public/css/ folder is ready for archiving if needed.
