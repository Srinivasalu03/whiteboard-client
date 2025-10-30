import { io } from 'socket.io-client';

// URL of our backend server
const URL = 'https://whiteboard-server-0tkj.onrender.com';

// Create the socket instance
// 'autoConnect: false' means it won't connect until we explicitly call socket.connect()
export const socket = io(URL, {
    autoConnect: false
});
