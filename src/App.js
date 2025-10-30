import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import './App.css';
import Whiteboard from './components/Whiteboard';
import Toolbar from './components/Toolbar';
import TurnStatusBar from './components/TurnStatusBar'; // <-- NEW

const roomName = "main-room";

function App() {
  const [userColor, setUserColor] = useState('#000000');
  const [tool, setTool] = useState('pencil');
  const [lineWidth, setLineWidth] = useState(5);

  const [activeSocketId, setActiveSocketId] = useState(null);
  const isMyTurn = socket.id === activeSocketId;

  const activeColor = tool === 'pencil' ? userColor : '#FFFFFF';

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      console.log('Connected to server! My ID:', socket.id);
      socket.emit('join-room', roomName);
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      setActiveSocketId(null);
    });
    socket.on('turn-update', (newActiveSocketId) => {
      console.log(`[CLIENT] Turn update. Active user: ${newActiveSocketId}`);
      setActiveSocketId(newActiveSocketId);
    });
    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('disconnect');
      socket.off('turn-update');
    };
  }, []);

  const handleClearCanvas = () => {
    console.log('[CLIENT] Emitting: clear-canvas');
    socket.emit('clear-canvas', { room: roomName });
  };

  const handlePassTurn = () => {
    console.log('[CLIENT] Emitting: pass-turn');
    socket.emit('pass-turn', { room: roomName });
  };

  return (
    <> {/* Use a Fragment to hold the two top-level components */}
      <TurnStatusBar
        activeSocketId={activeSocketId}
        isMyTurn={isMyTurn}
      />

      <div className="app-container">
        <Toolbar
          tool={tool}
          setTool={setTool}
          setUserColor={setUserColor}
          setLineWidth={setLineWidth}
          handleClearCanvas={handleClearCanvas}
          isMyTurn={isMyTurn}
          handlePassTurn={handlePassTurn}
        />

        {/* This container just centers the whiteboard */}
        <div className="whiteboard-area">
          <Whiteboard
            room={roomName}
            color={activeColor}
            lineWidth={lineWidth}
            isMyTurn={isMyTurn}
          />
        </div>
      </div>
    </>
  );
}

export default App;

