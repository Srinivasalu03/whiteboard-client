import React from 'react';
import './TurnStatusBar.css'; // We'll create this CSS file next

function TurnStatusBar({ activeSocketId, isMyTurn }) {
    return (
        <div className="turn-status-bar">
            {activeSocketId ? (
                isMyTurn ? (
                    <span className="my-turn">It's YOUR turn to draw!</span>
                ) : (
                    <span className="spectator-turn">It's {activeSocketId}'s turn. Spectating...</span>
                )
            ) : (
                <span className="spectator-turn">Connecting...</span>
            )}
        </div>
    );
}

export default TurnStatusBar;
