# Task Manager Web

Angular 14 frontend using Angular Material and Tailwind CSS.

## Setup

```bash
npm install
npm start
```

The app runs on `http://localhost:4200` and expects the API at `http://localhost:5000/api`.

## Docker Dev Setup

From `/home/rx-desktop/Desktop/others`:

```bash
docker compose up --build
```

Open `http://localhost:4200`.

## Features

- Login and registration forms with validation.
- Access-token auth interceptor with refresh-token retry on expired sessions.
- Protected authenticated routes and guest-only login/register routes.
- Role-aware task dashboard.
- Server-side task search, status filter, and pagination.
- Task create, edit, complete, delete, and status filtering.
- Manager-only team assignment controls.
- Angular Material confirmation dialogs, spinners, and toast feedback.

Update `src/environments/environment.ts` if your API URL is different.
