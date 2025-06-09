/* to run this you need to

npm install peerjs         
npm install node-pre-gyp   
npm install wrtc           
npm install ws             

*/

const wrtc = require('wrtc');
global.RTCPeerConnection = wrtc.RTCPeerConnection;
global.RTCSessionDescription = wrtc.RTCSessionDescription;
global.RTCIceCandidate = wrtc.RTCIceCandidate;
global.WebSocket = require('ws');

const { Peer } = require('peerjs');
const readline = require('readline');
global.window = {}; // basic fake window
const { Room } = require('./room'); // assumes you adapt room.js for Node

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let username = 'anon';

const room = new Room({
  onLog: (msg) => console.log(msg),
  onUsersUpdate: (users) => {
    console.log('\n[Users]');
    for (let peerId in users) {
        let u = users[peerId];
        console.log('- ' + u);
    }
  },
  onMessage: (data) => {
    let txt = '';
    if (data.what === 'reveal') {
      txt = '[Reveal] ' + JSON.stringify(data); // implement handleReveal if needed
    } else if (data.what === 'nick') {
      txt = `Nickname: ${data.usr}`;
    } else if (data.what === 'msg') {
      txt = `${data.usr}: ${data.msg}`;
    } else if (data.what === 'clear') {
      console.clear();
      txt = `* Chat cleared by ${data.usr}`;
    }
    console.log(txt);
  },
  buildPayload: (what) => {
    return {
      what,
      msg: lastMsg
    };
  },
  getUsername: () => username,
  myLocation: new URL('http://localhost:3000')
});

let lastMsg = '';

room.init();

rl.question('Enter your username: ', (name) => {
  username = name || 'anon';
  room.send('nick');
  prompt();
});

function prompt() {
  rl.question('', (input) => {
    if (input === '/clear') {
      room.send('clear');
    } else if (input.startsWith('/nick ')) {
      username = input.split(' ')[1];
      room.send('nick');
    } else {
      lastMsg = input;
      room.send('msg');
    }
    prompt();
  });
}
