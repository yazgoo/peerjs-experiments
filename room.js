let Peer;

if (typeof module !== 'undefined' && module.exports) {
  Peer = require('peerjs').Peer;
} else {
  // Browser
  Peer = window.Peer;
}
class Room {
    constructor({ onLog, onUsersUpdate, onMessage, buildPayload, getUsername, myLocation }) {
        this.myLocation = myLocation || location;
        this.isServer = !this.myLocation.hash || this.myLocation.hash === "";
        this.connections = [];
        this.users = {};
        this.peerId = null;
        this.peer = null;
        this.url = this.myLocation.href;
        this.onLog = onLog || (() => {});
        this.onUsersUpdate = onUsersUpdate || (() => {});
        this.onMessage = onMessage || (() => {});
        this.buildPayload = buildPayload || (() => {});
        this.getUsername = getUsername || (() => {});
        this.nextServer = null;
    }

    copyURL() {
        navigator.clipboard.writeText(this.url)
            .then(() => logi("URL copied"))
            .catch(err => logi("Copy failed: " + err));
    }

    logi(msg) {
        this.onLog(msg, true);
    }

    dropUser(peerId) {
        this.logi(`Dropping user: ${peerId} (${this.users[peerId] || "unknown"})`);
        delete this.users[peerId];
        this.onUsersUpdate(this.users);
    }

    handleWithUsers(data) {
        this.onMessage(data);
        if (this.users[data.peerId] === data.usr) return;
        if (data.what === "disconnect") {
            this.dropUser(data.peerId);
            return;
        }
        this.users[data.peerId] = data.usr;
        this.onUsersUpdate(this.users);
    }

    startServer(roomName) {
        this.logi(`Server started with ID: ${this.peerId}`);
        this.url = this.url.replace(/#.*$/, "");
        this.url += `#${this.peerId}`;
        this.logi(`Share this URL: <a href='${this.url}'>${this.url}</a>`);
    }

    onConnectionOnServer(conn) {
        this.logi(`New connection: ${conn.peer}`);
        this.connections.push(conn);
        conn.on('data', data => {
            this.handleWithUsers(data);
            this.connections.forEach(c => {
                if (c !== conn) c.send(data);
            });
            this.nextServer = conn.peer;
            this.connections.forEach(c => {
                c.send({ what: "nextServer", peerId: this.nextServer });
            });
        });
        conn.on('close', () => {
            this.logi(`Connection closed: ${conn.peer}`);
            this.connections = this.connections.filter(c => c !== conn);
            this.dropUser(conn.peer);
            this.connections.forEach(c => {
                c.send({ what: "disconnect", peerId: conn.peer });
            });
        });
    }

    onClientOpen(roomName) {
        this.logi(`Client ID: ${this.peerId}`);
        const conn = this.peer.connect(roomName);
        conn.on('open', () => {
            this.logi(`Connected to host`);
            conn.on('data', data => {
                if( data.what === "nextServer") {
                    this.nextServer = data.peerId;
                } else {
                    this.handleWithUsers(data)
                }
            });
            this.connections.push(conn);
        });
        conn.on('close', () => {
            this.logi(`Lost connection to host`);
            if(this.nextServer) {
                this.dropUser(roomName);
                if(this.nextServer === this.peerId) {
                    this.logi(`switching to server mode`);
                    this.isServer = true;
                    this.startServer();
                } else {
                    this.onClientOpen(this.nextServer);
                }
            }
        });
    }

    clientServer(roomName) {
        this.peer = this.isServer ? new Peer(roomName) : new Peer();
        this.peer.on('error', (err) => {
            this.onLog('[Peer error]' + err);
        });
        this.peer.on('open', id => {
            this.peerId = id;
            if (this.isServer) {
                this.startServer();
            } else {
                this.onClientOpen(roomName);
            }
        });
        this.peer.on('connection', conn => {
            if (this.isServer) {
                this.onConnectionOnServer(conn);
            }
        });
    }

    init() {
        let roomName = this.isServer ? crypto.randomUUID() : this.myLocation.hash.replace("#", "");
        this.clientServer(roomName);
    }

    send(what) {
        let usr = this.getUsername();
        if (!usr || usr.trim() === "") {
            alert("Please enter a username");
            return;
        }
        let payload = this.buildPayload(what);
        if (!payload) return;
        payload.peerId = this.peerId;
        payload.usr = usr;
        this.handleWithUsers(payload);
        this.connections.forEach(c => c.send(payload));
    }

}

if (typeof module !== 'undefined') {
  module.exports = { Room };
}
