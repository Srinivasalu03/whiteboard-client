import React, { useRef, useEffect, useState } from 'react';
import { socket } from '../socket';

// Receives 'isMyTurn' prop
function Whiteboard({ room, color, lineWidth, isMyTurn }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    // --- THIS IS THE FIX ---
    // We use a fixed-size canvas. It will not resize and
    // will not be cleared when the window is maximized.
    canvas.width = 800;
    canvas.height = 600;
    // --- END FIX ---
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    contextRef.current = context;
  }, []);

  // Update context when color or width props change
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]); // Re-runs when color or lineWidth changes

  // Setup socket listeners (no change here, all listeners are always on)
  useEffect(() => {
    const onStartDrawing = ({ x, y, color: receivedColor, lineWidth: receivedLineWidth }) => {
      console.log('[CLIENT] Receiving: server-start-drawing');
      contextRef.current.strokeStyle = receivedColor;
      contextRef.current.lineWidth = receivedLineWidth;
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    };

    const onDrawing = ({ x, y, color: receivedColor, lineWidth: receivedLineWidth }) => {
      contextRef.current.strokeStyle = receivedColor;
      contextRef.current.lineWidth = receivedLineWidth;
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    };

    const onFinishDrawing = () => {
      console.log('[CLIENT] Receiving: server-finish-drawing');
      contextRef.current.closePath();
    };

    const onClearCanvas = () => {
      console.log('[CLIENT] Receiving: server-clear-canvas');
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    socket.on('server-start-drawing', onStartDrawing);
    socket.on('server-drawing', onDrawing);
    socket.on('server-finish-drawing', onFinishDrawing);
    socket.on('server-clear-canvas', onClearCanvas);

    return () => {
      socket.off('server-start-drawing', onStartDrawing);
      socket.off('server-drawing', onDrawing);
      socket.off('server-finish-drawing', onFinishDrawing);
      socket.off('server-clear-canvas', onClearCanvas);
    };
  }, []);

  // --- MODIFIED: Add 'isMyTurn' check ---
  const startDrawing = ({ nativeEvent }) => {
    // Block drawing if it's not our turn
    if (!isMyTurn) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    console.log('[CLIENT] Emitting: start-drawing');
    socket.emit('start-drawing', {
      x: offsetX,
      y: offsetY,
      room: room,
      color: color,
      lineWidth: lineWidth
    });
  };

  const finishDrawing = () => {
    // No 'isMyTurn' check here, because 'isDrawing' will be false
    // if startDrawing was blocked.
    if (!isDrawing) return;

    contextRef.current.closePath();
    setIsDrawing(false);

    console.log('[CLIENT] Emitting: finish-drawing');
    socket.emit('finish-drawing', { room: room });
  };

  const draw = ({ nativeEvent }) => {
    // Block drawing if it's not our turn OR if not drawing
    if (!isDrawing || !isMyTurn) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    socket.emit('drawing', {
      x: offsetX,
      y: offsetY,
      room: room,
      color: color,
      lineWidth: lineWidth
    });
  };

  return (
    <div className="whiteboard-container">
      <canvas
        // --- NEW: Add 'disabled' class based on turn ---
        className={!isMyTurn ? 'disabled' : ''}
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
      />
    </div>
  );
}

export default Whiteboard;

