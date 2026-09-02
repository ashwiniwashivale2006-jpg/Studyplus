# StudyPulse – Smart Study Planner (Full Stack)

## Technology
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Persistent storage: `data/db.json` (simple database-style storage; ideal for a mini-project and easy to understand)
- Can later be upgraded to MongoDB/MySQL without changing the UI concept.

## Run on a computer
1. Install Node.js.
2. Open a terminal in this folder.
3. Run:
   `npm install`
4. Run:
   `npm start`
5. Open:
   `http://localhost:3000`

### Demo account
Email: `ashwini@example.com`
Password: `demo123`

## API
- POST `/api/register`
- POST `/api/login`
- GET `/api/dashboard?userId=demo`
- GET/POST `/api/tasks`
- PUT/PATCH/DELETE `/api/tasks/:id`
- GET/POST `/api/subjects`
- PUT/DELETE `/api/subjects/:id`

## Project flow
Browser → `public/index.html` + `style.css` + `script.js`
→ Express REST API → `data/db.json`

The included frontend can also be opened directly, but for permanent data and API features use `npm start`.
