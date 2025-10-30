import React from 'react';
import './Toolbar.css';

function Toolbar({
  tool,
  setTool,
  setUserColor,
  setLineWidth,
  handleClearCanvas,
  isMyTurn,
  handlePassTurn
}) {

  return (
    <div className="toolbar-container">
      {/* --- TOOL SELECTION --- */}
      <div className="toolbar-section">
        <button
          className={`toolbar-button ${tool === 'pencil' ? 'active' : ''}`}
          onClick={() => setTool('pencil')}
          disabled={!isMyTurn}
        >
          Pencil
        </button>
        <button
          className={`toolbar-button ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          disabled={!isMyTurn}
        >
          Eraser
        </button>
      </div>

      {/* --- STYLE SELECTION --- */}
      <div className="toolbar-section">
        <label htmlFor="color-picker">Color</label>
        <input
          id="color-picker"
          type="color"
          defaultValue="#000000"
          onChange={(e) => setUserColor(e.target.value)}
          disabled={!isMyTurn}
        />
      </div>
      <div className="toolbar-section">
        <label htmlFor="line-width">Width</label>
        <input
          id="line-width"
          type="range"
          min="1"
          max="20"
          defaultValue="5"
          onChange={(e) => setLineWidth(e.target.value)}
          disabled={!isMyTurn}
        />
      </div>

      {/* --- ACTIONS --- */}
      <div className="toolbar-section">
        <button
          className="toolbar-button action"
          onClick={handleClearCanvas}
          disabled={!isMyTurn}
        >
          Clear All
        </button>

        {isMyTurn && (
          <button
            className="toolbar-button pass-turn"
            onClick={handlePassTurn}
          >
            Pass Turn
          </button>
        )}
      </div>
    </div>
  );
}

export default Toolbar;

