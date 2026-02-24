let socket = new WebSocket("ws://localhost:3000");

let currentRoom = "";
let currentUser = "";

const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const joinBtn = document.getElementById("join-btn");
const sendBtn = document.getElementById("send-btn");
const logoutBtn = document.getElementById("logout-btn");
const messageInput = document.getElementById("message-input");
const messagesDiv = document.getElementById("messages");
const errorText = document.getElementById("error");
const userList = document.getElementById("user-list");
const roomList = document.getElementById("room-list");
const roomTitle = document.getElementById("room-title");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "roomList") updateRoomList(data.rooms);
  if (data.type === "error") errorText.innerText = data.message;

  if (data.type === "joinSuccess") {
    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
  }

  if (data.type === "message")
    displayMessage(data.username, data.message, data.timestamp);

  if (data.type === "notification")
    displayNotification(data.message);

  if (data.type === "userList")
    updateUserList(data.users);
};

joinBtn.onclick = joinRoom;
sendBtn.onclick = sendMessage;
logoutBtn.onclick = logout;

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function joinRoom() {
  const username = document.getElementById("username").value.trim();
  const room = document.getElementById("room").value.trim();

  if (!username || !room) {
    errorText.innerText = "Username and Room are required.";
    return;
  }

  currentUser = username;
  currentRoom = room;
  roomTitle.innerText = "Room: " + room;

  socket.send(JSON.stringify({
    type: "join",
    username,
    room
  }));
}

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  socket.send(JSON.stringify({
    type: "message",
    message
  }));

  messageInput.value = "";
}

function logout() {
  socket.send(JSON.stringify({ type: "logout" }));

  chatScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");

  messagesDiv.innerHTML = "";
  userList.innerHTML = "";
  document.getElementById("username").value = "";
  document.getElementById("room").value = "";

  currentUser = "";
  currentRoom = "";
}

function displayMessage(username, message, timestamp) {
  const div = document.createElement("div");
  div.classList.add("message");

  if (username === currentUser) div.classList.add("own");

  div.innerHTML = `
    <div class="message-header">
      <span>${username}</span>
      <span>${timestamp}</span>
    </div>
    <div>${formatText(message)}</div>
  `;

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displayNotification(text) {
  const div = document.createElement("div");
  div.classList.add("notification");
  div.innerText = text;
  messagesDiv.appendChild(div);
}

function updateUserList(users) {
  userList.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    li.innerText = user;
    userList.appendChild(li);
  });
}

function updateRoomList(rooms) {
  roomList.innerHTML = "";
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    li.onclick = () => {
      document.getElementById("room").value = room;
    };
    roomList.appendChild(li);
  });
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatText(text) {
  text = escapeHTML(text);
  text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  text = text.replace(/\*(.*?)\*/g, "<i>$1</i>");
  text = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );
  return text;
}