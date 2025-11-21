# FaceLink

A real-time peer-to-peer video calling application built with WebRTC technology, enabling direct browser-to-browser video communication.

## Overview

FaceLink is a video calling application that allows users to connect with each other through their browsers using WebRTC for peer-to-peer connections. The application features real-time user presence tracking, call management, and a clean, modern user interface.

## Technologies Used

### Backend
- Node.js
- Express.js
- Socket.IO (WebSocket communication)
- CORS (Cross-Origin Resource Sharing)
- dotenv (Environment variable management)

### Frontend
- React 19
- Vite (Build tool and dev server)
- Socket.IO Client
- WebRTC API
- CSS3 (Modular styling)
- ESLint (Code quality)

### Key Features
- Real-time video calling using WebRTC
- Peer-to-peer connection establishment
- User presence tracking
- Online users list
- Incoming call notifications
- Call accept/reject functionality
- Camera preview testing
- Responsive design

## Project Structure

```
FaceLink/
├── backend/
│   ├── handlers/
│   │   ├── userhandlers.js
│   │   └── webrtchandlers.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── VideoSection.jsx
│   │   ├── hooks/
│   │   │   ├── usecallhandlers.js
│   │   │   ├── usesocketconnection.js
│   │   │   └── usewebrtc.js
│   │   ├── styles/
│   │   │   ├── animations.css
│   │   │   ├── base.css
│   │   │   ├── buttons.css
│   │   │   ├── controls.css
│   │   │   ├── responsive.css
│   │   │   └── video.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Modern web browser with WebRTC support

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
PORT=8181
```

4. Start the backend server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The backend server will start on http://localhost:8181

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
VITE_BACKEND_URL=http://localhost:8181
```

4. Start the development server:
```bash
npm run dev
```

The frontend application will start on http://localhost:5173

### Building for Production

To create a production build of the frontend:
```bash
cd frontend
npm run build
```

The build output will be in the `frontend/dist` directory.

## Usage

1. Open the application in your web browser
2. Set your unique user ID
3. View the list of online users
4. Click on any online user to initiate a video call
5. The receiving user can accept or reject the call
6. Once connected, use the call controls to manage your session

## WebRTC Configuration

The application uses Google's public STUN server for NAT traversal:
- STUN Server: stun:stun.l.google.com:19302

For production deployments, consider using your own TURN servers for better connectivity in restricted network environments.


## Development


### Available Scripts

Backend:
- `npm start` - Start the server
- `npm run dev` - Start with nodemon for development

Frontend:
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

