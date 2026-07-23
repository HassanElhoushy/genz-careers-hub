# Gen Z Careers Portal

A modern recruitment platform built for **Gen Z**, designed to streamline the hiring process for both applicants and recruiters. The application provides a seamless experience for job applications, applicant tracking, and interview management through a secure role-based authentication system.

##  Features

###  Applicant

- Create an account using secure email/password authentication.
- Apply for available positions.
- Upload an optional portfolio or LinkedIn link.
- Track application status in real time.
- View interview details when accepted.
- View rejection reason when rejected.
- Securely access only their own application.

###  Admin

- Secure administrator authentication.
- View all submitted applications.
- Accept or reject applications.
- Schedule interviews.
- Configure interview type:
  - On-site
  - Online
- Manage interview details:
  - Date
  - Time
  - Location Name
  - Google Maps Location
  - Online Meeting Link
  - Additional Notes
- Delete applications when necessary.

---

#  Architecture

The project follows a modern client-side architecture powered by Supabase.

```text
                    React + TanStack Start
                             │
                    TanStack React Query
                             │
                   Supabase JavaScript SDK
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
   Supabase Auth                       PostgreSQL Database
        │                                         │
        └────────────── Row Level Security ───────┘
```

---

#  Authentication

Authentication is handled entirely by **Supabase Auth**.

- Email & Password Sign Up
- Email & Password Sign In
- JWT Sessions
- Secure Password Hashing
- Session Persistence
- Logout

Passwords are **never stored** inside application tables.

---

#  Authorization

The application implements **Role-Based Access Control (RBAC)**.

Available roles:

- **Admin**
- **Applicant**

Authorization is enforced at the **database level** using PostgreSQL Row Level Security (RLS).

Applicants can only access their own data, while administrators can manage every application.

---

#  Database

## auth.users

Managed by Supabase Authentication.

Stores:

- Email
- Encrypted Password
- Authentication Metadata

---

## profiles

Stores applicant profile information.

Fields include:

- Name
- Phone Number
- Birthday
- Portfolio URL

---

## applications

Stores recruitment-related information.

Including:

- Position
- Status
- Interview Details
- Interview Type
- Rejection Reason

---

## user_roles

Stores application roles separately from user profiles.

Supported roles:

- Admin
- Applicant

---

#  Tech Stack

## Frontend

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack React Query
- Tailwind CSS
- Radix UI
- React Hook Form
- Zod
- Framer Motion
- Lucide React

## Backend

- Supabase Authentication
- PostgreSQL
- Row Level Security (RLS)
- Database Triggers

## Deployment

- Vercel
- GitHub

---

#  Project Structure

```
src
├── components
├── hooks
├── routes
├── lib
├── types
├── utils
└── styles
```

---

#  Local Development

## Prerequisites

- Node.js 20+
- npm

## Installation

```bash
git clone <repository-url>

cd <repository-name>

npm install

npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

#  Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

#  Deployment

The application is deployed using **Vercel**.

Production services include:

- Frontend → Vercel
- Authentication → Supabase Auth
- Database → PostgreSQL (Supabase)

---

#  Future Improvements

- Email notifications
- Resume upload
- Admin analytics dashboard
- Search & filtering
- Pagination
- Dark mode
- Multi-language support
- Email verification
- Password reset
- Applicant profile editing

---

#  License

This project was developed as part of a Frontend Web Development assessment for **Gen Z** and is intended for evaluation purposes.
