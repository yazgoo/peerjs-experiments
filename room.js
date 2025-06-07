class Room {
    constructor({ onLog, onUsersUpdate, onMessage, buildPayload, getUsername }) {
        this.isServer = !location.hash || location.hash === "";
        this.connections = [];
        this.users = {};
        this.peerId = null;
        this.peer = null;
        this.url = location.href;
        this.onLog = onLog || (() => {});
        this.onUsersUpdate = onUsersUpdate || (() => {});
        this.onMessage = onMessage || (() => {});
        this.buildPayload = buildPayload || (() => {});
        this.getUsername = getUsername || (() => {});
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

    init() {
        if (this.isServer) {
            const roomName = crypto.randomUUID();
            this.peer = new Peer(roomName);
            this.peer.on('open', id => {
                this.peerId = id;
                this.url += `#${roomName}`;
                this.logi(`Share this URL: <a href='${this.url}'>${this.url}</a>`);
            });
            this.peer.on('connection', conn => {
                this.logi(`New connection: ${conn.peer}`);
                this.connections.push(conn);
                conn.on('data', data => {
                    this.handleWithUsers(data);
                    this.connections.forEach(c => {
                        if (c !== conn) c.send(data);
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
            });
        } else {
            const roomName = location.hash.replace("#", "");
            this.peer = new Peer();
            this.peer.on('open', id => {
                this.peerId = id;
                this.logi(`Client ID: ${id}`);
                const conn = this.peer.connect(roomName);
                conn.on('open', () => {
                    this.logi(`Connected to host`);
                    conn.on('data', data => this.handleWithUsers(data));
                    this.connections.push(conn);
                });
                conn.on('close', () => {
                    this.logi(`Lost connection to host`);
                });
            });
        }
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
