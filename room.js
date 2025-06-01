const isServer = !location.hash || location.hash === "";
const connections = [];
let peerId = null;
let users = {};

function handleWithUsers(data) {
    handle(data);
    if(users[data.peerId] && users[data.peerId] === data.usr) {
        return;
    }
    users[data.peerId] = data.usr;
    onUsersUpdate(users);
}

/* main net logic */

if(isServer) {
    const roomName = crypto.randomUUID();
    const peer = new Peer(roomName);
    peer.on('open', id => {
        peerId = id;
        const newUrl = location.href + "#" + roomName;
        logi("please share the following URL: <a href='" + newUrl + "'>" + newUrl + "</a>");
    });
    peer.on('connection', conn => {
        logi("New connection: " + conn.peer);
        connections.push(conn);
        conn.on('data', data => {
            handleWithUsers(data);
            connections.forEach(c => {
                if (c !== conn) c.send(data);
            });
        });
    });
} else {
    const peer = new Peer();
    peer.on('open', id => {
        peerId = id;
        const roomName = location.hash.replace("#", "");
        logi("starting client with ID: " + id);
        const conn = peer.connect(roomName);
        conn.on('open', () => {
            logi("Connected to host");
            conn.on('data', data => handleWithUsers(data));
            connections.push(conn);
        });
    });
}

window.send = (what) => {
    if(!usr.value || usr.value.trim() === "") {
        alert("Please enter a username");
        return;
    }
    let payload = buildPayload(what);
    if(payload !== null) {
        payload['peerId'] = peerId;
        payload['usr'] = usr.value;
        handleWithUsers(payload);
        connections.forEach(c => c.send(payload));
    }
};
