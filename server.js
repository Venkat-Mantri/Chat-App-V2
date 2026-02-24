const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  let filePath = path.join(
    __dirname,
    "public",
    req.url === "/" ? "index.html" : req.url
  );

  const ext = path.extname(filePath);
  const contentType = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript"
  }[ext] || "text/plain";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

const wss = new WebSocket.Server({ server });
const rooms = {};

wss.on("connection", (ws) => {

  // Send current rooms immediately
  ws.send(JSON.stringify({
    type: "roomList",
    rooms: Object.keys(rooms)
  }));

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    // JOIN
    if (data.type === "join") {
      const { username, room } = data;

      if (!rooms[room]) {
        rooms[room] = { users: {}, clients: [] };
      }

      if (rooms[room].users[username]) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Username already taken in this room."
        }));
        return;
      }

      ws.username = username;
      ws.room = room;

      rooms[room].users[username] = ws;
      rooms[room].clients.push(ws);

      ws.send(JSON.stringify({
        type: "joinSuccess",
        room
      }));

      broadcast(room, {
        type: "notification",
        message: `${username} joined the room`
      });

      sendUserList(room);
      sendRoomList();
    }

    // MESSAGE
    if (data.type === "message") {
      if (!ws.room) return;

      const timestamp = new Date().toLocaleTimeString();

      broadcast(ws.room, {
        type: "message",
        username: ws.username,
        message: data.message,
        timestamp
      });
    }

    // LOGOUT (explicit leave)
    if (data.type === "logout") {
      handleLeave(ws);
    }
  });

  ws.on("close", () => {
    handleLeave(ws);
  });
});

function handleLeave(ws) {
  if (ws.room && rooms[ws.room]) {

    delete rooms[ws.room].users[ws.username];

    rooms[ws.room].clients =
      rooms[ws.room].clients.filter(client => client !== ws);

    broadcast(ws.room, {
      type: "notification",
      message: `${ws.username} left the room`
    });

    sendUserList(ws.room);

    if (rooms[ws.room].clients.length === 0) {
      delete rooms[ws.room];
    }

    sendRoomList();
  }
}

function broadcast(room, data) {
  if (!rooms[room]) return;

  rooms[room].clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function sendUserList(room) {
  if (!rooms[room]) return;

  const users = Object.keys(rooms[room].users);

  broadcast(room, {
    type: "userList",
    users
  });
}

function sendRoomList() {
  const roomNames = Object.keys(rooms);

  const data = JSON.stringify({
    type: "roomList",
    rooms: roomNames
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});