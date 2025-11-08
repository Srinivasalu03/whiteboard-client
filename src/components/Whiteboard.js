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
    canvas.width = 800;
    canvas.height = 600;
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

  // Setup socket listeners
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

  // --- MOUSE HANDLERS (No Change) ---
  const startDrawing = ({ nativeEvent }) => {
    if (!isMyTurn) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    console.log('[CLIENT] Emitting: start-drawing');
    socket.emit('start-drawing', {
      x: offsetX, y: offsetY, room, color, lineWidth
    });
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    console.log('[CLIENT] Emitting: finish-drawing', { room });
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || !isMyTurn) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    socket.emit('drawing', {
      x: offsetX, y: offsetY, room, color, lineWidth
    });
  };

  // --- NEW TOUCH HANDLERS ---
  const getTouchCoords = (e) => {
    const touch = e.touches[0];
    const { left, top } = canvasRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - left;
    const offsetY = touch.clientY - top;
    return { offsetX, offsetY };
  };

  const handleTouchStart = (e) => {
    // Prevent screen scrolling while drawing
    e.preventDefault();
    if (!isMyTurn) return;
    const { offsetX, offsetY } = getTouchCoords(e);
    startDrawing({ nativeEvent: { offsetX, offsetY } });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing || !isMyTurn) return;
    const { offsetX, offsetY } = getTouchCoords(e);
    draw({ nativeEvent: { offsetX, offsetY } });
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    finishDrawing();
  };
  // --- END NEW TOUCH HANDLERS ---

  return (
    <div className="whiteboard-container">
      <canvas
        className={!isMyTurn ? 'disabled' : ''}
        ref={canvasRef}
        // Mouse Events
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        // NEW Touch Events
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      />
    </div>
  );
}

export default Whiteboard;