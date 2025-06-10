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

global.window = {}; // fake window for PeerJS
const { Peer } = require('peerjs');
const { Room } = require('./room'); // your adapted room.js

const blessed = require('blessed');

function userColor(user) {
    // generate a color based on the username
    let hash = 0;
    for (let i = 0; i < user.length; i++) {
        hash = user.charCodeAt(i) + ((hash << 5) - hash);
    }
    return '#' + ((hash & 0x00FFFFFF).toString(16).padStart(6, '0'));
}

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'P2P Chat',
});

// Chat box
const chatBox = blessed.box({
  top: 0,
  left: 0,
  width: '85%',
  height: '90%',
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { style: { bg: 'white' } },
  border: { 
    type: 'line',
    bottom: true,
    left: false,
    right: false,
    top: false,
  },
});

const usersBox = blessed.box({
  top: 0,
  right: 0,
  width: '15%',
  height: '90%',
  tags: true,
  scrollable: true,
  alwaysScroll: true,
  scrollbar: { style: { bg: 'white' } },
  border: { 
    type: 'line',
    bottom: false,
    left: true,
    right: false,
    top: false,
  },
});

// Input box
const input = blessed.textbox({
  bottom: 0,
  left: 2,
  height: '10%',
  width: '100%',
  inputOnFocus: true,
});

// Append and render
screen.append(chatBox);
screen.append(usersBox);
screen.append(input);
input.focus();
screen.render();

let username = 'anon';

if (process.argv.length <= 2) {
  logLine('Usage: node chat.js <username> [hash]');
  logLine('Example: node chat.js myUserName');
  logLine('Example: node chat.js myUserName myHash');
  process.exit(1);
}

username = process.argv[2].trim();

let lastMsg = '';
let myLocation = new URL('http://localhost:3000');
if (process.argv.length > 3) {
  const hash = process.argv[3];
  myLocation = new URL(myLocation.href + "#" + hash);
}

const room = new Room({
  onLog: (msg) => logLine(`[log] ${msg}`),
  onUsersUpdate: (users) => {
    usersBox.setContent('Users:\n');
    for (let peerId in users) {
      usersBox.pushLine('- ' + `{${userColor(users[peerId])}-fg}${users[peerId]}{/}`);
    }
    screen.render();
  },
  onMessage: (data) => {
    if (data.what === 'reveal') {
      logLine('[Reveal] ' + JSON.stringify(data));
    } else if (data.what === 'nick') {
      logLine(`Nickname: ${data.usr}`);
    } else if (data.what === 'msg') {
      logLine(`{${userColor(data.usr)}-fg}${data.usr}{/}: ${data.msg}`);
    } else if (data.what === 'clear') {
      chatBox.setContent('');
    }
    screen.render();
  },
  buildPayload: (what) => ({
    what,
    msg: lastMsg,
  }),
  getUsername: () => username,
  myLocation: myLocation,
});

room.init();

function logLine(text) {
  chatBox.pushLine(text);
  chatBox.setScrollPerc(100);
  screen.render();
}

function handleInput(text) {
  if (!text) return;

  if (text === '/clear') {
    room.send('clear');
  } else if (text.startsWith('/nick ')) {
    username = text.split(' ')[1];
    room.send('nick');
  } else if (text === '/quit') {
    room.send('disconnect');
    logLine('You have left the chat.');
    screen.render();
    room.close();
    process.exit(0);
  } else {
    lastMsg = text;
    room.send('msg');
  }
}

input.on('submit', (text) => {
  handleInput(text.trim());
  input.clearValue();
  screen.render();
  input.focus();
});

// Exit keys  
screen.key(['C-c', 'q', 'escape'], () => process.exit(0));
