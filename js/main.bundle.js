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
        element.classList.add("bold", "big", "space-left");
        element.textContent = username;
        return element;
    }

    function generateLink(text) {
        var element = document.createElement("a");
        element.setAttribute("href", text);
        element.setAttribute("target", "_blank");
        element.classList.add("a", "bold");
        element.textContent = text;
        return element;
    }

    function generateText(text) {
        var element = document.createElement("span");
        element.classList.add("big");
        var expression = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
        var url_regex = new RegExp(expression);
        if (url_regex.test(text)) {
            element.appendChild(generateLink(text));
        } else {
            element.textContent = text;
        }

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
        span.classList.add("gray", "small", "space-left", "nocopy");
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
        span.classList.add("gray", "space-left", "nocopy");
        span.textContent = username + " " + text;

        var icon = generateIcon("system");

        var li = document.createElement("li");
        li.classList.add("margin-vertical", "margin-horizontal", "padding", "align-center", "animated");

        var _arr = [icon, span];
        for (var _i = 0; _i < _arr.length; _i++) {
            var element = _arr[_i];
            li.appendChild(element);
        }

        return li;
    }

    function generateDiv(type, role) {
        var element = document.createElement("div");
        if (role === "text") {
            element.classList.add("padding", "border-top");

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
        var li = document.createElement("li");
        var spanIcon = generateIcon(type);
        var spanUsername = generateUsername(username);
        var spanText = generateText(text);
        var spanDate = generateDate();
        var divInfo = generateDiv(type, "info");
        var divText = generateDiv(type, "text");

        var _arr2 = [spanIcon, spanUsername, spanDate];
        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
            var infoData = _arr2[_i2];
            divInfo.appendChild(infoData);
        }

        divText.appendChild(spanText);

        var _arr3 = [divInfo, divText];
        for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
            var div = _arr3[_i3];
            li.appendChild(div);
        }

        li.classList.add("margin-vertical", "margin-horizontal", "border", "animated");

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
        if ($username.value.length > 20) {
            alert("Username should less than 20 characters.");
            $username.focus();
        } else {
            var $namePage = document.getElementById("name");
            var $chatPage = document.getElementById("chat");
            var $header = document.getElementById("header");
            var $info = document.getElementById("info");
            $info.textContent = $username.value;
            socket.emit("name given", $username.value);
            $namePage.style.display = "none";
            $chatPage.style.display = "flex";
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
