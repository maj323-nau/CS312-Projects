## Project Overview

Mini-Project-3 evolves the Mini-Project-1 blog into a persistent, multi-user application. This brief describes the current implementation, the target behavior, the decisions already made, and an incremental path for implementing the changes.

## Current Application State

Mini-Project-1 is a small **Express** application that renders pages with **EJS**. Its routes are defined in `Mini-Project-1/app.js`, and it parses browser form submissions with `express.urlencoded()`.

Posts are stored in a JavaScript array in server memory. Each post has an `id`, `title`, free-form `author`, and `content`; a counter assigns IDs to new posts. Creating, editing, and deleting posts changes that array, so all data is lost when the process stops.

The current routes let visitors view the home page, list posts, and view an individual post. Visitors can also create, edit, or delete any post. The list, home, and detail pages use EJS templates; the edit route currently builds an HTML form directly in `app.js`. There are no users, database, authentication, sessions, or ownership checks.

In short, Mini-Project-1 demonstrates the full post CRUD flow in a single Express process: a request reaches a route, the route reads or changes the in-memory array, then renders a template or redirects the browser.

## Desired End State

The completed application should provide:

**Guests**
- View all posts.
- View an individual post.

**Authenticated users**
- Register an account.
- Log in and log out.
- Create posts.
- Edit and delete only their own posts.

**Application**
- Persist users and posts in PostgreSQL.
- Hash passwords with bcrypt; never store plaintext passwords.
- Use session-based authentication with `express-session`.
- Preserve server-rendered EJS pages and form-based interactions.
- Associate every post with its author and enforce ownership on the server.

## Final Implementation Decisions

### Decisions Locked In

- Express remains the web framework.
- EJS remains the templating engine.
- PostgreSQL is the database.
- bcrypt is used for password hashing.
- `express-session` is used for authentication sessions.
- Preserve the server-rendered architecture; do not convert to a single-page application.
- Do not introduce React, Angular, or Vue.
- Posts belong to registered users, with the authenticated user as the post author.
- Guests may view the post list and individual posts.
- Only authenticated owners may edit or delete their posts.
- The server derives `author_id` from the session; it must not trust an author ID submitted by the client.
- Users log in using email.
- User email addresses must be unique.
- Registration collects username, email, and password.
- Login authenticates using email and password.

## Database Design Reference

Use lowercase PostgreSQL table names (`users`, `posts`) and the following fields. Enforce uniqueness for `users.email`.

**`users`**

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `username` | Public account name |
| `email` | Account email |
| `password_hash` | bcrypt password hash |
| `created_at` | Account creation time |

**`posts`**

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `title` | Post title |
| `content` | Post body |
| `author_id` | Foreign key to `users.id` |
| `created_at` | Post creation time |
| `updated_at` | Time of most recent edit |

**Relationship:** `users (1) → (*) posts`. Each post has one author; an account may author multiple posts. List and detail queries should join `posts` to `users` to display the author's username.

## Target Project Structure

```text
Mini-Project-3/
├── app.js
├── db.js
├── routes/
├── views/
│   ├── index.ejs
│   ├── posts.ejs
│   ├── post.ejs
│   ├── edit.ejs
│   ├── register.ejs
│   └── login.ejs
├── public/
├── .env
├── package.json
└── README.md
```

- `app.js` configures Express, middleware, sessions, and route mounting.
- `db.js` creates and exports the PostgreSQL connection pool using environment configuration.
- `routes/` holds route handlers for posts and authentication, keeping request handling separate from app setup.
- `views/` contains EJS templates for pages and forms rendered by Express.
- `public/` contains static assets such as CSS and browser-side files.
- `.env` stores local database connection values and session secrets; do not commit secrets.
- `package.json` declares dependencies and application scripts.
- `README.md` documents the project architecture and implementation progress.

## Data Flow Transformation

**Mini-Project-1**

```text
User Request
→ Express Route
→ In-Memory Posts Array
→ EJS View
```

The route reads or mutates the process-local array, then renders an EJS template or redirects. Changes disappear when the server process stops.

**Mini-Project-3**

```text
User Request
→ Express Route
→ PostgreSQL Query
→ Database Result
→ EJS View
```

Routes will retrieve or update persistent data through parameterized PostgreSQL queries. Results are passed to EJS templates for server-side rendering.

**Authenticated writes**

```text
User Request
→ Session Validation
→ Ownership Check
→ PostgreSQL Write
→ Redirect
```

For post creation, the session identifies the author. For edits and deletes, the server confirms that the signed-in user owns the post before writing; a client-supplied user or author ID is never trusted.

## Route Migration Map

| Current Mini-Project-1 route | Future behavior |
|---|---|
| `GET /` | Continue rendering the EJS home page; show navigation appropriate to guest or signed-in state. |
| `GET /posts` | Read posts and author names from PostgreSQL and render the EJS list. Available to guests and signed-in users. |
| `GET /posts/:id` | Read one post and its author from PostgreSQL and render its EJS detail page. Available to guests; show edit/delete controls only to the owner. Return 404 if the post does not exist. |
| `GET /posts/:id/edit` | Require authentication and ownership; render an EJS edit form. |
| `POST /posts` | Require authentication; validate title and content; insert a post using the session user's ID as `author_id`. |
| `POST /posts/:id/edit` | Require authentication and ownership; validate and persist the update, including `updated_at`. |
| `POST /posts/:id/delete` | Require authentication and ownership; delete only the matching user's post. |
| **New: `GET /register`** | Render the registration form. |
| **New: `POST /register`** | Validate registration fields, hash the password with bcrypt, and create the user in PostgreSQL. |
| **New: `GET /login`** | Render the login form with email and password fields. |
| **New: `POST /login`** | Look up the account by unique email, verify the password with bcrypt, and establish a session on success. |
| **New: `POST /logout`** | Destroy the current session, clear its cookie, and redirect to a public page. |

Use parameterized SQL for all database operations. Enforce ownership in the server-side route and preferably in update/delete query predicates as well; hiding controls in EJS is not an authorization check.

## Recommended Build Order

1. **Phase 1: Database setup** — Create the PostgreSQL database and `users`/`posts` tables, add the connection configuration, and verify the application can connect.

   **Phase Complete When:**
   - The application successfully connects to PostgreSQL.
   - The `users` and `posts` tables exist with the planned fields and relationship.
   - A database connection test succeeds.

2. **Phase 2: PostgreSQL CRUD migration** — Replace the in-memory post reads and writes with parameterized database operations. Verify list, detail, create, edit, and delete behavior and persistence across server restarts.

   **Phase Complete When:**
   - All post CRUD reads and writes use PostgreSQL.
   - No post data remains stored in the in-memory array.
   - Post data survives an application restart.

3. **Phase 3: User registration** — Add registration forms and routes, validate account inputs, hash passwords with bcrypt, and store users.

   **Phase Complete When:**
   - A visitor can register with a username, unique email, and password.
   - The password is stored only as a bcrypt hash.
   - Duplicate email addresses and invalid registration input are handled clearly.

4. **Phase 4: User login** — Authenticate using email, verify credentials against the stored bcrypt hash, and test success and failure paths.

   **Phase Complete When:**
   - A registered user can log in using email and password.
   - A valid password succeeds and an invalid email/password pair does not authenticate.
   - Login does not expose or return the stored password hash.

5. **Phase 5: Sessions and logout** — Configure `express-session`, associate a successful login with the session, and destroy the session on logout.

   **Phase Complete When:**
   - A successful login establishes a session that identifies the user on later requests.
   - Session state is available to protected routes and relevant EJS views.
   - Logging out invalidates the session and returns the user to guest state.

6. **Phase 6: Authorization and ownership checks** — Require a session for writes, assign post authors from the session, and restrict edit/delete operations to the owner.

   **Phase Complete When:**
   - Guests cannot create, edit, or delete posts.
   - Authenticated users can create posts attributed to their own account.
   - A user cannot edit or delete another user's post, including by directly submitting a request.

7. **Phase 7: EJS updates and testing** — Update forms and navigation for guest and authenticated states; test guest browsing, registration, login/logout, CRUD, and cross-user access denial.

   **Phase Complete When:**
   - EJS pages provide the appropriate navigation and actions for guests and signed-in users.
   - Guests can view the list and detail pages; owners can manage their own posts.
   - Registration, login, logout, post CRUD, and ownership boundaries have been verified end-to-end.

This order validates the database and existing CRUD flow before adding authentication complexity. Registration and login can then build on working persistence, while session handling and ownership checks are added after a reliable authenticated identity exists. Keep intermediate phases local and do not treat the application as ready for use until write routes are protected.

# Current Development Status

**Current status:** Phase 1 complete.

The PostgreSQL 18 server is running, the application database has been created, and the required schema is recorded in `schema.sql`. The local environment configuration lives in `.env` and is intentionally excluded from git; `db.js` loads that configuration and exports the PostgreSQL connection pool for use by later routes. A reusable diagnostic script, `test-db.js`, confirms that the app can connect to PostgreSQL and list the available tables.

**Completed Phase 1 Deliverables:**
- PostgreSQL 18 server is running locally.
- The blog database exists and is configured in `.env`.
- `schema.sql` defines the `users` and `posts` tables with the required fields and relationship.
- `db.js` exports a pooled PostgreSQL connection ready for route-level database access.
- `test-db.js` successfully verifies connectivity and schema availability.

**Next phase:** Phase 2 - PostgreSQL CRUD migration.

The project should move from the current app setup into replacing in-memory post handling with parameterized PostgreSQL queries while preserving the existing Express + EJS behavior.


**Current implementation target:** Phase 2 - PostgreSQL CRUD migration.

**Success criteria:**

- Post list and detail queries read from PostgreSQL instead of memory.
- Post create/edit/delete routes persist changes in PostgreSQL.
- Post data remains available across server restarts.
- Existing Express + EJS behavior remains intact while data persistence moves to the database.

