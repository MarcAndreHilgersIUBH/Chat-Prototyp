var socket = io();

const username = prompt("Bitte Namen eingeben:");
const roomname = prompt("Bitte Chat-Raum eingeben: ");

socket.emit("new-connection", { username, roomname });

socket.on("room-entered", (data) => {
    const headline = document.getElementById("headline");
    headline.innerHTML = `Chat App - Raum ${data.roomname}`;
});

socket.on("chat-entered", (data) => {
    console.log("Chat entered >>", data);
    // adds message, not ours
    addMessage(data, false);
});

socket.on("new-message", (data) => {
    console.log(`👾 new-message from ${data.user}`);
    // broadcast message to all sockets except the one that triggered the event
    socket.emit("broadcast-message", {
        user: users[data.user],
        message: data.message,
    });
});

const messageForm = document.getElementById("messageForm");

messageForm.addEventListener("submit", (e) => {
    // avoids submit the form and refresh the page
    e.preventDefault();

    const messageInput = document.getElementById("messageInput");

    // check if there is a message in the input
    if (messageInput.value !== "") {
        let newMessage = messageInput.value;
        //sends message and our id to socket server
        socket.emit("new-message", { roomname, user: socket.id, message: newMessage });
        // appends message in chat container, with isSelf flag true
        addMessage({ user: username, message: newMessage }, true);
        //resets input
        messageInput.value = "";
        messageInput.focus();
    } else {
        // adds error styling to input
        messageInput.classList.add("error");
    }
});

socket.on("broadcast-message", (data) => {
    console.log("📢 broadcast-message event >> ", data);
    // appends message in chat container, with isSelf flag false
    addMessage(data, false);
});

socket.on("chat-left", (data) => {
    addMessage({
        user: "server",
        message: `${data.user.username} hat den Chat verlassen`
    }, false);
});

// receives two params, the message and if it was sent by yourself
// so we can style them differently
function addMessage(data, isSelf = false) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (isSelf) {
        messageElement.classList.add("self-message");
        messageElement.innerText = `${data.user}: ${data.message}`;
    } else {
        if (data.user === "server") {
            // message is from the server, like a notification of new user connected
            // messageElement.classList.add('others-message')
            messageElement.innerText = `${data.message}`;
        } else {
            // message is from other user
            messageElement.classList.add("others-message");
            messageElement.innerText = `${data.user.username}: ${data.message}`;
        }
    }
    // get chatContainer element from our html page
    const chatContainer = document.getElementById("chatContainer");

    // adds the new div to the message container div
    chatContainer.append(messageElement);

    chatContainer.scrollTop = chatContainer.scrollHeight;
}