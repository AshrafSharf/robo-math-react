import React, { useState, useEffect, useCallback } from 'react';
import './PlaybackBar.css';

/**
 * PlaybackBar - Floating video-player-like toolbar for interactive command playback.
 *
 * Props:
 *   controller - InteractiveCommandController instance
 *   onClose - Callback when close button is clicked
 */
const PlaybackBar = ({ controller, onClose }) => {
    const [state, setState] = useState({
        currentIndex: 0,
        totalCommands: 0,
        isPlaying: false,
        isExecuting: false,
        canNext: false,
        canPrevious: false
    });

    // Subscribe to controller state changes
    useEffect(() => {
        if (!controller) return;

        const handleStateChange = (newState) => {
            setState(newState);
        };

        controller.onStateChange = handleStateChange;

        // Get initial state
        setState(controller.getCurrentState());

        return () => {
            controller.onStateChange = null;
        };
    }, [controller]);

    const handlePrevious = useCallback(async () => {
        if (controller && state.canPrevious && !state.isExecuting) {
            await controller.playPrevious();
        }
    }, [controller, state.canPrevious, state.isExecuting]);

    const handleNext = useCallback(async () => {
        if (controller && state.canNext && !state.isExecuting) {
            await controller.playNext();
        }
    }, [controller, state.canNext, state.isExecuting]);

    const handlePlayStop = useCallback(async () => {
        if (!controller) return;

        if (state.isPlaying) {
            controller.stop();
        } else {
            await controller.play();
        }
    }, [controller, state.isPlaying]);

    const handleClose = useCallback(() => {
        if (controller) {
            controller.stop();
        }
        if (onClose) {
            onClose();
        }
    }, [controller, onClose]);

    return (
        <div className="playback-bar">
            <div className="playback-controls">
                <button
                    className="playback-btn"
                    onClick={handlePrevious}
                    disabled={!state.canPrevious || state.isExecuting}
                    title="Previous"
                >
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
                    </svg>
                </button>

                <button
                    className="playback-btn play-stop-btn"
                    onClick={handlePlayStop}
                    disabled={!state.canNext && !state.isPlaying}
                    title={state.isPlaying ? "Stop" : "Play"}
                >
                    {state.isPlaying ? (
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M6 6h12v12H6V6z"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8 5v14l11-7L8 5z"/>
                        </svg>
                    )}
                </button>

                <button
                    className="playback-btn"
                    onClick={handleNext}
                    disabled={!state.canNext || state.isExecuting}
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
                    onClick={handleClose}
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
