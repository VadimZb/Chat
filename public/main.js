const socket = io();
const $messages = document.querySelector("#messages");
const $inputField = document.querySelector("#inputField");
const $username = document.querySelector("#username");
const $online = document.querySelector("#online");

function generateMessage(type, username, text) {
    function generateUsername(username) {
        const element = document.createElement("span");
        element.classList.add("bold", "colon", "big", "space-left");
        element.textContent = username;
        return element;
    }

    function generateText(text) {
        const element = document.createElement("span");
        element.classList.add("big");
        element.textContent = text;
        return element;
    }

    function generateDate() {
        const span = document.createElement("span");
        const date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();

        if (hours < 10) {
            hours = `0${hours}`;
        }

        if (minutes < 10) {
            minutes = `0${minutes}`;
        }

        const time = `${hours}:${minutes}`;
        span.textContent = time;
        span.classList.add("gray", "small", "space-left");
        return span;
    }

    function generateIcon(type) {
        const element = document.createElement("i");
        if (type === "io") {
            element.classList.add("fas", "fa-user");
        } else if (type === "socket") {
            element.classList.add("far", "fa-user");
        } else if (type === "system") {
            element.classList.add("far", "fa-bell");
        } else {
            throw Error("Wrong type provided");
        }
        return element;
    }

    function generateSystemMsg(username, text) {
        const span = document.createElement("span");
        span.classList.add("gray", "space-left");
        span.textContent = `${username} ${text}`;

        const icon = generateIcon("system");

        const li = document.createElement("li");
        li.classList.add(
            "margin-vertical",
            "margin-horizontal",
            "padding",
            "align-center"
        );

        for (let element of [icon, span]) {
            li.appendChild(element);
        }

        return li;
    }

    function generateLi(type, username, text) {
        const li = document.createElement("li");
        const spanIcon = generateIcon(type);
        const spanUsername = generateUsername(username);
        const spanText = generateText(text);
        const spanDate = generateDate();

        for (let span of [spanIcon, spanUsername, spanText, spanDate]) {
            li.appendChild(span);
        }

        li.classList.add(
            "margin-vertical",
            "margin-horizontal",
            "border",
            "padding"
        );

        if (type === "io") {
            li.classList.add("light-bg");
        } else {
            li.classList.add("light-green-bg");
        }

        return li;
    }

    if (type === "system") {
        return generateSystemMsg(username, text);
    } else {
        return generateLi(type, username, text);
    }
}

function enterChat() {
    if ($username.value.replace("/s/", "")) {
        const $namePage = document.getElementById("name");
        const $chatPage = document.getElementById("chat");
        const $header = document.getElementById("header");
        const $info = document.getElementById("info");
        $info.textContent = $username.value;
        socket.emit("name given", $username.value);
        $namePage.style.display = "none";
        $chatPage.style.display = "flex";
    }
}

function addMessage(message) {
    $messages.appendChild(message);
    $messages.scrollTop = $messages.scrollHeight;
}

function sendMessage() {
    if ($inputField.value) {
        const message = generateMessage(
            "socket",
            $username.value,
            $inputField.value
        );
        addMessage(message);
        socket.emit("message sent", $username.value, $inputField.value);
        $inputField.value = "";
        $inputField.focus();
    }
}

socket.on("user joined", (username) => {
    const message = generateMessage("system", username, "joined");
    addMessage(message);
});

socket.on("user left", (username) => {
    const message = generateMessage("system", username, "left");
    addMessage(message);
});

socket.on("new message", (username, text) => {
    const message = generateMessage("io", username, text);
    addMessage(message);
});

socket.on("refresh online", (online) => {
    $online.textContent = online;
});
