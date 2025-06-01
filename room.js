const isServer = !location.hash || location.hash === "";
const connections = [];
/* main net logic */

if(isServer) {
    const roomName = crypto.randomUUID();
    const peer = new Peer(roomName);
    peer.on('open', id => {
        const newUrl = location.href + "#" + roomName;
        logi("please share the following URL: <a href='" + newUrl + "'>" + newUrl + "</a>");
    });
    peer.on('connection', conn => {
        logi("New connection: " + conn.peer);
        connections.push(conn);
        conn.on('data', data => {
            handle(data);
            connections.forEach(c => {
                if (c !== conn) c.send(data);
            });
        });
    });
} else {
    const peer = new Peer();
    peer.on('open', id => {
        const roomName = location.hash.replace("#", "");
        logi("starting client with ID: " + id);
        const conn = peer.connect(roomName);
        conn.on('open', () => {
            logi("Connected to host");
            conn.on('data', data => handle(data));
            connections.push(conn);
        });
    });
}

window.send = (what) => {
    let payload = buildPayload(what);
    if(payload !== null) {
        handle(payload);
        connections.forEach(c => c.send(payload));
    }
};
