# Bus Booking System — Frontend

A **Next.js 16** web application that provides a user-facing seat booking flow and a full admin panel for managing buses, schedules, seats, and bookings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Routing | Next.js App Router (`app/`) |
| Auth | JWT stored in `localStorage` (admin only) |

---

## Project Structure

```
frontend/app/
├── page.tsx                          # Home — search schedules by date
├── layout.tsx                        # Root layout with global styles
├── globals.css                       # Tailwind base + custom animations
│
├── seats/[scheduleId]/
│   └── page.tsx                      # Seat selection — bus layout view
│
├── booking/[scheduleId]/
│   └── page.tsx                      # Booking form — passenger details
│
├── search/
│   └── page.tsx                      # Track booking by UUID code
│
├── components/
│   ├── StepIndicator.tsx             # 3-step progress bar (Schedule → Seats → Book)
│   ├── ConfirmationModal.tsx         # Post-booking receipt modal + HTML download
│   └── ConfirmDialog.tsx             # Reusable confirmation dialog (create/delete/cancel)
│
└── admin/
    ├── layout.tsx                    # Auth guard — blocks unauthenticated access
    ├── login/page.tsx                # Admin login form
    ├── dashboard/page.tsx            # Overview stats
    ├── buses/page.tsx                # Manage buses (create / delete)
    ├── schedules/page.tsx            # Manage schedules (create / delete)
    ├── bookings/page.tsx             # View all bookings, cancel
    └── seats/[scheduleId]/page.tsx   # Manage seat statuses (reserve / available)
```

---

## User-Facing Features

### Step 1 — Find a Schedule (`/`)
- Date picker restricted to today onwards
- Fetches schedules from the backend filtered by selected date
- Displays route, bus number, departure and arrival times
- "Already booked? Track your booking" link

### Step 2 — Select a Seat (`/seats/[scheduleId]`)
- Full visual bus layout: steering wheel at the top, seats arranged `[A][B] | aisle | [C][D]` per row
- Seat colours:
  - **Green** — Available (clickable)
  - **Orange** — Reserved (blocked)
  - **Red** — Booked (blocked)
  - **Indigo** — Currently selected
- Live count of Available / Reserved / Booked seats
- Colour legend at the bottom of the layout

### Step 3 — Book (`/booking/[scheduleId]`)
- Guards against navigating here with a non-available seat (redirects back)
- **Passenger Name** field — letters and spaces only, strips invalid characters in real time
- **Phone Number** field — fixed `07` prefix badge + 8-digit suffix input (`07XXXXXXXX` stored in full)
- Confirmation dialog before the booking API call is made
- On success: animated **receipt modal** showing all booking details + download as HTML

### Track Booking (`/search`)
- Enter a UUID booking code to retrieve the full booking details
- Displays a styled **ticket card**: route, passenger name, phone, bus number, seat number, travel date, departure & arrival times
- Shows clear error messages for not-found or server errors
- Press Enter or click Search to query

---

## Admin Panel Features (`/admin/*`)

### Authentication
- Login at `/admin/login` with username + password
- JWT stored in `localStorage` under key `adminToken`
- **Client-side expiry check** — decodes the JWT `exp` claim using `atob()` without any library; expired tokens are cleared automatically
- All admin routes protected by `admin/layout.tsx` — blocks render and redirects to `/admin/login` if token is missing or expired

### Dashboard (`/admin/dashboard`)
- Summary stats: total buses, schedules, bookings

### Buses (`/admin/buses`)
- List all buses with route (from → to)
- Create new bus (confirmation dialog)
- Delete bus (confirmation dialog — red/danger)

### Schedules (`/admin/schedules`)
- List all schedules with date, times, and bus
- Create new schedule linked to a bus (confirmation dialog)
- Delete schedule (confirmation dialog — red/danger)

### Bookings (`/admin/bookings`)
- View all bookings: booking code, passenger name, phone, bus, route, seat, date, times
- Cancel a booking — frees the seat back to AVAILABLE (confirmation dialog with passenger name)

### Seat Management (`/admin/seats/[scheduleId]`)
- Same visual bus layout as user-facing seat page
- Admin can click any seat to:
  - Mark as **Reserved**
  - Mark as **Available**
  - View booking details if the seat is BOOKED
- All actions go through a confirmation dialog

---

## Reusable Components

### `ConfirmDialog.tsx`
A shared animated modal used across all pages for confirmations before any create, delete, or cancel action.
- Props: `open`, `title`, `message`, `confirmLabel`, `danger` (red vs indigo), `onConfirm`, `onCancel`
- Click backdrop to dismiss
- Scale + fade CSS animation

### `ConfirmationModal.tsx`
Post-booking receipt shown after a successful seat booking.
- Shows all booking details including the UUID booking code
- Download receipt as an HTML file

### `StepIndicator.tsx`
3-step progress indicator shown on user-facing pages: **Schedule → Seats → Book**

---

## How to Run

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8080`

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app starts at **http://localhost:3000**.

### 3. Build for production

```bash
npm run build
npm start
```

---

## Backend Connection

All API calls point to `http://localhost:8080`. The backend must be running for any data to load.

| Frontend Page | Backend Endpoint |
|---|---|
| Home (schedule search) | `GET /api/schedules/by-date?date=` |
| Seat selection | `GET /api/seats/schedule/{scheduleId}` |
| Book a seat | `POST /api/bookings` |
| Track booking | `GET /api/bookings/search?bookingCode=` |
| Admin login | `POST /api/auth/login` |
| Admin buses | `GET/POST/DELETE /api/admin/buses` |
| Admin schedules | `GET/POST/DELETE /api/admin/schedules` |
| Admin bookings | `GET/DELETE /api/admin/bookings` |
| Admin seat management | `GET/PUT /api/admin/seats` |

---

## Environment Summary

| Setting | Value |
|---------|-------|
| Dev server | `http://localhost:3000` |
| API base URL | `http://localhost:8080` |
| Admin token key | `localStorage["adminToken"]` |
| JWT expiry | 1 hour (checked client-side) |

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
