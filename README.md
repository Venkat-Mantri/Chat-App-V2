# Chat Application (chat-app-v2)

## Overview

This project is a real-time chat application built using HTML, CSS, JavaScript, and WebSockets (Node.js with the `ws` library).

Users can create or join chat rooms, exchange messages instantly without refreshing the page, and view active participants in real time.

The application supports multiple rooms and includes user validation, room management, message formatting, and logout functionality.


## Features

- Real-time messaging using WebSockets  
- Multi-room support  
- Live list of available rooms  
- Active user list per room  
- Duplicate username prevention (per room)  
- Join and leave notifications  
- Logout functionality without refreshing the page  
- Auto-scroll to latest message  
- Basic text formatting:
  - Bold (**text**)  
  - Italic (*text*)  
  - Clickable links  
- Basic XSS protection (HTML escaping)  
- Responsive UI for desktop and mobile  


## Technologies Used

- HTML  
- CSS (Flexbox for layout and responsiveness)  
- JavaScript (Vanilla JS)  
- Node.js  
- WebSocket (`ws` library)  


## Project Structure

chat-app-v2/
│
├── server.js
│
└── public/
    ├── index.html
    ├── style.css
    └── script.js


- server.js handles HTTP serving, WebSocket connections, room management, and broadcasting.
- index.html contains the UI structure.
- style.css manages layout and responsive styling.
- script.js handles client-side WebSocket communication and UI updates.


## How It Works

### WebSocket Connection

When the page loads, a WebSocket connection is established with the server. This enables real-time communication without page refresh.

### Room Management

- Users can create a new room by entering a new room name.
- Existing rooms are displayed dynamically.
- Empty rooms are automatically removed when all users leave.

### Username Validation

Usernames must be unique within a room. If a duplicate username is detected, the server returns an error response.

### Message Handling

Messages are broadcast only to users within the same room. Each message includes:

- Username  
- Timestamp  
- Formatted content  

User input is sanitized to prevent script injection attacks.

### Logout Flow

When a user clicks Logout:

- A logout event is sent to the server.
- The user is removed from the room.
- The UI resets to the login screen.
- Room list updates automatically.


## Setup Instructions

### Install Dependencies

Make sure Node.js is installed.

npm install ws

### Start the Server

node server.js

The application runs at:

http://localhost:3000


## Testing Scenarios Covered

- Duplicate username prevention  
- Real-time message broadcasting  
- Join and leave notifications  
- Logout functionality  
- Room list updates  
- Responsive layout behavior  
- Basic XSS input handling  


## Limitations

- No database (rooms and messages are stored in memory only)  
- No authentication system  
- Data resets when the server restarts  
- Not configured for HTTPS production deployment  


## Future Improvements

- Persistent storage using a database  
- Private messaging between users  
- Typing indicators  
- Message edit and delete functionality  
- Authentication system  
- Production-ready deployment with WSS  


## Conclusion

This project demonstrates a structured implementation of real-time communication using WebSockets. It focuses on clean architecture, proper state handling, and fulfilling the functional requirements of a multi-room chat application.