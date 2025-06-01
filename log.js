const logDiv = document.getElementById("log");

/* helper functions */

function log(txt, i = false) {
    console.log(txt);
    if (i) {
        txt = "<i>" + txt + "</i>";
    }
    logDiv.innerHTML += txt + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight;
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

function userHTML(user) {
    // genererate a color base on the username
    let hash = 0;
    for (let i = 0; i < user.length; i++) {
        hash = user.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#' + ((hash & 0x00FFFFFF).toString(16).padStart(6, '0'));
    return '<span style="font-weight: bold; color: ' + color + ';">' + cleanHTML(user) + '</span>';
}
