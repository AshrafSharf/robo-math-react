import { useState, useEffect, useCallback } from 'react';
import { playbackMediator } from '../engine/playback/PlaybackMediator.js';

/**
 * React hook for PlaybackMediator - single source of truth
 */
export function usePlaybackMediator() {
    const [state, setState] = useState(playbackMediator.getState());

    useEffect(() => {
        return playbackMediator.subscribe(setState);
    }, []);

    const pause = useCallback(() => playbackMediator.pause(), []);
    const resume = useCallback(() => playbackMediator.resume(), []);
    const stop = useCallback(() => playbackMediator.stop(), []);

    return {
        ...state,
        pause,
        resume,
        stop
    };
}
