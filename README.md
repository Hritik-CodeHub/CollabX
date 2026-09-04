# CollabX 🚀

A modern, full-stack, real-time video conferencing and collaboration platform built with **WebRTC**, **Socket.IO**, **React 19**, **Tailwind CSS v4**, **Node.js/Express**, and **MongoDB**.

CollabX brings seamless peer-to-peer video calls, screen sharing, in-meeting live chat, hardware-level camera controls, meeting creation, and user meeting history together into an intuitive, responsive interface.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Socket.IO Events](#-socketio-events)
- [Screenshots & UI Highlights](#-screenshots--ui-highlights)
- [License](#-license)

---

## ✨ Features

- 📹 **HD Video & Audio Calling**: Direct peer-to-peer media streaming powered by WebRTC mesh connections.
- 💡 **Physical Hardware Camera Control**: Toggling camera off physically stops video tracks (`track.stop()`) to release the camera sensor and shut off hardware indicator LEDs, substituting dummy black frames to preserve peer connections without drops.
- 🎙️ **Microphone Mute/Unmute**: Software track silencing for quick mic toggling without connection renegotiation.
- 🖥️ **Screen Sharing**: One-click screen sharing leveraging the browser `getDisplayMedia` API.
- 💬 **In-Call Real-Time Chat**: Send and receive instant messages within meeting rooms powered by Socket.IO.
- 🔒 **User Authentication**: Secure JWT-based registration and login with bcrypt password hashing.
- 📅 **Meeting Management & Codes**: Generate unique alphanumeric meeting rooms and validate access codes prior to joining.
- 📜 **Meeting History**: Track past meetings with timestamps, meeting codes, and single-click history deletion.
- 🎨 **Modern Google Meet Style UI**: Clean, glassmorphic, and dark-themed video room design built with Tailwind CSS v4 and MUI Icons.

---

## 🛠 Tech Stack

### Frontend (Client)
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Real-Time Client**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [@mui/icons-material](https://mui.com/material-ui/material-icons/) & [@remixicon/react](https://remixicon.com/)
- **Notifications**: [react-hot-toast](https://react-hot-toast.com/)
- **Forms**: [react-hook-form](https://react-hook-form.com/)

### Backend (Server)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Signaling & Sockets**: [Socket.IO](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **Logging & Security**: Morgan, CORS, Dotenv

---

## 🏗 System Architecture

CollabX uses a **WebRTC Mesh** architecture orchestrated via a **Socket.IO** signaling server:

```
                      ┌───────────────────────┐
                      │   Socket.IO Server    │
                      │  (Signaling & Chat)   │
                      └──────────┬────────────┘
                                 │
                 SDP Offer/Answer & ICE Exchange
                                 │
            ┌────────────────────┴────────────────────┐
            │                                         │
            ▼                                         ▼
   ┌─────────────────┐       P2P Media       ┌─────────────────┐
   │  Client A (Peer)│ ◄═══════════════════► │  Client B (Peer)│
   │  (React/WebRTC) │    (Audio / Video)    │  (React/WebRTC) │
   └─────────────────┘                       └─────────────────┘
```

1. **Signaling**: When a user joins a meeting URL, the client connects to Socket.IO and joins the room channel.
2. **Handshake**: Clients exchange RTCPeerConnection SDP offers, answers, and ICE candidates via Socket.IO.
3. **P2P Streaming**: Video and audio media tracks stream directly between browsers over WebRTC.
4. **Data & Chat**: Room-scoped chat messages broadcast in real time across active participants.

---

## 📁 Project Structure

```text
CollabX/
├── client/                      # React 19 Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── context/             # Auth Context & Provider
│   │   ├── pages/
│   │   │   ├── Authentication.jsx # Login & Register page
│   │   │   ├── History.jsx        # Past meetings dashboard
│   │   │   ├── Home.jsx           # Create or join meeting portal
│   │   │   ├── LandingPage.jsx    # Hero landing page
│   │   │   └── VideoMeet.jsx      # Video room & WebRTC logic
│   │   ├── utils/               # Helper utilities & logging
│   │   ├── App.jsx              # Main routes and Toast provider
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express Backend & Socket Server
│   ├── src/
│   │   ├── connection/          # MongoDB connection logic (db.js)
│   │   ├── controllers/
│   │   │   ├── socketManager.js # WebRTC signaling & room management
│   │   │   └── user.controller.js # Auth, meeting, & history handlers
│   │   ├── middleware/          # JWT authentication middleware
│   │   ├── models/              # Mongoose schemas (User, Meeting)
│   │   ├── routes/              # Express API routes (users.routes.js)
│   │   ├── utiles/              # Helper utilities
│   │   └── app.js               # Server initialization & entry point
│   ├── package.json
│   └── .env                     # Server environment variables
│
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn** / **pnpm**
- **MongoDB** running locally (`mongodb://localhost:27017`) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/Hritik-CodeHub/CollabX.git
cd CollabX
```

### 2. Backend Setup

1. Open a terminal and navigate to the `server` folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory (or configure `server/src/connection/db.js`):
   ```env
   PORT=3000
   MONGODB_URL=mongodb://localhost:27017/collabx
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. Start the backend server:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Or standard production start
   npm start
   ```
   The server will start at `http://localhost:3000`.

### 3. Frontend Setup

1. Open a second terminal and navigate to the `client` folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port number for Express & Socket.IO server | `3000` |
| `MONGODB_URL` | MongoDB connection URI string | `mongodb://localhost:27017/collabx` |
| `JWT_SECRET` | Secret key used for signing JWT authentication tokens | *Required* |

---

## 📡 API Reference

Base URL: `http://localhost:3000/api/users`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Create a new user account | No |
| `POST` | `/login` | Authenticate user and receive JWT token | No |
| `POST` | `/new-meeting` | Save a new meeting instance | Yes (Bearer token) |
| `GET` | `/validate-meeting/:code` | Validate if a meeting room exists/is active | Yes (Bearer token) |
| `GET` | `/user-history` | Fetch meeting history for authenticated user | Yes (Bearer token) |
| `DELETE`| `/delete-meeting/:meetingId` | Delete a meeting record from user history | Yes (Bearer token) |

---

## 🔌 Socket.IO Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-call` | Client ➔ Server | `path` (Room URL) | Requests to join a specific video meeting room |
| `user-joined` | Server ➔ Client | `(socketId, clientsList)` | Broadcasts when a new participant enters the room |
| `signal` | Bidirectional | `(targetSocketId, sdpOrIceData)` | Exchanges WebRTC offers, answers, and ICE candidates |
| `chat-message` | Bidirectional | `(messageData, senderName, senderSocketId)`| Broadcasts room-scoped real-time chat messages |
| `user-left` | Server ➔ Client | `socketId` | Emitted when a peer disconnects or leaves the call |

---

## 🖥️ UI & Application Flow

1. **Landing Page**: Modern hero section welcoming users with options to launch instant calls or sign in.
2. **Authentication**: Tabbed Sign In / Sign Up form with validation and toast alerts.
3. **Dashboard / Home**: Quick actions to **Start an Instant Meeting**, enter an existing **Meeting Code**, or browse **Meeting History**.
4. **Pre-Join Lobby**: Camera & mic preview screen allowing users to test their devices, enter a display name, and verify controls prior to joining.
5. **Meeting Room**:
   - Dynamic grid displaying all connected participant streams.
   - Active speaker / focused view when clicking a participant.
   - Bottom floating control bar: Toggle Camera, Toggle Microphone, Screen Share, In-Meeting Chat Drawer, and Leave Meeting button.
6. **Meeting History**: Comprehensive log of joined sessions with date, time, meeting ID, and deletion support.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

Made with ❤️ by [Hritik Verma](https://github.com/Hritik-CodeHub)

