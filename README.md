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

## Quick start

1. Install Docker and Docker Compose.
2. From the repository root, run:
   ```bash
   docker compose up --build
   ```
3. Open the UI in your browser at `http://localhost:3000`.
4. The backend API is available at `http://localhost:8000`.

## Notes

- The backend seeds a sample stadium layout with 4 gates and 4 subgroups.
- Seat bookings are reserved on a first-come, first-served basis.
- Socket.IO pushes `seat_update` events to all connected clients.
- This sample is designed for laptops or volunteer stations connecting to a centralized server.
