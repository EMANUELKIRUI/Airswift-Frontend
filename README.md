# Airswift Frontend

Airswift Frontend is a Next.js 14 application for a recruitment and admin management platform. It includes job seeker dashboards, admin panels, authentication, document workflows, real-time notifications, and AI-assisted interview features.

## Features

- Authentication with email/password and Google OAuth
- Admin dashboard with users, applications, interviews, payments, audit logs, and settings
- Job seeker dashboard with applications, interviews, documents, profile, and messaging
- Real-time updates via Socket.IO
- AI-powered interview feedback and CV analysis
- Document upload and management
- Email template editor and audit logging

## Technology Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- NextAuth.js
- Socket.IO
- Recharts
- MongoDB (via Mongoose)
- OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+ / npm
- MongoDB connection if using the built-in API routes
- Google OAuth credentials for sign-in

### Installation

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Build for production

```bash
npm run build
npm run start
```

### Run the socket server

```bash
npm run socket-server
```

## Environment Variables

Create a `.env.local` file with the following values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_PATH=/api/socket
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
JWT_SECRET=your-jwt-secret
JWT_ACCESS_SECRET=your-jwt-access-secret
```

> Note: Some routes and utilities use `NEXT_PUBLIC_API_URL` for backend API calls and `NEXT_PUBLIC_SOCKET_URL` / `NEXT_PUBLIC_SOCKET_PATH` for Socket.IO.

## Project Structure

- `src/pages/` — application pages and API routes
- `src/components/` — shared UI components
- `src/layouts/` — page layout wrappers
- `src/context/` — React context providers
- `src/lib/` — reusable library helpers
- `src/services/` — API service wrappers
- `server/socketServer.js` — standalone Socket.IO server

## Notes

- This repository is configured as a full Next.js application, but some UI components depend on a backend API and database.
- If backend services are separate, set `NEXT_PUBLIC_API_URL` to the appropriate API base URL.
- Keep dependencies updated and validate environment variables before deployment.
