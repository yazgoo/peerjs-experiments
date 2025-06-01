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
