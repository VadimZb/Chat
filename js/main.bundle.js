"use strict";

var socket = io();
var $messages = document.querySelector("#messages");
var $inputField = document.querySelector("#inputField");
var $username = document.querySelector("#username");
var $online = document.querySelector("#online");

window.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function generateMessage(type, username, text) {
    function generateUsername(username) {
        var element = document.createElement("span");
        element.classList.add("bold", "colon", "big", "space-left");
        element.textContent = username;
        return element;
    }

    function generateText(text) {
        var element = document.createElement("span");
        element.classList.add("big");
        element.textContent = text;
        return element;
    }

    function generateDate() {
        var span = document.createElement("span");
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();

        if (hours < 10) {
            hours = "0" + hours;
        }

        if (minutes < 10) {
            minutes = "0" + minutes;
        }

        var time = hours + ":" + minutes;
        span.textContent = time;
        span.classList.add("gray", "small", "space-left");
        return span;
    }

    function generateIcon(type) {
        var element = document.createElement("i");
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
        var span = document.createElement("span");
        span.classList.add("gray", "space-left");
        span.textContent = username + " " + text;

        var icon = generateIcon("system");

        var li = document.createElement("li");
        li.classList.add("margin-vertical", "margin-horizontal", "padding", "align-center");

        var _arr = [icon, span];
        for (var _i = 0; _i < _arr.length; _i++) {
            var element = _arr[_i];
            li.appendChild(element);
        }

        return li;
    }

    function generateLi(type, username, text) {
        var li = document.createElement("li");
        var spanIcon = generateIcon(type);
        var spanUsername = generateUsername(username);
        var spanText = generateText(text);
        var spanDate = generateDate();

        var _arr2 = [spanIcon, spanUsername, spanText, spanDate];
        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
            var span = _arr2[_i2];
            li.appendChild(span);
        }

        li.classList.add("margin-vertical", "margin-horizontal", "border", "padding");

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
    if ($username.value.replace(/\s/g, "").length) {
        var $namePage = document.getElementById("name");
        var $chatPage = document.getElementById("chat");
        var $header = document.getElementById("header");
        var $info = document.getElementById("info");
        $info.textContent = $username.value;
        socket.emit("name given", $username.value);
        $namePage.style.display = "none";
        $chatPage.style.display = "flex";
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
        var message = generateMessage("socket", $username.value, $inputField.value);
        addMessage(message);
        socket.emit("message sent", $username.value, $inputField.value);
        $inputField.value = "";
    } else {
        $inputField.value = "";
    }
    $inputField.focus();
}

socket.on("user joined", function (username) {
    var message = generateMessage("system", username, "joined");
    addMessage(message);
});

socket.on("user left", function (username) {
    var message = generateMessage("system", username, "left");
    addMessage(message);
});

socket.on("new message", function (username, text) {
    var message = generateMessage("io", username, text);
    addMessage(message);
});

socket.on("refresh online", function (online) {
    $online.textContent = online;
});
