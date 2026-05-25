# TeamMatch Prototype

TeamMatch is a student team project matching platform built for the SDLC capstone implementation and testing stage.

The service helps students create a profile, browse team recruitment posts, send join requests, and manage request status. The final MVP uses a React frontend and a Supabase backend with PostgreSQL tables.

## Repository

https://github.com/hohuunhatminh/team-match-prototype

## Main Features

- Login screen for prototype entry flow
- Student profile editing and saving
- Team recruitment post creation
- Team post list and detail view
- Course, skill, and available-time filtering
- Team post editing and deletion
- Join request sending
- My Sent Requests status tracking
- Request accept/reject management
- Supabase backend integration

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| UI | CSS, Framer Motion, Lucide React |
| Backend | Supabase |
| Database | Supabase PostgreSQL |
| Version Control | GitHub |

## Backend Architecture

The application uses Supabase as the backend service. The React frontend connects to Supabase through `@supabase/supabase-js`.

Main data flow:

```text
User Browser → React App → Supabase Client → Supabase API → PostgreSQL Tables
```

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | Stores student profile information such as name, major, skills, preferred role, and available time |
| `team_posts` | Stores team recruitment posts including course, title, required role, skills, time, recruit count, and description |
| `join_requests` | Stores team join requests and request status: Pending, Accepted, or Rejected |

## Environment Variables

Create a `.env.local` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Do not commit `.env.local` to GitHub. The real Supabase key and database password should not be included in the repository.

## Installation

```bash
git clone https://github.com/hohuunhatminh/team-match-prototype.git
cd team-match-prototype
npm install
```

## Run Locally

```bash
npm run dev
```

On Windows PowerShell, if npm scripts are blocked, run:

```powershell
npm.cmd run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173/
```

## Demo Flow

```text
Login
→ Save Profile
→ Create/Edit/Delete Team Post
→ Browse and Filter Team Posts
→ View Post Detail
→ Send Join Request
→ My Sent Requests
→ Accept/Reject Request
```

## Implementation Notes

The initial design considered a Next.js + Supabase structure. During implementation, the frontend was built with React + Vite for faster MVP development and simpler local execution. The core architecture direction remained the same: a React-based frontend connected to a Supabase backend and PostgreSQL database.

The current login screen represents the prototype entry flow. Full Supabase Auth signup/login and user-based permission control are planned as future improvements.

## Team Members

| Name | Main Contribution |
|---|---|
| Ho Huu Nhat Minh | React implementation, UI improvement, Supabase integration, testing, documentation |
| Kim Minwoo | Requirement review, feature flow review, presentation preparation support |

## Project Status

The MVP implementation is complete for the core flow required in the implementation and testing stage. The application now uses Supabase for profile data, team post data, and join request status management.

## Future Improvements

- Implement real Supabase Auth signup/login
- Add user-based edit/delete permission control
- Add notification or realtime request updates
- Add team matching recommendation logic
- Add automated unit and API tests
