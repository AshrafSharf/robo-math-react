import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PlaybackBar.css';

/**
 * PlaybackBar - Floating video-player-like toolbar for interactive command playback.
 *
 * React = dumb UI shell. Only two jobs:
 * 1. Subscribe to state → trigger re-render
 * 2. Button onClick → call controller method
 *
 * Props:
 *   controller - CommandEditorController instance
 *   onClose - Callback when close button is clicked
 */
const PlaybackBar = ({ controller, onClose }) => {
    const [state, setState] = useState(controller.getInteractiveState());
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Subscribe to interactive state changes
    useEffect(() => {
        if (!controller) return;

        controller.onInteractiveStateChange = setState;

        return () => {
            controller.onInteractiveStateChange = null;
        };
    }, [controller]);

    const handleMouseDown = useCallback((e) => {
        // Only drag from the bar itself, not buttons
        if (e.target.closest('button')) return;

        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        e.preventDefault();
    }, [position]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        setPosition({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const isIdle = state.playState === 'idle';
    const isPlaying = state.playState === 'playing';
    const isAnimating = state.animatingState === 'active';
    const isPaused = state.animatingState === 'paused';

    return (
        <div
            className={`playback-bar ${isDragging ? 'dragging' : ''}`}
            style={{ transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)` }}
            onMouseDown={handleMouseDown}
            ref={dragRef}
        >
            <div className="playback-controls">
                <button
                    className="playback-btn"
                    onClick={() => controller.playPreviousInteractive()}
                    disabled={!state.canPrevious || isPaused}
                    title="Previous"
                >
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
                    </svg>
                </button>

                {/* Play/Stop button based on playState */}
                {isIdle ? (
                    <button
                        className="playback-btn play-btn"
                        onClick={() => controller.playInteractive()}
                        disabled={!state.canNext}
                        title="Play"
                    >
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8 5v14l11-7L8 5z"/>
                        </svg>
                    </button>
                ) : (
                    <button
                        className="playback-btn stop-btn"
                        onClick={() => controller.stopAndDrawInteractive()}
                        title="Stop"
                    >
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M6 6h12v12H6z"/>
                        </svg>
                    </button>
                )}

                {/* Pause/Resume button slot - fixed width container */}
                <div className="pause-btn-slot">
                    {(isAnimating || isPaused) && (
                        <button
                            className="playback-btn pause-btn"
                            onClick={() => isPaused ? controller.resumeInteractive() : controller.pauseInteractive()}
                            title={isPaused ? "Resume" : "Pause"}
                        >
                            {isPaused ? (
                                <svg viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M8 5v14l11-7L8 5z"/>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                <button
                    className="playback-btn"
                    onClick={() => controller.playNextInteractive()}
                    disabled={!state.canNext || isPaused}
                    title="Next"
                >
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z"/>
                    </svg>
                </button>

                <span className="playback-progress">
                    {state.currentIndex} / {state.totalCommands}
                </span>

                <button
                    className="playback-btn close-btn"
                    onClick={onClose}
                    title="Close"
                >
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PlaybackBar;
