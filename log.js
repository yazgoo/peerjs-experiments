const logDiv = document.getElementById("log");
const usersDiv = document.getElementById("users");

/* helper functions */

function log(txt, i = false) {
    console.log(txt);
    if (i) {
        txt = "<i>" + txt + "</i>";
    }
    logDiv.innerHTML += txt + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight;
}

function copyURL() {
    navigator.clipboard.writeText(this.url)
        .then(() => this.logi("URL copied"))
        .catch(err => this.logi("Copy failed: " + err));
}

function updateUsers(users) {
    usersDiv.innerHTML = "";
    for (let peerId in users) {
        if (users.hasOwnProperty(peerId)) {
            let user = users[peerId];
            usersDiv.innerHTML += "<div>" + userHTML(user) + "</div>";
        }
    }
}

function logi(txt) {
    log(txt, true);
}

function clear() {
    logDiv.innerHTML = "";
}

function cleanHTML(str) {
    return new DOMParser().parseFromString(str, "text/html").body.textContent;
}

function userColor(user) {
    // generate a color based on the username
    let hash = 0;
    for (let i = 0; i < user.length; i++) {
        hash = user.charCodeAt(i) + ((hash << 5) - hash);
    }
    return '#' + ((hash & 0x00FFFFFF).toString(16).padStart(6, '0'));
}

function userHTML(user) {
    return '<span style="font-weight: bold; color: ' + userColor(user) + ';">' + cleanHTML(user) + '</span>';
}
