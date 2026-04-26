# Stadium Seat Booking Sample

This sample project demonstrates a real-time stadium seat booking system using:

- UI: Next.js
- Backend: FastAPI + Socket.IO
- Database: PostgreSQL
- Live updates: Socket.IO between frontend and backend
- Deployment: Docker / Docker Compose

## Project structure

- `frontend/` – Next.js application for seat selection and availability display
- `backend/` – FastAPI application with PostgreSQL seat state storage
- `docker-compose.yml` – local setup for PostgreSQL, backend, and frontend

## Quick start (single laptop)

1. Install Docker and Docker Compose.
2. From the repository root, run:
   ```bash
   docker compose up --build
   ```
3. Open the UI in your browser at `http://localhost:3000`.
4. The backend API is available at `http://localhost:8000`.

## Multi-laptop setup over a Wi-Fi router

The intended deployment is one **host laptop** running the full stack (Postgres + backend + frontend in Docker), with up to **3 additional volunteer laptops** opening the UI in a browser. All four laptops share the same backend and see live updates as bookings happen.

### Steps

1. Connect all 4 laptops to the same Wi-Fi router.
2. Pick one laptop as the **host** and find its LAN IP:
   - macOS: `ipconfig getifaddr en0` (or `en1` for second interface)
   - Linux: `hostname -I | awk '{print $1}'`
   - Windows: `ipconfig` and look at the IPv4 address of the active adapter
   The address typically looks like `192.168.1.42`.
3. On the host laptop, from the repository root:
   ```bash
   docker compose up --build
   ```
   Ports `3000` (frontend) and `8000` (backend) are bound to all interfaces, so other laptops on the same network can reach them.
4. On each volunteer laptop, open a browser at:
   ```
   http://<host-ip>:3000
   ```
   for example `http://192.168.1.42:3000`. The frontend automatically derives the backend URL from the hostname in the address bar (`http://<host-ip>:8000`), so no per-laptop configuration is needed.
5. Set a unique **Laptop name** in the UI on each device (e.g. `volunteer-laptop-1` … `4`). Each name renders bookings in a distinct color so the four operators can tell their reservations apart at a glance.

### Verifying real-time sync

- Reserve a seat on laptop 1. Within a fraction of a second, laptops 2–4 should show that seat in laptop 1's color, no refresh required.
- The status chip at the top of the page shows `Connected to http://<host-ip>:8000` when the Socket.IO link is healthy.

### Firewall

If a volunteer laptop can load `http://<host-ip>:3000` but the status chip stays on `Connect error`, the host's firewall is likely blocking inbound traffic on port `8000`. Allow that port for local-network connections.

## Notes

- The backend seeds a sample stadium layout with 4 gates and 4 subgroups (50 seats each → 800 seats).
- Seat bookings are reserved on a first-come, first-served basis and persist in PostgreSQL.
- Socket.IO pushes `seat_update` events to all connected clients on every reservation.
- Each `reserved_by` value renders in its own deterministic color, so seats booked by different laptops are visually distinguishable.
