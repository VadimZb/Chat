const socket = io();
const $messages = document.querySelector("#messages");
const $inputField = document.querySelector("#inputField");
const $username = document.querySelector("#username");
const $online = document.querySelector("#online");

window.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

let lastUser = "";

function generateMessage(type, username, text) {
    function generateUsername(username) {
        const element = document.createElement("span");
        element.classList.add("bold", "big", "space-left");
        element.textContent = username;
        return element;
    }

    function generateLink(text) {
        const element = document.createElement("a");
        element.setAttribute("href", text);
        element.setAttribute("target", "_blank");
        element.classList.add("a", "bold");
        element.textContent = text;
        return element;
    }

    function generateText(text) {
        const element = document.createElement("span");
        element.classList.add("big");
        const expression = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
        const url_regex = new RegExp(expression);
        if (url_regex.test(text)) {
            element.appendChild(generateLink(text));
        } else {
            element.textContent = text;
        }

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
        span.classList.add("gray", "small", "space-left", "nocopy");
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
        span.classList.add("gray", "space-left", "nocopy");
        span.textContent = `${username} ${text}`;

        const icon = generateIcon("system");

        const li = document.createElement("li");
        li.classList.add(
            "margin-vertical",
            "margin-horizontal",
            "padding",
            "align-center",
            "animated"
        );

        for (let element of [icon, span]) {
            li.appendChild(element);
        }

        return li;
    }

    function generateDiv(type, role, border) {
        const element = document.createElement("div");
        if (role === "text") {
            element.classList.add("padding");
            if (border) {
                element.classList.add("border-top");
            }

            if (type === "socket") {
                element.classList.add("lightest-green-bg");
            } else {
                element.classList.add("lightest-bg");
            }
        } else if (role === "info") {
            element.classList.add("margin-horizontal", "margin-vertical");
        }

        return element;
    }

    function generateLi(type, username, text) {
        const li = document.createElement("li");

        if (username === lastUser) {
            const spanText = generateText(text);
            const divText = generateDiv(type, "text");

            divText.appendChild(spanText);
            li.appendChild(divText);

            li.classList.add(
                "margin-vertical",
                "margin-horizontal",
                "border",
                "animated"
            );

            if (type === "io") {
                li.classList.add("lightest-bg");
            } else {
                li.classList.add("lightest-green-bg");
            }
        } else {
            const spanIcon = generateIcon(type);
            const spanUsername = generateUsername(username);
            const spanText = generateText(text);
            const spanDate = generateDate();
            const divInfo = generateDiv(type, "info");
            const divText = generateDiv(type, "text");

            for (let infoData of [spanIcon, spanUsername, spanDate]) {
                divInfo.appendChild(infoData);
            }

            divText.appendChild(spanText);

            for (let div of [divInfo, divText]) {
                li.appendChild(div);
            }

            li.classList.add(
                "margin-vertical",
                "margin-horizontal",
                "border",
                "animated"
            );

            if (type === "io") {
                li.classList.add("light-bg");
            } else {
                li.classList.add("light-green-bg");
            }
        }
        lastUser = username;
        return li;
    }

    if (type === "system") {
        return generateSystemMsg(username, text);
    } else {
        return generateLi(type, username, text);
    }
}

function enterChat() {
    if ($username.value.replace(/\s/g, "").length) {
        if ($username.value.length > 20) {
            alert("Username should less than 20 characters.");
            $username.focus();
        } else if (usersArray.includes($username.value)) {
            alert("Username is taken");
            $username.focus();
        } else {
            const $namePage = document.getElementById("name");
            const $chatPage = document.getElementById("chat");
            const $header = document.getElementById("header");
            const $info = document.getElementById("info");
            $info.textContent = $username.value;
            socket.emit("name given", $username.value);
            $namePage.style.display = "none";
            $chatPage.style.display = "flex";
            console.log(usersArray);
            console.log($username.value);
        }
    } else {
        $username.value = "";
        $username.focus();
    }
}

function addMessage(message) {
    $messages.appendChild(message);
    $messages.scrollTop = $messages.scrollHeight;
}

function sendMessage() {
    if ($inputField.value.replace(/\s/g, "").length) {
        const message = generateMessage(
            "socket",
            $username.value,
            $inputField.value
        );
        addMessage(message);
        socket.emit("message sent", $username.value, $inputField.value);
        $inputField.value = "";
    } else {
        $inputField.value = "";
    }
    $inputField.focus();
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

let usersArray = [];
socket.on("send blacklist", (users) => {
    console.log(users);
    usersArray = users;
});
