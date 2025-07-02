class Log {

    log(txt, i = false) {
        console.log(txt);
        if (i) {
            txt = "<i>" + txt + "</i>";
        }
        logBox.innerHTML += txt + "<br>";
        logBox.scrollTop = logBox.scrollHeight;
    }

    updateUsers(users) {
        usersBox.innerHTML = "";
        for (let peerId in users) {
            if (users.hasOwnProperty(peerId)) {
                let user = users[peerId];
                usersBox.innerHTML += "<div>" + this.userHTML(user) + "</div>";
            }
        }
    }

    logi(txt) {
        this.log(txt, true);
    }

    clear() {
        logBox.innerHTML = "";
    }

    cleanHTML(str) {
        return new DOMParser().parseFromString(str, "text/html").body.textContent;
    }

    userColor(user) {
        // generate a color based on the username
        let hash = 0;
        for (let i = 0; i < user.length; i++) {
            hash = user.charCodeAt(i) + ((hash << 5) - hash);
        }
        return '#' + ((hash & 0x00FFFFFF).toString(16).padStart(6, '0'));
    }

    userHTML(user) {
        return '<span style="font-weight: bold; color: ' + this.userColor(user) + ';">' + this.cleanHTML(user) + '</span>';
    }
}


if (typeof module !== 'undefined') {
  module.exports = { Log };
}
